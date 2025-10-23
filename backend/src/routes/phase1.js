const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { runAsync, getAsync, allAsync } = require('../models/database');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../data/phase1-submissions');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|md|png|jpg|jpeg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, text, and image files are allowed'));
    }
  }
});

/**
 * GET /api/phase1/checklist
 * Get Phase 1 checklist items
 */
router.get('/checklist', async (req, res) => {
  try {
    const checklist = [
      {
        id: 'eligibility',
        title: 'Eligibility Requirements',
        description: 'Review and confirm your organization meets the basic eligibility criteria',
        required: true,
        items: [
          'Legal entity in good standing',
          'Commit to C2PA specifications',
          'Ability to implement security requirements',
          'Willingness to undergo audits'
        ]
      },
      {
        id: 'company-info',
        title: 'Company Information',
        description: 'Prepare basic company information and documentation',
        required: true,
        items: [
          'Company registration documents',
          'Business license',
          'Tax identification',
          'Proof of business address'
        ]
      },
      {
        id: 'technical-capacity',
        title: 'Technical Capacity Assessment',
        description: 'Evaluate your technical readiness',
        required: true,
        items: [
          'Development team in place',
          'Understanding of C2PA specifications',
          'Infrastructure for secure key management',
          'Testing and QA capabilities'
        ]
      },
      {
        id: 'timeline',
        title: 'Timeline & Resources',
        description: 'Estimate time and resource commitment',
        required: true,
        items: [
          'Estimated 3-6 months for full certification',
          'Budget for implementation and audits',
          'Dedicated project manager',
          'Legal and compliance support'
        ]
      }
    ];

    res.json({
      success: true,
      checklist
    });
  } catch (error) {
    logger.error('Error fetching Phase 1 checklist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch checklist'
    });
  }
});

/**
 * GET /api/phase1/resources
 * Get official C2PA resources and links
 */
router.get('/resources', async (req, res) => {
  try {
    const resources = {
      official: [
        {
          title: 'C2PA Conformance Program',
          url: 'https://c2pa.org/conformance/',
          description: 'Official C2PA Conformance Program homepage with application details',
          category: 'Official'
        },
        {
          title: 'Expression of Interest Form',
          url: 'https://c2pa.org/conformance/',
          description: 'Submit your Expression of Interest to join the Conformance Program',
          category: 'Application'
        },
        {
          title: 'C2PA Specifications',
          url: 'https://c2pa.org/specifications/specifications/2.2/index.html',
          description: 'Complete technical specifications for C2PA implementation',
          category: 'Technical'
        },
        {
          title: 'Conformance Public Repository',
          url: 'https://github.com/c2pa-org/conformance-public',
          description: 'GitHub repository with conformance program details and conforming products list',
          category: 'Reference'
        }
      ],
      certificationAuthorities: [
        {
          name: 'SSL.com',
          url: 'https://www.ssl.com/article/c2pa-enterprise-content-authenticity-solutions/',
          description: 'Conformant CA on the official C2PA Trust List',
          status: 'Active'
        },
        {
          name: 'DigiCert',
          url: 'https://www.digicert.com/',
          description: 'Global CA provider (check C2PA Trust List for current status)',
          status: 'Check Status'
        }
      ],
      tools: [
        {
          title: 'C2PA Open Source Tools',
          url: 'https://opensource.contentauthenticity.org/',
          description: 'Open-source tools for content authenticity and provenance',
          category: 'Development'
        },
        {
          title: 'Content Credentials Verify',
          url: 'https://contentcredentials.org/verify',
          description: 'Verify Content Credentials in your files',
          category: 'Testing'
        },
        {
          title: 'C2PA JavaScript SDK',
          url: 'https://github.com/contentauth/c2pa-js',
          description: 'JavaScript implementation for C2PA',
          category: 'Development'
        }
      ],
      learning: [
        {
          title: 'C2PA FAQ',
          url: 'https://c2pa.org/faqs/',
          description: 'Frequently asked questions about C2PA',
          category: 'Learning'
        },
        {
          title: 'Content Authenticity Initiative',
          url: 'https://contentauthenticity.org/',
          description: 'Learn about the broader CAI initiative',
          category: 'Learning'
        }
      ]
    };

    res.json({
      success: true,
      resources
    });
  } catch (error) {
    logger.error('Error fetching Phase 1 resources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resources'
    });
  }
});

/**
 * POST /api/phase1/upload
 * Upload Phase 1 documents (company info, eligibility docs, etc.)
 */
router.post('/upload', upload.array('documents', 10), async (req, res) => {
  try {
    const { documentType, description } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const uploadedDocs = [];

    for (const file of files) {
      const docId = uuidv4();

      await runAsync(`
        INSERT INTO documents (
          id, filename, original_name, file_path, file_type,
          file_size, category, upload_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 'phase1-pending')
      `, [
        docId,
        file.filename,
        file.originalname,
        `/data/phase1-submissions/${file.filename}`,
        path.extname(file.originalname).substring(1),
        file.size,
        documentType || 'phase1-general'
      ]);

      uploadedDocs.push({
        id: docId,
        filename: file.originalname,
        size: file.size,
        type: documentType || 'phase1-general'
      });

      logger.info(`Phase 1 document uploaded: ${file.originalname}`);
    }

    res.json({
      success: true,
      message: `Successfully uploaded ${files.length} document(s)`,
      documents: uploadedDocs
    });
  } catch (error) {
    logger.error('Error uploading Phase 1 documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload documents'
    });
  }
});

/**
 * POST /api/phase1/submit-eoi
 * Submit Expression of Interest (prepares data for external submission)
 */
router.post('/submit-eoi', async (req, res) => {
  try {
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      companyWebsite,
      productDescription,
      intendedUseCase,
      estimatedTimeline
    } = req.body;

    // Validate required fields
    if (!companyName || !contactName || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: companyName, contactName, contactEmail'
      });
    }

    // Store in database for tracking
    const submissionId = uuidv4();

    await runAsync(`
      INSERT INTO app_settings (key, value, type, updated_at)
      VALUES (?, ?, 'json', datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = datetime('now')
    `, [
      'phase1_eoi_submission',
      JSON.stringify({
        submissionId,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        companyWebsite,
        productDescription,
        intendedUseCase,
        estimatedTimeline,
        submittedAt: new Date().toISOString(),
        status: 'prepared'
      })
    ]);

    logger.info(`Phase 1 EOI prepared for ${companyName}`);

    res.json({
      success: true,
      message: 'Expression of Interest prepared successfully',
      submissionId,
      nextSteps: {
        manual: {
          title: 'Submit to C2PA',
          url: 'https://c2pa.org/conformance/',
          instructions: 'Visit the C2PA Conformance page and fill out the official Expression of Interest form with the information you provided.'
        },
        automated: {
          title: 'Export as PDF',
          description: 'Download your EOI information as a PDF to submit to C2PA',
          available: true
        }
      }
    });
  } catch (error) {
    logger.error('Error submitting Phase 1 EOI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit Expression of Interest'
    });
  }
});

/**
 * GET /api/phase1/status
 * Get Phase 1 completion status
 */
router.get('/status', async (req, res) => {
  try {
    // Check uploaded documents
    const documents = await allAsync(`
      SELECT * FROM documents
      WHERE category LIKE 'phase1-%'
      ORDER BY upload_date DESC
    `);

    // Check EOI submission
    const eoiSubmission = await getAsync(`
      SELECT value FROM app_settings
      WHERE key = 'phase1_eoi_submission'
    `);

    const status = {
      documentsUploaded: documents.length,
      eoiSubmitted: !!eoiSubmission,
      completionPercentage: 0,
      nextSteps: []
    };

    // Calculate completion
    if (documents.length > 0) status.completionPercentage += 40;
    if (eoiSubmission) status.completionPercentage += 60;

    // Determine next steps
    if (documents.length === 0) {
      status.nextSteps.push('Upload company documentation');
    }
    if (!eoiSubmission) {
      status.nextSteps.push('Submit Expression of Interest');
    }
    if (status.completionPercentage === 100) {
      status.nextSteps.push('Proceed to Phase 2: Understanding Requirements');
    }

    res.json({
      success: true,
      status
    });
  } catch (error) {
    logger.error('Error fetching Phase 1 status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch status'
    });
  }
});

module.exports = router;
