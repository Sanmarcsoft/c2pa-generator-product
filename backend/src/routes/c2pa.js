const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// C2PA official documents directory
const C2PA_DOCS_DIR = path.join(__dirname, '../../../data/c2pa-docs');

// GET /api/c2pa/documents - List C2PA official documents
router.get('/documents', async (req, res, next) => {
  try {
    // Ensure directory exists
    if (!fs.existsSync(C2PA_DOCS_DIR)) {
      fs.mkdirSync(C2PA_DOCS_DIR, { recursive: true });
    }

    // Read directory contents
    const files = fs.readdirSync(C2PA_DOCS_DIR);

    const documents = files.map(filename => {
      const filePath = path.join(C2PA_DOCS_DIR, filename);
      const stats = fs.statSync(filePath);

      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/c2pa/sync - Sync documents from GitHub repository
router.get('/sync', async (req, res, next) => {
  try {
    // This endpoint would fetch documents from the C2PA GitHub repo
    // For now, it returns information about what should be synced

    const documentsToSync = [
      {
        name: 'C2PA Generator Product Company Agreement',
        url: 'https://raw.githubusercontent.com/Sanmarcsoft/c2pa-org-conformance-public/main/legal-agreements/C2PA%20Generator%20Product%20Company%20Agreement%20v1.0%20(Final%206-25-2025).pdf',
        category: 'legal-agreement'
      },
      {
        name: 'C2PA Conformance Program',
        url: 'https://raw.githubusercontent.com/Sanmarcsoft/c2pa-org-conformance-public/main/docs/current/C2PA%20Conformance%20Program.pdf',
        category: 'program-docs'
      },
      {
        name: 'C2PA Generator Product Security Requirements',
        url: 'https://raw.githubusercontent.com/Sanmarcsoft/c2pa-org-conformance-public/main/docs/current/C2PA%20Generator%20Product%20Security%20Requirements.pdf',
        category: 'requirements'
      },
      {
        name: 'C2PA Certificate Policy',
        url: 'https://raw.githubusercontent.com/Sanmarcsoft/c2pa-org-conformance-public/main/docs/current/C2PA%20Certificate%20Policy.pdf',
        category: 'policy'
      },
      {
        name: 'C2PA Governance Framework',
        url: 'https://raw.githubusercontent.com/Sanmarcsoft/c2pa-org-conformance-public/main/docs/current/C2PA%20Governance%20Framework.pdf',
        category: 'governance'
      },
      {
        name: 'Companion Guide for CPL',
        url: 'https://raw.githubusercontent.com/Sanmarcsoft/c2pa-org-conformance-public/main/docs/current/Companion%20Guide%20for%20the%20C2PA%20Conforming%20Products%20List.pdf',
        category: 'guide'
      }
    ];

    logger.info('C2PA documents sync requested');

    res.json({
      success: true,
      message: 'C2PA documents list retrieved',
      documents: documentsToSync,
      note: 'Use the frontend to download these documents or implement server-side download'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/c2pa/info - Get C2PA program information
router.get('/info', (req, res) => {
  res.json({
    success: true,
    info: {
      program: 'C2PA Conformance Program',
      purpose: 'Certification for Generator Product Companies',
      phases: [
        {
          id: 'phase-1',
          name: 'Introduction & Prerequisites',
          description: 'Welcome and system overview, company eligibility check, required documentation checklist, timeline estimation'
        },
        {
          id: 'phase-2',
          name: 'Understanding Requirements',
          description: 'C2PA Conformance Program overview, Generator Product definition, security requirements breakdown, technical specifications'
        },
        {
          id: 'phase-3',
          name: 'Document Review',
          description: 'Review of C2PA Generator Product Company Agreement, Certificate Policy, Security Requirements, and Governance Framework'
        },
        {
          id: 'phase-4',
          name: 'Application Preparation',
          description: 'Application form assistance, documentation gathering, technical architecture review, security controls checklist'
        },
        {
          id: 'phase-5',
          name: 'Submission & Follow-up',
          description: 'Application submission guidance, tracking application status, responding to auditor questions, remediation assistance'
        },
        {
          id: 'phase-6',
          name: 'Certification Maintenance',
          description: 'Ongoing compliance requirements, annual review preparation, update notifications'
        }
      ],
      repository: 'https://github.com/Sanmarcsoft/c2pa-org-conformance-public',
      website: 'https://c2pa.org'
    }
  });
});

module.exports = router;
