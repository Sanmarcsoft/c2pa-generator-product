import { Construct } from "constructs";
import { App, GcsBackend, TerraformOutput, TerraformStack } from "cdktf";
import {
  provider,
  storageBucket,
  computeGlobalAddress,
  computeBackendBucket,
  computeUrlMap,
  computeSecurityPolicy,
  computeBackendBucketSignedUrlKey,
  storageBucketIamMember,
  computeTargetHttpProxy,
  computeGlobalForwardingRule,
  secretManagerSecret,
  secretManagerSecretVersion,
  storageDefaultObjectAccessControl,
  dnsRecordSet,
  cloudRunServiceIamPolicy,
  cloudRunService,
  sqlUser,
  identityPlatformTenant,
  sqlDatabaseInstance,
  dnsManagedZone,
  dataGoogleIamPolicy,
  computeSubnetwork,
  serviceNetworkingConnection,
  computeRouterNat,
  computeRouter,
  vpcAccessConnector,
  computeNetwork,
  computeManagedSslCertificate,
  computeTargetHttpsProxy,
  projectIamMember,
  cloudRunDomainMapping,
} from "@cdktf/provider-google";
import { RandomProvider } from "@cdktf/provider-random/lib/provider"
import { Id } from "@cdktf/provider-random/lib/id";
import * as path from "path";
import * as fs from "fs";

interface Secrets {
  global: {
    domain: string;
    tfStateBucket: string;
    projectId: string;
    projectNum: string;
    region: string;
    zone: string;
    vpc: {
      name: string;
      ipCidrRange: string;
      connectorMaxThroughput: number;
    };
    db: {
      version: string;
      tier: string;
      retainedBackups: number;
      transactionLogRetentionDays: number;
      backupStartTime: string;
    };
    api: {
      imageBase: string;
      memory: string;
      minScale: string;
      maxScale: string;
      requestTimeout: number;
      envVars: { [key: string]: string };
    };
    frontend: {
      envVars: { [key: string]: string };
    };
  };
  tenants: {
    name: string;
    apiImageTag: string;
    verifiedDomain: string;
    labels: { [key: string]: string };
    apiEnvVars: { [key: string]: string };
    frontendEnvVars: { [key: string]: string };
    secureStorageEnvVars: { [key: string]: string };
    db: {
      user: string;
      password: string;
    };
  }[];
}

class Trace8Env extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const secretsPath = path.join(process.cwd(), "secrets.json");
    const secrets = fs.existsSync(secretsPath)
      ? (JSON.parse(fs.readFileSync(secretsPath).toString()) as Secrets)
      : undefined;

    if (!secrets) {
      throw new Error("Missing secrets.json");
    }

    const credentialsPath = path.join(process.cwd(), "google.json");
    const credentials = fs.existsSync(credentialsPath)
      ? fs.readFileSync(credentialsPath).toString()
      : undefined;

    if (!credentials) {
      throw new Error("Missing google.json");
    }

    new RandomProvider(this, "random", {});

    /*
      Google Provider
    */

    new provider.GoogleProvider(this, "google", {
      project: secrets.global.projectId,
      region: secrets.global.region,
      zone: secrets.global.zone,
      credentials,
    });

    new GcsBackend(this, {
      bucket: secrets.global.tfStateBucket,
      credentials,
    });

    /*
      Google Provider
    */

    /*
      VPC
    */

    const vpc = new computeNetwork.ComputeNetwork(this, "vpc", {
      name: secrets.global.vpc.name,
      autoCreateSubnetworks: false,
      routingMode: "REGIONAL",
    });

    const vpcConnector = new vpcAccessConnector.VpcAccessConnector(this, "vpc-connector", {
      name: `${secrets.global.vpc.name}-connector`,
      network: vpc.name,
      ipCidrRange: secrets.global.vpc.ipCidrRange,
      maxThroughput: secrets.global.vpc.connectorMaxThroughput,
    });

    const vpcRouter = new computeRouter.ComputeRouter(this, "vpc-router", {
      name: `${secrets.global.vpc.name}-router`,
      network: vpc.name,
    });

    new computeRouterNat.ComputeRouterNat(this, "vpc-router-nat", {
      name: `${secrets.global.vpc.name}-router-nat`,
      router: vpcRouter.name,
      sourceSubnetworkIpRangesToNat: "ALL_SUBNETWORKS_ALL_IP_RANGES",
      natIpAllocateOption: "AUTO_ONLY",
    });

    const vpcGlobalAddress = new computeGlobalAddress.ComputeGlobalAddress(
      this,
      "vpc-global-address",
      {
        name: `${secrets.global.vpc.name}-global-address`,
        purpose: "VPC_PEERING",
        addressType: "INTERNAL",
        prefixLength: 16,
        network: vpc.id,
      }
    );

    new serviceNetworkingConnection.ServiceNetworkingConnection(this, "vpc-networking-connection", {
      network: vpc.id,
      service: "servicenetworking.googleapis.com",
      reservedPeeringRanges: [vpcGlobalAddress.name],
    });

    new computeSubnetwork.ComputeSubnetwork(this, "vpc-private-subnetwork", {
      name: `${secrets.global.vpc.name}-private-subnetwork`,
      ipCidrRange: "10.128.0.0/20",
      privateIpGoogleAccess: true,
      network: vpc.name,
      privateIpv6GoogleAccess: "DISABLE_GOOGLE_ACCESS",
      purpose: "PRIVATE",
    });

    /*
      VPC
    */

    const unauthenticatedPolicy = new dataGoogleIamPolicy.DataGoogleIamPolicy(
      this,
      "unauthenticated-policy",
      {
        binding: [
          {
            role: "roles/run.invoker",
            members: ["allUsers"],
          },
        ],
      }
    );

    const globalApiEnvVars = Object.entries(secrets.global.api.envVars).map(
      ([key, value]) => ({ name: key, value })
    );

    const googleDnsManagedZone = new dnsManagedZone.DnsManagedZone(this, "dns-managed-zone", {
      name: "trace8-io",
      dnsName: `${secrets.global.domain}.`,
    });

    for (const tenant of secrets.tenants) {

      /* 
        DB
      */

      const db = new sqlDatabaseInstance.SqlDatabaseInstance(this, `${tenant.name}-db`, {
        name: `${tenant.name}-db`,
        deletionProtection: false,
        databaseVersion: secrets.global.db.version,
        settings: {
          tier: secrets.global.db.tier,
          pricingPlan: "PER_USE",
          activationPolicy: "ALWAYS",
          availabilityType: "ZONAL",
          backupConfiguration: {
            backupRetentionSettings: {
              retainedBackups: secrets.global.db.retainedBackups,
              retentionUnit: "COUNT",
            },
            enabled: true,
            location: "us",
            pointInTimeRecoveryEnabled: true,
            startTime: secrets.global.db.backupStartTime,
            transactionLogRetentionDays:
              secrets.global.db.transactionLogRetentionDays,
          },
          diskAutoresize: true,
          diskAutoresizeLimit: 0,
          diskSize: 10,
          diskType: "PD_SSD",
          ipConfiguration: {
            ipv4Enabled: true,
            privateNetwork: vpc.id,
          },
          locationPreference: {
            zone: secrets.global.zone,
          },
        },
      });

      const dbUser = new sqlUser.SqlUser(this, `${tenant.name}-sql-user`, {
        name: tenant.db.user,
        password: tenant.db.password,
        instance: db.name,
      });

      /* 
        DB
      */

      /* 
        Identity Platform Tenant
      */

      const idpTenant = new identityPlatformTenant.IdentityPlatformTenant(
        this,
        `${tenant.name}-idp-tenant`,
        {
          displayName: tenant.name,
          allowPasswordSignup: true,
        }
      );

      /* 
        Identity Platform Tenant
      */

      /*
        API
      */

      const tenantApiEnvVars = Object.entries(tenant.apiEnvVars).map(
        ([key, value]) => ({ name: key, value })
      );

      const dbApiEnvVars = [
        {
          name: "DB_TYPE",
          value: "postgres",
        },
        {
          name: "POSTGRES_HOST",
          value: db.privateIpAddress,
        },
        {
          name: "POSTGRES_USER",
          value: dbUser.name,
        },
        {
          name: "POSTGRES_PASSWORD",
          value: dbUser.password,
        },
        {
          name: "POSTGRES_DB",
          value: "postgres",
        },
      ];

      const api = new cloudRunService.CloudRunService(this, `${tenant.name}-api`, {
        name: tenant.name,
        location: secrets.global.region,
        autogenerateRevisionName: true,
        template: {
          metadata: {
            labels: tenant.labels,
            namespace: secrets.global.projectId,
            annotations: {
              "autoscaling.knative.dev/minScale": secrets.global.api.minScale,
              "autoscaling.knative.dev/maxScale": secrets.global.api.maxScale,
              "run.googleapis.com/vpc-access-egress": "all-traffic",
              "run.googleapis.com/vpc-access-connector": vpcConnector.name,
              "run.googleapis.com/cloudsql-instances": db.connectionName,
            },
          },
          spec: {
            timeoutSeconds: 60,
            containers: [
              {
                ports: [{ containerPort: 3333 }],
                image: `${secrets.global.api.imageBase}${tenant.apiImageTag}`,
                env: [
                  ...globalApiEnvVars,
                  ...tenantApiEnvVars,
                  ...dbApiEnvVars,
                  {
                    name: "TENANT_ID",
                    value: idpTenant.name,
                  },
                ],
                resources: {
                  limits: {
                    memory: secrets.global.api.memory,
                    cpu: "1000m"
                  },
                },
              },
            ],
          },
        },
        metadata: {
          annotations: {
            "run.googleapis.com/launch-stage": "BETA",
            "run.googleapis.com/ingress": "all",
          },
        },
        traffic: [
          {
            latestRevision: true,
            percent: 100,
          },
        ],
      });

      new cloudRunServiceIamPolicy.CloudRunServiceIamPolicy(
        this,
        `${tenant.name}-api-unauthenticated-policy`,
        {
          location: api.location,
          service: api.name,
          policyData: unauthenticatedPolicy.policyData,
        }
      );

      const apiDomain = `api.${tenant.verifiedDomain}`;

      new cloudRunDomainMapping.CloudRunDomainMapping(this, `${tenant.name}-api-domain`, {
        location: api.location,
        name: apiDomain,
        metadata: {
          namespace: secrets.global.projectId,
          labels: tenant.labels,
        },
        spec: {
          routeName: api.name,
        },
      });

      new dnsRecordSet.DnsRecordSet(this, `${tenant.name}-api-dns-record`, {
        name: `api.${tenant.verifiedDomain}.`,
        type: "CNAME",
        rrdatas: ["ghs.googlehosted.com."],
        managedZone: googleDnsManagedZone.name,
        ttl: 300,
      });

      new TerraformOutput(this, `${tenant.name}-api-url`, {
        value: api.status.get(0).url,
      });

      /*
        API
      */

      /*
        Frontend
      */

      const frontendBucket = new storageBucket.StorageBucket(
        this,
        `${tenant.name}-${secrets.global.projectId}-frontend`,
        {
          location: "US",
          name: `${tenant.name}-${secrets.global.projectId}-trace8-frontend`,
          storageClass: "STANDARD",
          uniformBucketLevelAccess: false,
          website: {
            mainPageSuffix: "index.html",
            notFoundPage: "index.html",
          },
          forceDestroy: true,
          labels: tenant.labels,
        }
      );

      new storageDefaultObjectAccessControl.StorageDefaultObjectAccessControl(
        this,
        `${tenant.name}-frontend-public-read-access-control`,
        {
          bucket: frontendBucket.name,
          role: "READER",
          entity: "allUsers",
        }
      );

      const frontendGlobalAddress = new computeGlobalAddress.ComputeGlobalAddress(
        this,
        `${tenant.name}-frontend-global-address`,
        {
          name: `${tenant.name}-frontend`,
        }
      );

      const cdnBucket = new computeBackendBucket.ComputeBackendBucket(
        this,
        `${tenant.name}-cdn-bucket`,
        {
          name: `${tenant.name}-cdn-bucket`,
          bucketName: frontendBucket.name,
          enableCdn: false,
        }
      );

      const frontendUrlMap = new computeUrlMap.ComputeUrlMap(
        this,
        `${tenant.name}-frontend-load-balancer`,
        {
          name: `${tenant.name}-frontend-load-balancer`,
          defaultService: cdnBucket.selfLink,
        }
      );

      const redirectUrlMap = new computeUrlMap.ComputeUrlMap(
        this,
        `${tenant.name}-frontend-url-https-redirect-map`,
        {
          name: `${tenant.name}-frontend-url-https-redirect-map`,
          defaultUrlRedirect: {
            httpsRedirect: true,
            redirectResponseCode: "MOVED_PERMANENTLY_DEFAULT",
            stripQuery: false,
          },
        }
      );

      const frontendHttpProxy = new computeTargetHttpProxy.ComputeTargetHttpProxy(
        this,
        `${tenant.name}-http-proxy`,
        {
          name: `${tenant.name}-http-proxy`,
          urlMap: redirectUrlMap.selfLink,
        }
      );

      const frontendDnsRecord = new dnsRecordSet.DnsRecordSet(
        this,
        `${tenant.name}-dns-record-set`,
        {
          name: `${tenant.verifiedDomain}.`,
          type: "A",
          ttl: 300,
          managedZone: googleDnsManagedZone.name,
          rrdatas: [frontendGlobalAddress.address],
        }
      );

      const sslCertificate = new computeManagedSslCertificate.ComputeManagedSslCertificate(
        this,
        `${tenant.name}-frontend-ssl-certificate`,
        {
          name: `${tenant.name}-frontend-ssl-certificate`,
          managed: {
            domains: [frontendDnsRecord.name],
          },
        }
      );

      const frontendHttpsProxy = new computeTargetHttpsProxy.ComputeTargetHttpsProxy(
        this,
        `${tenant.name}-https-proxy`,
        {
          name: `${tenant.name}-https-proxy`,
          quicOverride: "NONE",
          urlMap: frontendUrlMap.selfLink,
          sslCertificates: [sslCertificate.selfLink],
        }
      );

      new computeGlobalForwardingRule.ComputeGlobalForwardingRule(
        this,
        `${tenant.name}-https-forwarding-rule`,
        {
          name: `${tenant.name}-https-forwarding-rule`,
          ipAddress: frontendGlobalAddress.address,
          loadBalancingScheme: "EXTERNAL_MANAGED",
          ipProtocol: "TCP",
          portRange: "443",
          target: frontendHttpsProxy.selfLink,
        }
      );

      new computeGlobalForwardingRule.ComputeGlobalForwardingRule(
        this,
        `${tenant.name}-http-forwarding-rule`,
        {
          name: `${tenant.name}-http-forwarding-rule`,
          ipAddress: frontendGlobalAddress.address,
          loadBalancingScheme: "EXTERNAL_MANAGED",
          ipProtocol: "TCP",
          portRange: "80",
          target: frontendHttpProxy.selfLink,
        }
      );

      const frontendSecret = new secretManagerSecret.SecretManagerSecret(
        this,
        `${tenant.name}-frontend-secrets`,
        {
          secretId: `${tenant.name}-frontend-secrets`,
          replication: {
            automatic: true,
          },
        }
      );

      new secretManagerSecretVersion.SecretManagerSecretVersion(
        this,
        `${tenant.name}-frontend-secrets-version-${tenant.frontendEnvVars["version"]}`,
        // TODO - update backend base url - NEXT_PUBLIC_BACKEND_BASE_URL=https://${apiDomain}
        {
          secret: frontendSecret.id,
          secretData: `NEXT_APP_SERVER_ENV=${tenant.frontendEnvVars["NEXT_APP_SERVER_ENV"]}
NEXT_PUBLIC_BACKEND_BASE_URL=https://sample-e5e55wgtaq-uc.a.run.app
NEXT_PUBLIC_FIREBASE_API_KEY=${secrets.global.frontend.envVars["NEXT_PUBLIC_FIREBASE_API_KEY"]}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${secrets.global.projectId}.firebaseapp.com
NEXT_PUBLIC_FIREBASE_TENANT_ID=${idpTenant.name}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${secrets.global.projectId}
          `,
        }
      );

      /*
        Frontend
      */

      /*
        Secure Storage
      */

      const secureStorageBucket = new storageBucket.StorageBucket(
        this,
        `${tenant.name}-${secrets.global.projectId}-secure-storage-bucket`,
        {
          name: `${tenant.name}-${secrets.global.projectId}-trace8-secure-storage`,
          location: "US",
          forceDestroy: true,
          publicAccessPrevention: "enforced",
          uniformBucketLevelAccess: true,
        }
      );

      const secureStorageEdgeSecurityPolicy = new computeSecurityPolicy.ComputeSecurityPolicy(
        this,
        `${tenant.name}-secure-storage-edge-security-policy`,
        {
          name: `${tenant.name}-secure-storage-edge-security-policy`,
          type: "CLOUD_ARMOR_EDGE",
          description: "US-only traffic policy",
          rule: [
            {
              action: "allow",
              priority: 1000,
              match: {
                expr: {
                  expression: `origin.region_code == 'US'`
                }
              },
              description: "Allow access to US-based IPs",
            },
            {
              action: "deny(403)",
              priority: 2147483647,
              match: {
                versionedExpr: "SRC_IPS_V1",
                config: {
                  srcIpRanges: ["*"],
                },
              },
              description: "Deny public access",
            }
          ]
        }
      );
  
      const secureStorageCdnBackend = new computeBackendBucket.ComputeBackendBucket(
        this,
        `${tenant.name}-secure-storage-cdn-backend`,
        {
          name: `${tenant.name}-secure-storage-cdn-backend`,
          bucketName: secureStorageBucket.name,
          edgeSecurityPolicy: secureStorageEdgeSecurityPolicy.selfLink,
          enableCdn: true,
        }
      );
  
      const secureStorageCdnGlobalAddress = new computeGlobalAddress.ComputeGlobalAddress(
        this,
        `${tenant.name}-secure-storage-cdn-global-address`,
        {
          name: `${tenant.name}-secure-storage-cdn-global-address`,
        }
      );
  
      const secureStorageCdnUrlMap = new computeUrlMap.ComputeUrlMap(
        this,
        `${tenant.name}-secure-storage-cdn-load-balancer`,
        {
          name: `${tenant.name}-secure-storage-cdn-load-balancer`,
          defaultService: secureStorageCdnBackend.selfLink,
        }
      );
  
      const urlSignature = new Id(
        this,
        "url-signature",
        {
          byteLength: 16
        }
      )
  
      const secureStorageCdnKey = new computeBackendBucketSignedUrlKey.ComputeBackendBucketSignedUrlKey(
        this,
        `${tenant.name}-secure-storage-cdn-signing-key`,
        {
          name: `${tenant.name}-secure-storage-cdn-signing-key`,
          keyValue: urlSignature.b64Url,
          backendBucket: secureStorageCdnBackend.name
        }
      )

      const secureStorageDnsRecord = new dnsRecordSet.DnsRecordSet(
        this,
        `${tenant.name}-secure-storage-dns-record-set`,
        {
          name: `storage.${tenant.verifiedDomain}.`,
          type: "A",
          ttl: 300,
          managedZone: googleDnsManagedZone.name,
          rrdatas: [secureStorageCdnGlobalAddress.address],
        }
      );

      const secureStorageSslCertificate = new computeManagedSslCertificate.ComputeManagedSslCertificate(
        this,
        `${tenant.name}-secure-storage-ssl-certificate`,
        {
          name: `${tenant.name}-secure-storage-ssl-certificate`,
          managed: {
            domains: [secureStorageDnsRecord.name],
          },
        }
      );

      const secureStorageHttpsProxy = new computeTargetHttpsProxy.ComputeTargetHttpsProxy(
        this,
        `${tenant.name}-secure-storage-https-proxy`,
        {
          name: `${tenant.name}-secure-storage-https-proxy`,
          quicOverride: "NONE",
          urlMap: secureStorageCdnUrlMap.selfLink,
          sslCertificates: [secureStorageSslCertificate.selfLink],
        }
      );

      new computeGlobalForwardingRule.ComputeGlobalForwardingRule(
        this,
        `${tenant.name}-secure-storage-https-forwarding-rule`,
        {
          name: `${tenant.name}-secure-storage-https-forwarding-rule`,
          ipAddress: secureStorageCdnGlobalAddress.address,
          loadBalancingScheme: "EXTERNAL_MANAGED",
          ipProtocol: "TCP",
          portRange: "443",
          target: secureStorageHttpsProxy.selfLink,
        }
      );

      const secureStorageRedirectUrlMap = new computeUrlMap.ComputeUrlMap(
        this,
        `${tenant.name}-secure-storage-url-https-redirect-map`,
        {
          name: `${tenant.name}-secure-storage-url-https-redirect-map`,
          defaultUrlRedirect: {
            httpsRedirect: true,
            redirectResponseCode: "MOVED_PERMANENTLY_DEFAULT",
            stripQuery: false,
          },
        }
      );

      const secureStorageHttpProxy = new computeTargetHttpProxy.ComputeTargetHttpProxy(
        this,
        `${tenant.name}-secure-storage-http-proxy`,
        {
          name: `${tenant.name}-secure-storage-http-proxy`,
          urlMap: secureStorageRedirectUrlMap.selfLink,
        }
      );

      const secureStorageHttpForwardingRule = new computeGlobalForwardingRule.ComputeGlobalForwardingRule(
        this,
        `${tenant.name}-secure-storage-http-forwarding-rule`,
        {
          name: `${tenant.name}-secure-storage-http-forwarding-rule`,
          ipAddress: secureStorageCdnGlobalAddress.address,
          loadBalancingScheme: "EXTERNAL_MANAGED",
          ipProtocol: "TCP",
          portRange: "80",
          target: secureStorageHttpProxy.selfLink,
        }
      );
  
      new storageBucketIamMember.StorageBucketIamMember(
        this,
        `${tenant.name}-storage-bucket-cdn-access`,
        {
          bucket: secureStorageBucket.name,
          member: `serviceAccount:service-${secrets.global.projectNum}@cloud-cdn-fill.iam.gserviceaccount.com`,
          role: "roles/storage.objectViewer",
          dependsOn: [secureStorageCdnBackend, secureStorageEdgeSecurityPolicy, secureStorageCdnGlobalAddress, secureStorageHttpProxy, secureStorageCdnKey, secureStorageCdnUrlMap, secureStorageHttpForwardingRule]
        }
      )

      new storageBucketIamMember.StorageBucketIamMember(
        this,
        `${tenant.name}-secure-storage-bucket-admin`,
        {
          bucket: secureStorageBucket.name,
          role: "roles/storage.admin",
          member: `serviceAccount:${secrets.global.projectNum}-compute@developer.gserviceaccount.com`,
          dependsOn: [api]
        }
      )
  
      new projectIamMember.ProjectIamMember(
        this,
        `${tenant.name}-token-creator`,
        {
          project: secrets.global.projectId,
          role: "roles/iam.serviceAccountTokenCreator",
          member: `serviceAccount:${secrets.global.projectNum}-compute@developer.gserviceaccount.com`,
          dependsOn: [api]
        }
      )

      new storageBucketIamMember.StorageBucketIamMember(
        this,
        `${tenant.name}-terraform-secure-storage-bucket-admin`,
        {
          bucket: secureStorageBucket.name,
          role: "roles/storage.admin",
          member: `serviceAccount:terraform@${secrets.global.projectId}.iam.gserviceaccount.com`,
        }
      )
  
      const secureStorageSecrets = new secretManagerSecret.SecretManagerSecret(
        this,
        `${tenant.name}-secure-storage-secrets`,
        {
          secretId: `${tenant.name}-secure-storage-secrets`,
          replication: {
            automatic: true,
          },
        }
      );
  
      new secretManagerSecretVersion.SecretManagerSecretVersion(
        this,
        `${tenant.name}-secure-storage-secrets-version-${tenant.secureStorageEnvVars["version"]}`,
        {
          secret: secureStorageSecrets.id,
          secretData: `SECURE_STORAGE_BUCKET=${secureStorageBucket.name}
SECURE_STORAGE_CDN_URL=http://${secureStorageHttpForwardingRule.ipAddress}
SECURE_STORAGE_CDN_PRIVATE_KEY=${urlSignature.b64Std}
SECURE_STORAGE_CDN_KEY_NAME=${secureStorageCdnKey.name}`,
        }
      );

      /*
        Secure Storage
      */
    }
  }
}

const app = new App();
new Trace8Env(app, "cdk");
app.synth();
