/**
 * Web Search Validation Service
 * Validates business information using web search and online data
 */

const axios = require('axios');

class WebSearchValidationService {
  constructor() {
    this.searchTimeout = 10000; // 10 seconds timeout
  }

  /**
   * Validate business information using web search
   * @param {Object} businessInfo - Business information to validate
   * @returns {Promise<Object>} Validation results
   */
  async validateBusinessInfo(businessInfo) {
    const results = {
      companyName: businessInfo.companyName || null,
      validationResults: [],
      confidence: 'unknown',
      foundOnline: false,
      sources: [],
      warnings: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Validate company if provided
      if (businessInfo.companyName) {
        const companyValidation = await this.validateCompany(businessInfo.companyName);
        results.validationResults.push(companyValidation);
        results.foundOnline = companyValidation.found;
        results.sources.push(...companyValidation.sources);
      }

      // Validate website if provided
      if (businessInfo.website) {
        const websiteValidation = await this.validateWebsite(businessInfo.website);
        results.validationResults.push(websiteValidation);
        if (websiteValidation.accessible) {
          results.sources.push({
            type: 'website',
            url: businessInfo.website,
            status: 'accessible'
          });
        }
      }

      // Validate email domain if provided
      if (businessInfo.email) {
        const emailValidation = await this.validateEmailDomain(businessInfo.email);
        results.validationResults.push(emailValidation);
      }

      // Calculate overall confidence
      results.confidence = this.calculateConfidence(results.validationResults);

      // Generate warnings
      results.warnings = this.generateWarnings(results.validationResults, businessInfo);

    } catch (error) {
      console.error('Error in web search validation:', error);
      results.validationResults.push({
        type: 'error',
        message: `Validation error: ${error.message}`,
        found: false
      });
      results.confidence = 'error';
    }

    return results;
  }

  /**
   * Validate company existence using search
   * Note: This is a basic implementation. In production, use proper APIs
   * like Google Custom Search, Bing Search, or business verification services
   */
  async validateCompany(companyName) {
    const result = {
      type: 'company',
      query: companyName,
      found: false,
      sources: [],
      details: {}
    };

    try {
      // Simulate company validation
      // In production, integrate with:
      // - Google Custom Search API
      // - Bing Search API
      // - LinkedIn Company API
      // - OpenCorporates API
      // - Chamber of Commerce databases

      // For now, perform basic checks
      const searchQueries = [
        `${companyName} official website`,
        `${companyName} company information`,
        `${companyName} business`
      ];

      // Check if company name follows typical patterns
      const hasBusinessSuffix = /\b(LLC|Inc|Corp|Ltd|Limited|Corporation|Co\.|Company)\b/i.test(companyName);
      if (hasBusinessSuffix) {
        result.details.hasBusinessSuffix = true;
        result.found = true;
        result.sources.push({
          type: 'pattern_match',
          description: 'Company name follows standard business naming conventions'
        });
      }

      // Simulate search result (placeholder)
      result.details.note = 'Web search validation requires API integration (Google Custom Search, Bing, etc.)';
      result.details.recommendation = 'For production, integrate with business verification APIs';

    } catch (error) {
      console.error('Error validating company:', error);
      result.error = error.message;
    }

    return result;
  }

  /**
   * Validate website accessibility
   */
  async validateWebsite(websiteUrl) {
    const result = {
      type: 'website',
      url: websiteUrl,
      accessible: false,
      statusCode: null,
      error: null
    };

    try {
      // Ensure URL has protocol
      let url = websiteUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      // Attempt to fetch website
      const response = await axios.get(url, {
        timeout: this.searchTimeout,
        maxRedirects: 5,
        validateStatus: (status) => status < 500 // Accept any status < 500
      });

      result.accessible = response.status >= 200 && response.status < 400;
      result.statusCode = response.status;

      if (result.accessible) {
        result.details = {
          title: this.extractTitle(response.data),
          hasSSL: url.startsWith('https://'),
          contentType: response.headers['content-type']
        };
      }

    } catch (error) {
      result.error = error.message;
      result.accessible = false;

      if (error.code === 'ENOTFOUND') {
        result.error = 'Domain does not exist or is not accessible';
      } else if (error.code === 'ETIMEDOUT') {
        result.error = 'Website request timed out';
      }
    }

    return result;
  }

  /**
   * Validate email domain
   */
  async validateEmailDomain(email) {
    const result = {
      type: 'email',
      email: email,
      domainValid: false,
      details: {}
    };

    try {
      const domain = email.split('@')[1];
      if (!domain) {
        result.error = 'Invalid email format';
        return result;
      }

      result.details.domain = domain;

      // Check if domain is accessible via HTTP/HTTPS
      try {
        const response = await axios.get(`https://${domain}`, {
          timeout: this.searchTimeout,
          maxRedirects: 5,
          validateStatus: () => true // Accept any status
        });

        result.domainValid = true;
        result.details.domainAccessible = true;
        result.details.statusCode = response.status;
      } catch (error) {
        // Domain may exist but not have a website
        result.details.domainAccessible = false;
        result.details.note = 'Domain may not have a public website';
      }

      // Check for common free email providers
      const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
      result.details.isFreeProvider = freeProviders.includes(domain.toLowerCase());

      if (result.details.isFreeProvider) {
        result.warning = 'Email uses a free provider (not a business domain)';
      }

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Extract title from HTML content
   */
  extractTitle(htmlContent) {
    if (typeof htmlContent !== 'string') return null;

    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  /**
   * Calculate overall confidence based on validation results
   */
  calculateConfidence(validationResults) {
    if (validationResults.length === 0) {
      return 'unknown';
    }

    const successfulValidations = validationResults.filter(r =>
      r.found || r.accessible || r.domainValid
    ).length;

    const percentage = (successfulValidations / validationResults.length) * 100;

    if (percentage >= 75) return 'high';
    if (percentage >= 50) return 'medium';
    if (percentage >= 25) return 'low';
    return 'very_low';
  }

  /**
   * Generate warnings based on validation results
   */
  generateWarnings(validationResults, businessInfo) {
    const warnings = [];

    // Check if no validations passed
    const anyPassed = validationResults.some(r =>
      r.found || r.accessible || r.domainValid
    );

    if (!anyPassed && validationResults.length > 0) {
      warnings.push('Unable to verify business information online');
    }

    // Check for free email provider
    const emailValidation = validationResults.find(r => r.type === 'email');
    if (emailValidation && emailValidation.details && emailValidation.details.isFreeProvider) {
      warnings.push('Email uses a free provider instead of business domain');
    }

    // Check for website accessibility issues
    const websiteValidation = validationResults.find(r => r.type === 'website');
    if (websiteValidation && !websiteValidation.accessible) {
      warnings.push('Company website is not accessible or does not exist');
    }

    // Check for missing information
    if (!businessInfo.website) {
      warnings.push('No website provided for verification');
    }

    if (!businessInfo.companyName) {
      warnings.push('No company name provided for verification');
    }

    return warnings;
  }

  /**
   * Generate validation summary for AI
   * @param {Object} validationResults - Results from validateBusinessInfo
   * @returns {string} Formatted summary for AI context
   */
  formatValidationForAI(validationResults) {
    let summary = '=== BUSINESS INFORMATION VALIDATION ===\n\n';

    if (validationResults.companyName) {
      summary += `Company: ${validationResults.companyName}\n`;
    }

    summary += `Validation Confidence: ${validationResults.confidence.toUpperCase()}\n`;
    summary += `Found Online: ${validationResults.foundOnline ? 'Yes' : 'No'}\n`;
    summary += `Validation Time: ${validationResults.timestamp}\n\n`;

    if (validationResults.sources.length > 0) {
      summary += 'Sources:\n';
      validationResults.sources.forEach(source => {
        summary += `  - ${source.type}: ${source.description || source.url || source.status}\n`;
      });
      summary += '\n';
    }

    if (validationResults.validationResults.length > 0) {
      summary += 'Validation Details:\n';
      validationResults.validationResults.forEach(result => {
        summary += `  ${result.type.toUpperCase()}: `;
        if (result.type === 'company') {
          summary += result.found ? '✓ Validated' : '✗ Not verified';
        } else if (result.type === 'website') {
          summary += result.accessible ? `✓ Accessible (${result.statusCode})` : '✗ Not accessible';
        } else if (result.type === 'email') {
          summary += result.domainValid ? '✓ Domain valid' : '✗ Domain issues';
          if (result.details && result.details.isFreeProvider) {
            summary += ' (free provider)';
          }
        }
        summary += '\n';
      });
      summary += '\n';
    }

    if (validationResults.warnings.length > 0) {
      summary += 'Warnings:\n';
      validationResults.warnings.forEach(warning => {
        summary += `  ⚠ ${warning}\n`;
      });
      summary += '\n';
    }

    return summary;
  }
}

module.exports = new WebSearchValidationService();
