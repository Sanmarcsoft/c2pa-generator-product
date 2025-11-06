/**
 * Document Content Extraction Service
 * Extracts text content from various document formats for RAG processing
 */

const fs = require('fs').promises;
const path = require('path');

class DocumentExtractionService {
  /**
   * Extract text content from a document based on its type
   * @param {string} filePath - Path to the document file
   * @param {string} mimeType - MIME type of the document
   * @returns {Promise<string>} Extracted text content
   */
  async extractContent(filePath, mimeType) {
    try {
      // Check if file exists
      const fileExists = await this.fileExists(filePath);
      if (!fileExists) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Route to appropriate extraction method based on MIME type
      switch (mimeType) {
        case 'text/plain':
        case 'text/markdown':
        case 'application/json':
        case 'text/csv':
          return await this.extractPlainText(filePath);

        case 'application/pdf':
          return await this.extractPDF(filePath);

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.extractDOCX(filePath);

        case 'text/html':
          return await this.extractHTML(filePath);

        default:
          // For unsupported types, return metadata
          return await this.extractMetadata(filePath, mimeType);
      }
    } catch (error) {
      console.error(`Error extracting content from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract content from plain text files
   */
  async extractPlainText(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.cleanText(content);
    } catch (error) {
      console.error('Error reading plain text file:', error);
      throw error;
    }
  }

  /**
   * Extract content from PDF files
   * Note: This is a basic implementation. For production, use pdf-parse or similar
   */
  async extractPDF(filePath) {
    try {
      // For now, return a placeholder
      // In production, install and use: npm install pdf-parse
      const stats = await fs.stat(filePath);
      return `[PDF Document: ${path.basename(filePath)}, Size: ${stats.size} bytes]\n\nNote: PDF text extraction requires pdf-parse library. Install with: npm install pdf-parse`;
    } catch (error) {
      console.error('Error extracting PDF:', error);
      throw error;
    }
  }

  /**
   * Extract content from DOCX files
   * Note: This is a basic implementation. For production, use mammoth or docx
   */
  async extractDOCX(filePath) {
    try {
      // For now, return a placeholder
      // In production, install and use: npm install mammoth
      const stats = await fs.stat(filePath);
      return `[Word Document: ${path.basename(filePath)}, Size: ${stats.size} bytes]\n\nNote: DOCX text extraction requires mammoth library. Install with: npm install mammoth`;
    } catch (error) {
      console.error('Error extracting DOCX:', error);
      throw error;
    }
  }

  /**
   * Extract content from HTML files
   */
  async extractHTML(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      // Basic HTML tag removal
      const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
      return this.cleanText(textContent);
    } catch (error) {
      console.error('Error extracting HTML:', error);
      throw error;
    }
  }

  /**
   * Extract basic metadata when content extraction is not supported
   */
  async extractMetadata(filePath, mimeType) {
    try {
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath);

      return `[File: ${fileName}]\nType: ${mimeType}\nSize: ${stats.size} bytes\nModified: ${stats.mtime.toISOString()}\n\nNote: Full content extraction not supported for this file type.`;
    } catch (error) {
      console.error('Error extracting metadata:', error);
      throw error;
    }
  }

  /**
   * Clean and normalize extracted text
   */
  cleanText(text) {
    return text
      .replace(/\r\n/g, '\n')      // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
      .replace(/\t+/g, ' ')        // Replace tabs with spaces
      .replace(/[ ]{2,}/g, ' ')    // Remove multiple spaces
      .trim();
  }

  /**
   * Extract key information from text content based on document phase
   * @param {string} content - Extracted text content
   * @param {number} phase - Certification phase (1-6)
   * @returns {Object} Structured key information
   */
  extractKeyInformation(content, phase) {
    const info = {
      phase,
      extractedData: {},
      entities: []
    };

    // Phase-specific extraction patterns
    switch (phase) {
      case 1: // Introduction & Prerequisites
        info.extractedData = this.extractPhase1Info(content);
        break;
      case 2: // Understanding Requirements
        info.extractedData = this.extractPhase2Info(content);
        break;
      case 3: // Document Review
        info.extractedData = this.extractPhase3Info(content);
        break;
      case 4: // Application Preparation
        info.extractedData = this.extractPhase4Info(content);
        break;
      case 5: // Submission & Follow-up
        info.extractedData = this.extractPhase5Info(content);
        break;
      case 6: // Certification Maintenance
        info.extractedData = this.extractPhase6Info(content);
        break;
    }

    // Extract common entities
    info.entities = this.extractEntities(content);

    return info;
  }

  /**
   * Extract Phase 1 information (Company Information, Technical Capability)
   */
  extractPhase1Info(content) {
    const info = {};

    // Company name patterns
    const companyPatterns = [
      /company\s*name[:\s]+([^\n]+)/i,
      /business\s*name[:\s]+([^\n]+)/i,
      /organization[:\s]+([^\n]+)/i,
      /^([A-Z][A-Za-z\s&,\.]+(?:LLC|Inc|Corp|Ltd|Limited|Corporation))/m
    ];

    for (const pattern of companyPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        info.companyName = match[1].trim();
        break;
      }
    }

    // Email patterns
    const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      info.email = emailMatch[0];
    }

    // Phone patterns
    const phoneMatch = content.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
    if (phoneMatch) {
      info.phone = phoneMatch[0];
    }

    // Address patterns (basic)
    const addressMatch = content.match(/address[:\s]+([^\n]+(?:\n[^\n]+)?)/i);
    if (addressMatch) {
      info.address = addressMatch[1].trim();
    }

    // Website patterns
    const websiteMatch = content.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/);
    if (websiteMatch) {
      info.website = websiteMatch[0];
    }

    return info;
  }

  /**
   * Extract Phase 2 information (Requirements Analysis)
   */
  extractPhase2Info(content) {
    const info = {
      requirements: [],
      gaps: []
    };

    // Look for requirement keywords
    const reqLines = content.split('\n').filter(line =>
      /requirement|must|shall|should|need/i.test(line)
    );
    info.requirements = reqLines.slice(0, 10); // Limit to first 10

    // Look for gap keywords
    const gapLines = content.split('\n').filter(line =>
      /gap|missing|lacking|need to|TODO|pending/i.test(line)
    );
    info.gaps = gapLines.slice(0, 10);

    return info;
  }

  /**
   * Extract Phase 3 information (Technical Specifications)
   */
  extractPhase3Info(content) {
    const info = {
      technologies: [],
      specifications: []
    };

    // Common technology keywords
    const techKeywords = ['API', 'database', 'server', 'cloud', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'C2PA'];
    info.technologies = techKeywords.filter(tech =>
      new RegExp(tech, 'i').test(content)
    );

    return info;
  }

  /**
   * Extract Phase 4 information (Application Form)
   */
  extractPhase4Info(content) {
    return {
      formType: 'application',
      hasSignature: /signature|signed by|authorized/i.test(content)
    };
  }

  /**
   * Extract Phase 5 information (Submission Confirmation)
   */
  extractPhase5Info(content) {
    return {
      submissionDate: this.extractDate(content),
      confirmationNumber: this.extractConfirmationNumber(content)
    };
  }

  /**
   * Extract Phase 6 information (Maintenance Logs)
   */
  extractPhase6Info(content) {
    return {
      logEntries: content.split('\n').filter(line =>
        /\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/.test(line)
      ).length
    };
  }

  /**
   * Extract common entities (companies, emails, URLs)
   */
  extractEntities(content) {
    const entities = [];

    // Extract emails
    const emails = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    emails.forEach(email => entities.push({ type: 'email', value: email }));

    // Extract URLs
    const urls = content.match(/https?:\/\/[^\s]+/g) || [];
    urls.forEach(url => entities.push({ type: 'url', value: url }));

    // Extract potential company names (words ending with LLC, Inc, Corp, etc.)
    const companies = content.match(/\b[A-Z][A-Za-z\s&,\.]+(?:LLC|Inc|Corp|Ltd|Limited|Corporation)\b/g) || [];
    companies.forEach(company => entities.push({ type: 'company', value: company }));

    return entities;
  }

  /**
   * Extract dates from content
   */
  extractDate(content) {
    const dateMatch = content.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/);
    return dateMatch ? dateMatch[0] : null;
  }

  /**
   * Extract confirmation numbers
   */
  extractConfirmationNumber(content) {
    const confirmMatch = content.match(/(?:confirmation|reference|tracking)[\s#:]+([A-Z0-9-]+)/i);
    return confirmMatch ? confirmMatch[1] : null;
  }
}

module.exports = new DocumentExtractionService();
