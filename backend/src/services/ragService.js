const { allAsync } = require('../models/database');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const githubRagService = require('./githubRagService');

/**
 * RAG (Retrieval-Augmented Generation) Service
 * Searches through uploaded C2PA documents to provide contextual information
 */

/**
 * Extract keywords from user message
 */
function extractKeywords(message) {
  const lowerMessage = message.toLowerCase();

  const keywords = [];

  // C2PA specific terms
  const c2paTerms = [
    'c2pa', 'manifest', 'assertion', 'provenance', 'credential',
    'generator', 'product', 'certificate', 'certification', 'conformance',
    'security', 'cryptographic', 'signing', 'validation', 'trust',
    'metadata', 'content', 'authenticity', 'integrity', 'claim',
    'audit', 'compliance', 'requirement', 'specification', 'standard'
  ];

  c2paTerms.forEach(term => {
    if (lowerMessage.includes(term)) {
      keywords.push(term);
    }
  });

  // Phase-specific terms
  const phaseTerms = {
    'phase 1': ['eligibility', 'prerequisite', 'readiness', 'introduction'],
    'phase 2': ['requirement', 'specification', 'technical', 'understanding'],
    'phase 3': ['document', 'review', 'agreement', 'analysis'],
    'phase 4': ['application', 'preparation', 'form', 'submission'],
    'phase 5': ['submit', 'audit', 'follow-up', 'review'],
    'phase 6': ['maintenance', 'ongoing', 'annual', 'compliance']
  };

  Object.entries(phaseTerms).forEach(([phase, terms]) => {
    if (lowerMessage.includes(phase)) {
      keywords.push(...terms);
    }
  });

  // Technical terms
  const technicalTerms = [
    'api', 'sdk', 'implementation', 'architecture', 'system',
    'key management', 'encryption', 'hash', 'signature', 'algorithm',
    'json', 'xml', 'format', 'protocol', 'interface'
  ];

  technicalTerms.forEach(term => {
    if (lowerMessage.includes(term)) {
      keywords.push(term);
    }
  });

  // Remove duplicates
  return [...new Set(keywords)];
}

/**
 * Search through document content for relevant information
 */
async function searchDocuments(keywords, limit = 3) {
  try {
    if (!keywords || keywords.length === 0) {
      return [];
    }

    // Get all documents
    const documents = await allAsync(
      'SELECT * FROM documents WHERE file_type IN (?, ?, ?, ?)',
      ['txt', 'md', 'json', 'pdf']
    );

    if (documents.length === 0) {
      return [];
    }

    const results = [];

    for (const doc of documents) {
      let content = '';
      let score = 0;

      // Try to read document content
      try {
        const filePath = path.join(__dirname, '../..', doc.file_path);

        if (fs.existsSync(filePath)) {
          // Read file content (for text-based files)
          if (doc.file_type === 'txt' || doc.file_type === 'md') {
            content = fs.readFileSync(filePath, 'utf8');
          } else if (doc.file_type === 'json') {
            const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            content = JSON.stringify(jsonContent, null, 2);
          }

          // Score document based on keyword matches
          const contentLower = content.toLowerCase();
          keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = content.match(regex);
            if (matches) {
              score += matches.length * 10; // 10 points per keyword match
            }

            // Bonus points for title/filename match
            if (doc.original_name.toLowerCase().includes(keyword)) {
              score += 20;
            }

            // Bonus points for category match
            if (doc.category && doc.category.toLowerCase().includes(keyword)) {
              score += 15;
            }
          });

          if (score > 0) {
            // Extract relevant excerpt
            const excerpt = extractRelevantExcerpt(content, keywords);

            results.push({
              documentId: doc.id,
              documentName: doc.original_name,
              category: doc.category,
              score,
              excerpt,
              uploadedAt: doc.created_at
            });
          }
        }
      } catch (error) {
        logger.warn(`Error reading document ${doc.id}:`, error.message);
      }
    }

    // Sort by score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

  } catch (error) {
    logger.error('Error searching documents:', error);
    return [];
  }
}

/**
 * Extract relevant excerpt from document content
 */
function extractRelevantExcerpt(content, keywords, maxLength = 300) {
  if (!content || content.length === 0) {
    return '';
  }

  // Find the first occurrence of any keyword
  let bestPosition = -1;
  let bestKeyword = '';

  keywords.forEach(keyword => {
    const position = content.toLowerCase().indexOf(keyword);
    if (position !== -1 && (bestPosition === -1 || position < bestPosition)) {
      bestPosition = position;
      bestKeyword = keyword;
    }
  });

  if (bestPosition === -1) {
    // No keyword found, return beginning
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  }

  // Extract context around keyword
  const startPos = Math.max(0, bestPosition - 100);
  const endPos = Math.min(content.length, bestPosition + maxLength);

  let excerpt = content.substring(startPos, endPos);

  // Add ellipsis if we're not at the start/end
  if (startPos > 0) excerpt = '...' + excerpt;
  if (endPos < content.length) excerpt = excerpt + '...';

  return excerpt;
}

/**
 * Generate context-enhanced response using RAG
 * Now searches both local documents AND GitHub repositories
 */
async function enhanceWithDocuments(userMessage, baseResponse, options = {}) {
  try {
    // Extract keywords from user message
    const keywords = extractKeywords(userMessage);

    if (keywords.length === 0) {
      return baseResponse;
    }

    // Search for relevant documents (local)
    const relevantDocs = await searchDocuments(keywords, 2);

    // Search GitHub repositories if enabled
    let githubResults = [];
    if (options.searchGithub !== false) {
      try {
        githubResults = await githubRagService.searchRepositories(keywords, options.repoFilter, 3);
      } catch (error) {
        logger.warn('GitHub search failed:', error.message);
      }
    }

    // If no results from either source, return base response
    if (relevantDocs.length === 0 && githubResults.length === 0) {
      return baseResponse;
    }

    // Enhance response with document references
    let enhancedMessage = baseResponse;

    // Add local document results
    if (relevantDocs.length > 0) {
      enhancedMessage += `\n\n📚 **Relevant Documents Found:**\n\n`;

      relevantDocs.forEach((doc, index) => {
        enhancedMessage += `**${index + 1}. ${doc.documentName}** (${doc.category})\n`;
        enhancedMessage += `${doc.excerpt}\n\n`;
      });
    }

    // Add GitHub repository results
    if (githubResults.length > 0) {
      enhancedMessage += `\n\n💻 **Relevant Code from GitHub:**\n\n`;

      githubResults.forEach((result, index) => {
        enhancedMessage += `**${index + 1}. ${result.fileName}** (${result.repository})\n`;
        enhancedMessage += `Path: \`${result.filePath}\`\n`;
        enhancedMessage += `\`\`\`\n${result.excerpt}\n\`\`\`\n`;
        enhancedMessage += `[View on GitHub](${result.url})\n\n`;
      });
    }

    // Add helpful tips
    if (relevantDocs.length === 0) {
      enhancedMessage += `💡 *Tip: Upload C2PA documents to get even more specific guidance!*`;
    }
    if (githubResults.length === 0 && options.searchGithub !== false) {
      enhancedMessage += `\n💡 *Tip: Index a GitHub repository to search through code examples!*`;
    }

    return enhancedMessage;

  } catch (error) {
    logger.error('Error enhancing response with documents:', error);
    return baseResponse;
  }
}

/**
 * Get document summary for a specific topic
 */
async function getDocumentSummary(topic) {
  const keywords = extractKeywords(topic);
  const docs = await searchDocuments(keywords, 5);

  if (docs.length === 0) {
    return {
      found: false,
      message: `No documents found for "${topic}". Try uploading C2PA specification documents or certification guides.`
    };
  }

  return {
    found: true,
    count: docs.length,
    documents: docs,
    message: `Found ${docs.length} relevant document(s) for "${topic}"`
  };
}

module.exports = {
  extractKeywords,
  searchDocuments,
  enhanceWithDocuments,
  getDocumentSummary
};
