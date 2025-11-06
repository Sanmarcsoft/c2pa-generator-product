/**
 * C2PA Generator Product Conformance Requirements
 *
 * Based on C2PA Conformance Program documentation from c2pa-org/conformance-public
 * This defines the requirements for each phase of the certification process.
 */

const C2PA_REQUIREMENTS = {
  'phase-1': {
    name: 'Preparation & Registration',
    description: 'Initial application and company information submission',
    requirements: [
      {
        type: 'Company Information',
        mandatory: true,
        description: 'Complete company profile and business registration details',
        mustInclude: [
          'Legal company name and registration number',
          'Business address and jurisdiction',
          'Primary contact information (name, email, phone)',
          'Company website',
          'Type of business and industry sector',
          'Years in operation and business maturity'
        ],
        validation: {
          minFields: 6,
          requiredPatterns: {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            website: /^https?:\/\/.+/,
            phone: /[\d\s+()-]{10,}/
          }
        },
        insufficiencyIndicators: [
          'Missing business registration number',
          'No verifiable company website',
          'Incomplete contact information',
          'Missing business address or jurisdiction'
        ]
      },
      {
        type: 'Technical Capability Statement',
        mandatory: true,
        description: 'Overview of technical infrastructure and capabilities',
        mustInclude: [
          'Description of product/service offering',
          'Target use cases for C2PA implementation',
          'Current technical stack and infrastructure',
          'Development team size and expertise',
          'Existing security practices and certifications',
          'Integration plans for C2PA specification'
        ],
        validation: {
          minWords: 200,
          keyTopics: ['product', 'C2PA', 'implementation', 'security', 'team']
        },
        insufficiencyIndicators: [
          'Vague or generic product description',
          'No mention of C2PA integration approach',
          'Missing team qualifications',
          'No security practices mentioned',
          'Under 200 words (too brief)'
        ]
      }
    ],
    completionCriteria: {
      minDocuments: 2,
      allMandatoryMet: true,
      validationScore: 0.7
    }
  },

  'phase-2': {
    name: 'Technical Assessment',
    description: 'Detailed technical documentation and architecture',
    requirements: [
      {
        type: 'Development Environment',
        mandatory: true,
        description: 'Detailed development and deployment environment documentation',
        mustInclude: [
          'Development tools and SDK versions',
          'Build and deployment pipeline details',
          'Testing infrastructure and methodologies',
          'Version control and code management practices',
          'Development security controls',
          'Environment isolation and access controls'
        ],
        validation: {
          minFields: 6,
          keyTopics: ['SDK', 'testing', 'deployment', 'version control', 'security']
        },
        insufficiencyIndicators: [
          'Missing SDK or library versions',
          'No testing methodology described',
          'Vague deployment process',
          'No version control mentioned',
          'Inadequate security controls'
        ]
      },
      {
        type: 'Requirements Analysis',
        mandatory: true,
        description: 'Analysis of C2PA specification requirements',
        mustInclude: [
          'C2PA specification version being implemented',
          'Required assertions and claim structures',
          'Supported asset types and containers',
          'Cryptographic algorithms and key management',
          'Manifest generation and validation approach',
          'Gap analysis against current capabilities'
        ],
        validation: {
          minWords: 300,
          keyTopics: ['specification', 'assertions', 'cryptographic', 'manifest', 'validation']
        },
        insufficiencyIndicators: [
          'No specific C2PA version mentioned',
          'Missing assertion requirements',
          'No cryptographic details',
          'No gap analysis provided',
          'Under 300 words'
        ]
      },
      {
        type: 'Gap Assessment',
        mandatory: true,
        description: 'Identification of gaps between current and required capabilities',
        mustInclude: [
          'Current state analysis',
          'Required C2PA capabilities',
          'Identified gaps and deficiencies',
          'Remediation plan with timeline',
          'Resource requirements',
          'Risk assessment'
        ],
        validation: {
          minWords: 250,
          keyTopics: ['gap', 'current', 'required', 'remediation', 'timeline', 'risk']
        },
        insufficiencyIndicators: [
          'No current state baseline',
          'Missing gap identification',
          'No remediation plan',
          'Missing timelines or milestones',
          'No risk assessment'
        ]
      }
    ],
    completionCriteria: {
      minDocuments: 3,
      allMandatoryMet: true,
      validationScore: 0.75
    }
  },

  'phase-3': {
    name: 'Implementation',
    description: 'C2PA specification implementation evidence',
    requirements: [
      {
        type: 'Technical Documentation',
        mandatory: true,
        description: 'Comprehensive technical implementation documentation',
        mustInclude: [
          'Architecture diagrams and system design',
          'C2PA manifest structure implementation',
          'Assertion generation logic',
          'Cryptographic implementation details',
          'Key management and certificate handling',
          'API documentation and interfaces'
        ],
        validation: {
          minWords: 500,
          keyTopics: ['architecture', 'manifest', 'assertion', 'cryptographic', 'API']
        },
        insufficiencyIndicators: [
          'No architecture diagrams',
          'Missing manifest implementation details',
          'Inadequate cryptographic documentation',
          'No key management procedures',
          'Missing API documentation'
        ]
      }
    ],
    completionCriteria: {
      minDocuments: 1,
      allMandatoryMet: true,
      validationScore: 0.8
    }
  },

  'phase-4': {
    name: 'Security Validation',
    description: 'Security requirements compliance and attestation',
    requirements: [
      {
        type: 'Security Requirements Documentation',
        mandatory: true,
        description: 'Evidence of C2PA Generator Product Security Requirements compliance',
        mustInclude: [
          'Private key protection mechanisms',
          'Certificate validation procedures',
          'Secure manifest generation process',
          'Tamper detection and integrity verification',
          'Audit logging and monitoring',
          'Incident response procedures'
        ],
        validation: {
          minWords: 400,
          keyTopics: ['private key', 'certificate', 'tamper', 'audit', 'security']
        },
        insufficiencyIndicators: [
          'Inadequate key protection',
          'No certificate validation process',
          'Missing tamper detection',
          'No audit logging',
          'Missing incident response plan'
        ]
      }
    ],
    completionCriteria: {
      minDocuments: 1,
      allMandatoryMet: true,
      validationScore: 0.85
    }
  },

  'phase-5': {
    name: 'Testing & Validation',
    description: 'Comprehensive testing results and validation evidence',
    requirements: [
      {
        type: 'Test Results',
        mandatory: true,
        description: 'Comprehensive testing and validation results',
        mustInclude: [
          'Unit test results and coverage',
          'Integration test results',
          'C2PA conformance testing results',
          'Security testing outcomes',
          'Interoperability testing with other C2PA products',
          'Performance and scalability metrics'
        ],
        validation: {
          minWords: 300,
          keyTopics: ['test', 'conformance', 'security', 'interoperability', 'results']
        },
        insufficiencyIndicators: [
          'No test coverage metrics',
          'Missing conformance test results',
          'No security testing evidence',
          'No interoperability testing',
          'Missing performance data'
        ]
      }
    ],
    completionCriteria: {
      minDocuments: 1,
      allMandatoryMet: true,
      validationScore: 0.8
    }
  },

  'phase-6': {
    name: 'Certification Submission',
    description: 'Final submission package and certification',
    requirements: [
      {
        type: 'Certification Package',
        mandatory: true,
        description: 'Complete certification submission package',
        mustInclude: [
          'Executive summary of implementation',
          'Self-assertion of conformance to C2PA specification',
          'Compliance matrix against security requirements',
          'Product assurance level justification',
          'Attestation of accuracy and completeness',
          'Legal agreements and commitments'
        ],
        validation: {
          minWords: 500,
          keyTopics: ['conformance', 'compliance', 'assurance', 'attestation']
        },
        insufficiencyIndicators: [
          'Missing self-assertion statement',
          'Incomplete compliance matrix',
          'No assurance level justification',
          'Missing legal attestation'
        ]
      }
    ],
    completionCriteria: {
      minDocuments: 1,
      allMandatoryMet: true,
      validationScore: 0.9,
      allPreviousPhases: true
    }
  }
};

/**
 * Validates a document against phase-specific requirements
 */
function validateDocumentAgainstRequirements(phase, requirementType, extractedContent, metadata) {
  const phaseReq = C2PA_REQUIREMENTS[phase];
  if (!phaseReq) {
    return {
      valid: false,
      error: `Unknown phase: ${phase}`
    };
  }

  const requirement = phaseReq.requirements.find(r => r.type === requirementType);
  if (!requirement) {
    return {
      valid: false,
      error: `Unknown requirement type '${requirementType}' for ${phase}`
    };
  }

  const issues = [];
  const missing = [];
  let score = 0;

  // Ensure mustInclude exists and is an array
  const mustInclude = requirement.mustInclude || [];
  const maxScore = mustInclude.length;

  // Check for required fields/topics
  const contentLower = extractedContent ? extractedContent.toLowerCase() : '';

  mustInclude.forEach(item => {
    const itemLower = item.toLowerCase();
    const keywords = itemLower.split(' ').filter(w => w.length > 3);
    const found = keywords.some(kw => contentLower.includes(kw));

    if (found) {
      score++;
    } else {
      missing.push(item);
    }
  });

  // Word count validation
  if (requirement.validation && requirement.validation.minWords) {
    const wordCount = extractedContent ? extractedContent.split(/\s+/).length : 0;
    if (wordCount < requirement.validation.minWords) {
      issues.push(`Document is too brief (${wordCount} words, minimum ${requirement.validation.minWords} required)`);
    }
  }

  // Field count validation
  if (requirement.validation && requirement.validation.minFields) {
    if (score < requirement.validation.minFields) {
      issues.push(`Missing required fields (found ${score}/${requirement.validation.minFields})`);
    }
  }

  // Pattern validation (email, website, phone)
  if (requirement.validation && requirement.validation.requiredPatterns) {
    for (const [field, pattern] of Object.entries(requirement.validation.requiredPatterns)) {
      if (!pattern.test(contentLower)) {
        issues.push(`Missing or invalid ${field} format`);
      }
    }
  }

  const validationScore = score / maxScore;
  const isSufficient = validationScore >= (phaseReq.completionCriteria.validationScore || 0.7) && issues.length === 0;

  return {
    valid: true,
    phase: phase,
    phaseDescription: phaseReq.description,
    requirement: requirement.type,
    requirementDescription: requirement.description,
    mandatory: requirement.mandatory,
    score: validationScore,
    matchedFields: score,
    totalFields: maxScore,
    isSufficient: isSufficient,
    issues: issues,
    missingFields: missing,
    insufficiencyIndicators: requirement.insufficiencyIndicators,
    recommendations: generateRecommendations(requirement, missing, issues)
  };
}

/**
 * Generate recommendations for improving document
 */
function generateRecommendations(requirement, missing, issues) {
  const recommendations = [];

  if (missing.length > 0) {
    recommendations.push(`Add the following required information: ${missing.join(', ')}`);
  }

  if (issues.length > 0) {
    recommendations.push('Address the following issues: ' + issues.join('; '));
  }

  if (missing.length === 0 && issues.length === 0) {
    recommendations.push('Document meets minimum requirements for this phase');
    recommendations.push('Consider adding more detail to strengthen your application');
  }

  return recommendations;
}

/**
 * Get phase completion status
 */
function getPhaseCompletionStatus(phase, userDocuments) {
  const phaseReq = C2PA_REQUIREMENTS[phase];
  if (!phaseReq) return null;

  const phaseDocsCount = userDocuments.filter(d => d.phase === phase).length;
  const mandatoryTypes = phaseReq.requirements.filter(r => r.mandatory).map(r => r.type);
  const submittedTypes = [...new Set(userDocuments.filter(d => d.phase === phase).map(d => d.requirement_type))];

  const missingTypes = mandatoryTypes.filter(t => !submittedTypes.includes(t));

  return {
    phase: phase,
    phaseName: phaseReq.name,
    description: phaseReq.description,
    requiredDocuments: phaseReq.completionCriteria.minDocuments,
    submittedDocuments: phaseDocsCount,
    mandatoryRequirements: mandatoryTypes,
    submittedRequirements: submittedTypes,
    missingRequirements: missingTypes,
    isComplete: phaseDocsCount >= phaseReq.completionCriteria.minDocuments && missingTypes.length === 0
  };
}

module.exports = {
  C2PA_REQUIREMENTS,
  validateDocumentAgainstRequirements,
  getPhaseCompletionStatus
};
