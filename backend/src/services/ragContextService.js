/**
 * RAG (Retrieval-Augmented Generation) Context Service
 * Manages document context for chat AI integration
 */

const db = require('../models/database');
const documentExtractionService = require('./documentExtractionService');

class RAGContextService {
  /**
   * Build context from user's documents for a specific phase
   * @param {string} userId - User ID
   * @param {number} phase - Certification phase (optional, includes all if not specified)
   * @returns {Promise<Object>} Document context for RAG
   */
  async buildUserDocumentContext(userId, phase = null) {
    try {
      const query = phase
        ? `SELECT * FROM user_documents WHERE user_id = ? AND phase = ? ORDER BY upload_date DESC`
        : `SELECT * FROM user_documents WHERE user_id = ? ORDER BY upload_date DESC`;

      const params = phase ? [userId, phase] : [userId];
      const documents = await db.all(query, params);

      const context = {
        userId,
        phase,
        totalDocuments: documents.length,
        documents: [],
        summary: {
          byPhase: {},
          byStatus: {},
          keyInformation: {}
        }
      };

      // Process each document
      for (const doc of documents) {
        const docContext = {
          id: doc.id,
          filename: doc.original_filename,
          phase: doc.phase,
          requirementType: doc.requirement_type,
          uploadDate: doc.upload_date,
          status: doc.status,
          extractedText: doc.extracted_text || null,
          validationStatus: doc.content_validation_status,
          keyInfo: null
        };

        // Parse extracted text if available
        if (doc.extracted_text) {
          try {
            const keyInfo = documentExtractionService.extractKeyInformation(
              doc.extracted_text,
              doc.phase
            );
            docContext.keyInfo = keyInfo;
          } catch (error) {
            console.error(`Error extracting key info from document ${doc.id}:`, error);
          }
        }

        context.documents.push(docContext);

        // Update summary statistics
        if (!context.summary.byPhase[doc.phase]) {
          context.summary.byPhase[doc.phase] = 0;
        }
        context.summary.byPhase[doc.phase]++;

        if (!context.summary.byStatus[doc.status]) {
          context.summary.byStatus[doc.status] = 0;
        }
        context.summary.byStatus[doc.status]++;
      }

      // Aggregate key information across all documents
      context.summary.keyInformation = this.aggregateKeyInformation(context.documents);

      return context;
    } catch (error) {
      console.error('Error building user document context:', error);
      throw error;
    }
  }

  /**
   * Get user profile context
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile context
   */
  async getUserProfileContext(userId) {
    try {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at
      };
    } catch (error) {
      console.error('Error getting user profile context:', error);
      throw error;
    }
  }

  /**
   * Aggregate key information from multiple documents
   * @param {Array} documents - Array of document contexts
   * @returns {Object} Aggregated key information
   */
  aggregateKeyInformation(documents) {
    const aggregated = {
      companies: new Set(),
      emails: new Set(),
      websites: new Set(),
      technologies: new Set(),
      requirements: [],
      gaps: []
    };

    for (const doc of documents) {
      if (!doc.keyInfo || !doc.keyInfo.extractedData) continue;

      const data = doc.keyInfo.extractedData;

      // Aggregate company names
      if (data.companyName) {
        aggregated.companies.add(data.companyName);
      }

      // Aggregate emails
      if (data.email) {
        aggregated.emails.add(data.email);
      }

      // Aggregate websites
      if (data.website) {
        aggregated.websites.add(data.website);
      }

      // Aggregate technologies
      if (data.technologies) {
        data.technologies.forEach(tech => aggregated.technologies.add(tech));
      }

      // Aggregate requirements
      if (data.requirements) {
        aggregated.requirements.push(...data.requirements);
      }

      // Aggregate gaps
      if (data.gaps) {
        aggregated.gaps.push(...data.gaps);
      }

      // Extract entities
      if (doc.keyInfo.entities) {
        doc.keyInfo.entities.forEach(entity => {
          if (entity.type === 'company') {
            aggregated.companies.add(entity.value);
          } else if (entity.type === 'email') {
            aggregated.emails.add(entity.value);
          } else if (entity.type === 'url') {
            aggregated.websites.add(entity.value);
          }
        });
      }
    }

    // Convert Sets to Arrays
    return {
      companies: Array.from(aggregated.companies),
      emails: Array.from(aggregated.emails),
      websites: Array.from(aggregated.websites),
      technologies: Array.from(aggregated.technologies),
      requirements: aggregated.requirements.slice(0, 20), // Limit to 20
      gaps: aggregated.gaps.slice(0, 20) // Limit to 20
    };
  }

  /**
   * Format context for AI prompt injection
   * @param {Object} userProfile - User profile context
   * @param {Object} documentContext - Document context
   * @returns {string} Formatted context string for AI
   */
  formatContextForAI(userProfile, documentContext) {
    let context = '=== USER CONTEXT ===\n\n';
    context += `User: ${userProfile.name} (${userProfile.email})\n`;
    context += `Role: ${userProfile.role}\n`;
    context += `Account Created: ${userProfile.createdAt}\n\n`;

    context += '=== DOCUMENT SUMMARY ===\n\n';
    context += `Total Documents Uploaded: ${documentContext.totalDocuments}\n`;

    if (Object.keys(documentContext.summary.byPhase).length > 0) {
      context += '\nDocuments by Phase:\n';
      Object.entries(documentContext.summary.byPhase).forEach(([phase, count]) => {
        context += `  Phase ${phase}: ${count} document(s)\n`;
      });
    }

    if (Object.keys(documentContext.summary.byStatus).length > 0) {
      context += '\nDocuments by Status:\n';
      Object.entries(documentContext.summary.byStatus).forEach(([status, count]) => {
        context += `  ${status}: ${count} document(s)\n`;
      });
    }

    const keyInfo = documentContext.summary.keyInformation;

    if (keyInfo.companies.length > 0) {
      context += '\n=== EXTRACTED BUSINESS INFORMATION ===\n\n';
      context += `Companies: ${keyInfo.companies.join(', ')}\n`;
    }

    if (keyInfo.emails.length > 0) {
      context += `Contact Emails: ${keyInfo.emails.join(', ')}\n`;
    }

    if (keyInfo.websites.length > 0) {
      context += `Websites: ${keyInfo.websites.join(', ')}\n`;
    }

    if (keyInfo.technologies.length > 0) {
      context += `\nTechnologies Mentioned: ${keyInfo.technologies.join(', ')}\n`;
    }

    if (documentContext.documents.length > 0) {
      context += '\n=== RECENT DOCUMENTS ===\n\n';
      documentContext.documents.slice(0, 5).forEach(doc => {
        context += `Document: ${doc.filename}\n`;
        context += `  Phase: ${doc.phase} | Status: ${doc.status}\n`;
        context += `  Requirement: ${doc.requirementType}\n`;
        context += `  Uploaded: ${doc.uploadDate}\n`;

        if (doc.extractedText) {
          const preview = doc.extractedText.substring(0, 200);
          context += `  Content Preview: ${preview}${doc.extractedText.length > 200 ? '...' : ''}\n`;
        }

        context += '\n';
      });
    }

    if (keyInfo.gaps.length > 0) {
      context += '=== IDENTIFIED GAPS ===\n\n';
      keyInfo.gaps.slice(0, 5).forEach(gap => {
        context += `- ${gap}\n`;
      });
      context += '\n';
    }

    return context;
  }

  /**
   * Get full RAG context for chat
   * @param {string} userId - User ID
   * @param {number} phase - Optional phase filter
   * @returns {Promise<string>} Formatted context for AI
   */
  async getFullContext(userId, phase = null) {
    try {
      const [userProfile, documentContext] = await Promise.all([
        this.getUserProfileContext(userId),
        this.buildUserDocumentContext(userId, phase)
      ]);

      return this.formatContextForAI(userProfile, documentContext);
    } catch (error) {
      console.error('Error getting full RAG context:', error);
      throw error;
    }
  }

  /**
   * Validate document content against user profile
   * @param {Object} documentKeyInfo - Extracted key information from document
   * @param {Object} userProfile - User profile
   * @param {Object} documentContext - All user documents context
   * @returns {Object} Validation results
   */
  validateAgainstProfile(documentKeyInfo, userProfile, documentContext) {
    const validation = {
      consistent: true,
      warnings: [],
      matches: [],
      discrepancies: []
    };

    const keyInfo = documentContext.summary.keyInformation;
    const docData = documentKeyInfo.extractedData;

    // Validate email consistency
    if (docData.email) {
      if (docData.email === userProfile.email) {
        validation.matches.push(`Email matches profile: ${docData.email}`);
      } else if (keyInfo.emails.includes(docData.email)) {
        validation.matches.push(`Email consistent with other documents: ${docData.email}`);
      } else {
        validation.warnings.push(`New email found: ${docData.email} (profile: ${userProfile.email})`);
        validation.consistent = false;
      }
    }

    // Validate company consistency
    if (docData.companyName) {
      if (keyInfo.companies.length > 0 && !keyInfo.companies.includes(docData.companyName)) {
        validation.discrepancies.push(
          `Company name mismatch: "${docData.companyName}" vs existing "${keyInfo.companies[0]}"`
        );
        validation.consistent = false;
      } else if (keyInfo.companies.length > 0) {
        validation.matches.push(`Company name consistent: ${docData.companyName}`);
      }
    }

    // Check for name consistency
    if (docData.companyName && userProfile.name) {
      const profileWords = userProfile.name.toLowerCase().split(/\s+/);
      const docWords = docData.companyName.toLowerCase().split(/\s+/);
      const commonWords = profileWords.filter(word => docWords.includes(word) && word.length > 3);

      if (commonWords.length > 0) {
        validation.matches.push(`Name similarity detected between profile and document`);
      }
    }

    return validation;
  }
}

module.exports = new RAGContextService();
