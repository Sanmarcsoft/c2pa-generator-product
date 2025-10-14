# ProofMode React Native Integration Guide

This comprehensive technical guide provides specific implementation details, code examples, and best practices for creating a robust ProofMode React Native module that addresses bridging code persistence and build reliability issues.

## ProofMode architecture overview

ProofMode by Guardian Project is a **mature cryptographic media verification system** built around automatic background signing of photos and videos. The current implementation uses native Android development with **libProofMode** (version 1.0.18) providing core cryptographic functionality through OpenPGP signing, SHA-256 hashing, and sensor data collection.

**Core architectural components:**
- Background service monitoring MediaStore changes
- PGP keypair generation and management using BouncyCastle
- Sensor data collection (GPS, network, device fingerprinting)
- CSV metadata generation with correlating evidence
- Optional C2PA (Coalition for Content Provenance and Authenticity) integration
- Hardware attestation via Google SafetyNet API

The system generates **proof packages** containing original media, cryptographic signatures (.asc files), sensor metadata (CSV format), and optional blockchain timestamps through OpenTimestamps integration.

## React Native native module architecture for persistent bridging

Modern React Native development should prioritize the **New Architecture (0.76+)** which eliminates many traditional bridging issues through direct JavaScript-to-native communication via JSI (JavaScript Interface).

### Bridging persistence strategy

**Codegen-based interface generation** prevents build deletion issues by automatically generating platform-specific interfaces from TypeScript specifications:

```typescript
// ProofModeSpec.ts - Type-safe interface specification
import { TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  
  initialize(): Promise<boolean>;
  generateProof(mediaUri: string): Promise<ProofResult>;
  getProofMetadata(proofHash: string): Promise<MetadataResult>;
  enableBackgroundMonitoring(enabled: boolean): Promise<void>;
  exportProofPackage(mediaUris: string[]): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ProofMode');
```

**Dual architecture support** ensures compatibility across React Native versions through conditional compilation:

```java
// Android - ProofModeModule.java
public class ProofModeModule extends ReactContextBaseJavaModule {
    @Override
    public String getName() {
        return "ProofMode";
    }
    
    // Legacy bridge support
    @ReactMethod
    public void generateProof(String mediaUri, Promise promise) {
        performProofGeneration(mediaUri, promise);
    }
    
    // New architecture support
    #ifdef RCT_NEW_ARCH_ENABLED
    @Override
    public NativeProofModeSpec getSpec() {
        return new NativeProofModeSpecImpl(this);
    }
    #endif
}
```

### Background service integration pattern

ProofMode's core strength lies in **background operation**. React Native integration requires careful handling of background services:

```java
// BackgroundProofService.java
public class BackgroundProofService extends ReactContextBaseJavaModule 
    implements LifecycleEventListener {
    
    private ProofModeService proofService;
    
    @ReactMethod
    public void enableBackgroundCapture(Promise promise) {
        try {
            Intent serviceIntent = new Intent(getReactApplicationContext(), 
                                            ProofModeService.class);
            getReactApplicationContext().startService(serviceIntent);
            
            // Register media observer
            ContentObserver mediaObserver = new MediaStoreObserver();
            getReactApplicationContext().getContentResolver()
                .registerContentObserver(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, 
                                       true, mediaObserver);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("BACKGROUND_SERVICE_ERROR", e.getMessage());
        }
    }
}
```

## Cryptographic functionality bridging patterns

**High-performance cryptographic operations** require native implementation using established React Native crypto libraries and ProofMode's existing cryptographic infrastructure.

### Core cryptographic integration

```typescript
// ProofModeCore.ts - Core cryptographic operations
import QuickCrypto from 'react-native-quick-crypto';
import * as Keychain from 'react-native-keychain';
import { NativeModules } from 'react-native';

const { ProofModeNative } = NativeModules;

export class ProofModeCore {
  private static instance: ProofModeCore;
  private pgpKeyPair: any;
  
  async initialize(): Promise<void> {
    // Retrieve or generate PGP keypair
    this.pgpKeyPair = await this.getOrCreateKeypair();
    
    // Initialize native ProofMode library
    await ProofModeNative.initializeWithKey(this.pgpKeyPair.publicKey);
  }
  
  async generateProof(mediaUri: string): Promise<ProofResult> {
    // Generate SHA-256 hash using high-performance crypto
    const fileData = await RNFS.readFile(mediaUri, 'base64');
    const hash = QuickCrypto.createHash('sha256')
      .update(fileData, 'base64')
      .digest('hex');
    
    // Collect sensor data through native module
    const sensorData = await ProofModeNative.collectSensorData();
    
    // Generate metadata CSV
    const metadata = this.generateMetadataCSV(hash, sensorData);
    
    // Create PGP signature
    const signatureData = hash + JSON.stringify(sensorData);
    const signature = await this.signWithPGP(signatureData);
    
    return {
      hash,
      metadata,
      signature,
      timestamp: Date.now(),
      proofDirectory: await ProofModeNative.getProofDir(hash)
    };
  }
  
  private async getOrCreateKeypair(): Promise<any> {
    try {
      // Attempt to retrieve existing keypair from secure storage
      const credentials = await Keychain.getGenericPassword({
        service: 'ProofMode_PGP_Keys',
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET
      });
      
      if (credentials) {
        return JSON.parse(credentials.password);
      }
    } catch (error) {
      console.log('No existing keypair found, generating new one');
    }
    
    // Generate new PGP keypair using native implementation
    const keypair = await ProofModeNative.generatePGPKeypair({
      userEmail: 'user@proofmode.app',
      keySize: 2048,
      passphrase: await this.generateSecurePassphrase()
    });
    
    // Store securely in keychain
    await Keychain.setGenericPassword('ProofMode_PGP', JSON.stringify(keypair), {
      service: 'ProofMode_PGP_Keys',
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS
    });
    
    return keypair;
  }
}
```

### Advanced cryptographic features

**Hardware-backed security** integration for enhanced trust:

```java
// Android - CryptographicModule.java
public class CryptographicModule extends ReactContextBaseJavaModule {
    private static final String ANDROID_KEYSTORE = "AndroidKeyStore";
    private KeyStore keyStore;
    
    @ReactMethod
    public void generateHardwareBackedKey(String alias, Promise promise) {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE);
                
            KeyGenParameterSpec keyGenParameterSpec = new KeyGenParameterSpec.Builder(
                alias, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setUserAuthenticationRequired(true)
                .setUserAuthenticationValidityDurationSeconds(60)
                .build();
                
            keyGenerator.init(keyGenParameterSpec);
            SecretKey secretKey = keyGenerator.generateKey();
            
            promise.resolve("Hardware key generated successfully");
        } catch (Exception e) {
            promise.reject("HARDWARE_KEY_ERROR", e.getMessage());
        }
    }
}
```

## Auto-linking configuration for build persistence

**Robust auto-linking configuration** prevents common build deletion issues and ensures consistent module discovery across development cycles.

### Package.json configuration

```json
{
  "name": "react-native-proofmode",
  "version": "1.0.0",
  "description": "ProofMode integration for React Native",
  "main": "lib/index.js",
  "module": "src/index.ts",
  "types": "lib/index.d.ts",
  "react-native": "src/index.ts",
  "keywords": ["react-native", "proofmode", "verification", "cryptography"],
  "peerDependencies": {
    "react": "*",
    "react-native": ">=0.76.0"
  },
  "dependencies": {
    "react-native-quick-crypto": "^0.7.0",
    "react-native-keychain": "^8.1.2",
    "react-native-fs": "^2.20.0"
  },
  "react-native": {
    "platforms": {
      "android": {
        "sourceDir": "./android",
        "packageImportPath": "import com.proofmode.ProofModePackage;",
        "dependencyConfiguration": "implementation"
      },
      "ios": {
        "podspecPath": "./ios/ProofMode.podspec"
      }
    }
  },
  "codegenConfig": {
    "name": "ProofModeSpec",
    "type": "modules",
    "jsSrcsDir": "src",
    "android": {
      "javaPackageName": "com.proofmode.specs"
    }
  },
  "react-native-builder-bob": {
    "source": "src",
    "output": "lib",
    "targets": [
      "commonjs",
      "module",
      "typescript"
    ]
  }
}
```

### Platform-specific build configuration

**Android Gradle configuration** with ProofMode library integration:

```gradle
// android/build.gradle
apply plugin: 'com.android.library'
apply plugin: 'com.facebook.react'

def getExtOrDefault(name) {
    return rootProject.ext.has(name) ? rootProject.ext.get(name) : project.properties[name]
}

def getExtOrIntegerDefault(name) {
    return rootProject.ext.has(name) ? rootProject.ext.get(name) : (project.properties[name]).toInteger()
}

android {
    compileSdkVersion getExtOrIntegerDefault('compileSdkVersion')
    
    defaultConfig {
        minSdkVersion getExtOrIntegerDefault('minSdkVersion')
        targetSdkVersion getExtOrIntegerDefault('targetSdkVersion')
        versionCode 1
        versionName "1.0"
    }
    
    // Conditional source sets for architecture compatibility
    sourceSets {
        main {
            if (project.hasProperty("newArchEnabled") && project.newArchEnabled == "true") {
                java.srcDirs += ['src/newarch/java']
            } else {
                java.srcDirs += ['src/oldarch/java']
            }
        }
    }
}

repositories {
    google()
    mavenCentral()
    // Guardian Project Maven repository for ProofMode
    maven { url "https://raw.githubusercontent.com/guardianproject/gpmaven/master" }
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
    
    // ProofMode dependencies
    implementation 'org.witness:android-libproofmode:1.0.18'
    implementation 'com.google.android.gms:play-services-safetynet:18.0.1'
    implementation 'org.bouncycastle:bcpkix-jdk15to18:1.72'
    implementation 'org.bouncycastle:bcprov-jdk15to18:1.72'
    implementation 'com.eternitywall:java-opentimestamps:1.20'
}
```

**iOS CocoaPods configuration** with secure enclave integration:

```ruby
# ios/ProofMode.podspec
require 'json'

package = JSON.parse(File.read(File.join(__dir__, '../package.json')))

Pod::Spec.new do |s|
  s.name           = package['name']
  s.version        = package['version']
  s.summary        = package['description']
  s.homepage       = package['homepage']
  s.license        = package['license']
  s.author         = package['author']
  s.platforms      = { :ios => "13.0" }
  s.source         = { :git => package['repository'], :tag => "#{s.version}" }
  
  s.source_files   = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc   = true
  
  # React Native dependencies
  s.dependency "React-Core"
  
  # Cryptographic dependencies
  s.dependency "CryptoKit"
  s.dependency "LocalAuthentication"
  
  # New Architecture support
  install_modules_dependencies(s)
  
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1'
    s.compiler_flags = "-DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig = {
      "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }
  end
end
```

### Build script optimization

**Clean build processes** prevent stale artifacts and ensure consistent builds:

```json
{
  "scripts": {
    "clean": "npx react-native clean",
    "clean:android": "cd android && ./gradlew clean && ./gradlew cleanBuildCache && cd ..",
    "clean:ios": "cd ios && rm -rf build && pod cache clean --all && pod install && cd ..",
    "clean:codegen": "rm -rf android/app/build/generated && rm -rf ios/build/generated",
    "codegen:android": "./android/gradlew -p android generateCodegenArtifactsFromSchema",
    "codegen:ios": "node node_modules/react-native/scripts/generate-codegen-artifacts.js --path . --outputPath ./ios/build/generated/ios --targetPlatform ios",
    "rebuild": "npm run clean && npm run codegen:android && npm run codegen:ios && npm install",
    "prepare": "bob build"
  }
}
```

## Modern native module template implementation

**Using create-react-native-library** provides the most robust foundation for ProofMode integration:

```bash
# Initialize ProofMode React Native module
npx create-react-native-library@latest react-native-proofmode \
  --slug react-native-proofmode \
  --description "ProofMode cryptographic verification for React Native" \
  --author-name "Your Name" \
  --author-email "your.email@example.com" \
  --github-url "https://github.com/your-org/react-native-proofmode" \
  --type module-mixed \
  --languages kotlin-swift
```

### TypeScript interface design

**Comprehensive ProofMode interface** with proper error handling and type safety:

```typescript
// src/types.ts
export interface ProofResult {
  hash: string;
  metadata: SensorMetadata;
  signature: string;
  timestamp: number;
  proofDirectory: string;
  c2paManifest?: string;
}

export interface SensorMetadata {
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  };
  network: {
    type: 'wifi' | 'cellular' | 'none';
    ssid?: string;
    cellTowerId?: string;
  };
  device: {
    model: string;
    manufacturer: string;
    osVersion: string;
    appVersion: string;
    deviceId: string;
  };
  sensors: {
    accelerometer?: [number, number, number];
    gyroscope?: [number, number, number];
    magnetometer?: [number, number, number];
  };
}

export interface ProofModeConfig {
  enableBackgroundCapture: boolean;
  sensorDataCollection: ('location' | 'network' | 'device' | 'sensors')[];
  signatureMethod: 'pgp' | 'simple_hash';
  notarization?: {
    safetyNet: boolean;
    openTimestamps: boolean;
  };
}

export enum ProofModeError {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  CRYPTOGRAPHIC_ERROR = 'CRYPTOGRAPHIC_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}
```

### Native Android implementation

**Complete Android module implementation** integrating libProofMode:

```java
// android/src/main/java/com/proofmode/ProofModeModule.java
package com.proofmode;

import android.content.Context;
import android.net.Uri;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import org.witness.proofmode.ProofMode;
import org.witness.proofmode.ProofModeConstants;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class ProofModeModule extends ReactContextBaseJavaModule {
    private static final String NAME = "ProofMode";
    private ReactApplicationContext reactContext;
    private boolean isInitialized = false;

    public ProofModeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void initialize(ReadableMap config, Promise promise) {
        try {
            // Initialize ProofMode library
            Context context = getReactApplicationContext();
            ProofMode.init(context);
            
            // Configure based on provided settings
            if (config.hasKey("enableBackgroundCapture")) {
                boolean enabled = config.getBoolean("enableBackgroundCapture");
                ProofMode.setEnabled(context, enabled);
            }
            
            isInitialized = true;
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("INITIALIZATION_FAILED", e.getMessage());
        }
    }

    @ReactMethod
    public void generateProof(String mediaUri, Promise promise) {
        if (!isInitialized) {
            promise.reject("NOT_INITIALIZED", "ProofMode not initialized");
            return;
        }

        try {
            Uri uri = Uri.parse(mediaUri);
            String proofHash = ProofMode.generateProof(getReactApplicationContext(), uri);
            File proofDir = ProofMode.getProofDir(getReactApplicationContext(), proofHash);
            
            // Collect additional metadata
            WritableMap result = Arguments.createMap();
            result.putString("hash", proofHash);
            result.putString("proofDirectory", proofDir.getAbsolutePath());
            result.putDouble("timestamp", System.currentTimeMillis());
            
            // Add sensor data if available
            WritableMap sensorData = collectSensorData();
            result.putMap("metadata", sensorData);
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("PROOF_GENERATION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void exportProofPackage(ReadableArray mediaUris, Promise promise) {
        try {
            // Implementation for creating proof package zip
            String packagePath = createProofPackage(mediaUris);
            promise.resolve(packagePath);
        } catch (Exception e) {
            promise.reject("EXPORT_ERROR", e.getMessage());
        }
    }

    private WritableMap collectSensorData() {
        WritableMap sensorData = Arguments.createMap();
        
        // Location data
        WritableMap location = Arguments.createMap();
        // ... implement location collection
        sensorData.putMap("location", location);
        
        // Network data
        WritableMap network = Arguments.createMap();
        // ... implement network data collection
        sensorData.putMap("network", network);
        
        // Device information
        WritableMap device = Arguments.createMap();
        device.putString("model", android.os.Build.MODEL);
        device.putString("manufacturer", android.os.Build.MANUFACTURER);
        device.putString("osVersion", android.os.Build.VERSION.RELEASE);
        sensorData.putMap("device", device);
        
        return sensorData;
    }

    private void sendEvent(String eventName, WritableMap params) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }
}
```

## Build reliability and persistence strategies

**Comprehensive strategies** to prevent bridging code deletion and ensure reliable builds across development cycles.

### Gradle optimization patterns

```gradle
// android/gradle.properties - Performance and reliability settings
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.configureondemand=true
android.useAndroidX=true
android.enableJetifier=true

# New Architecture support
newArchEnabled=true
hermesEnabled=true
```

### CocoaPods reliability configuration

```ruby
# ios/Podfile - Reliable pod configuration
platform :ios, min_ios_version_supported
prepare_react_native_project!

# Optimize pod installation
install! 'cocoapods', :deterministic_uuids => false
plugin 'cocoapods-use-frameworks', :flag => :static_framework

target 'ProofModeExample' do
  config = use_native_modules!
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => true
  )
  
  # ProofMode-specific dependencies
  pod 'CryptoKit'
  pod 'LocalAuthentication'
  
  post_install do |installer|
    react_native_post_install(installer, config[:reactNativePath])
    
    # Ensure consistent deployment target
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = min_ios_version_supported
      end
    end
  end
end
```

This comprehensive implementation guide provides a robust foundation for integrating ProofMode's cryptographic verification capabilities into React Native applications while addressing common build persistence issues through modern architecture patterns, proper auto-linking configuration, and comprehensive error handling strategies.