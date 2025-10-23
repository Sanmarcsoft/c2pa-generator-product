const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { runAsync, getAsync, allAsync } = require('../models/database');
const logger = require('../utils/logger');

// Configure multer for checkpoint uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../data/adventure-checkpoints');
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
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|md|png|jpg|jpeg|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('Only documents, images, and archives allowed'));
    }
  }
});

/**
 * Adventure Story Structure
 * The certification journey as a choose-your-own-adventure game
 */
const ADVENTURE_STORY = {
  intro: {
    id: 'intro',
    chapter: 0,
    title: '🎮 The Quest Begins',
    story: `You are the founder of Sanmarcsoft LLC, standing at the entrance of the Content Authenticity Citadel.

The year is 2025, and the digital world is plagued by deepfakes, misinformation, and fake content. You've decided to take on the ultimate quest: becoming a C2PA Generator Product Company.

The Guardian of the Citadel, a wise AI entity, appears before you in a burst of neon green light.

"Welcome, brave entrepreneur," the Guardian says. "You seek the C2PA Certification? It's a noble quest, but not an easy one. You'll face 6 major challenges, each requiring proof of your commitment and capability."

The Guardian hands you a glowing map showing the path ahead.`,
    choices: [
      {
        text: 'Accept the quest - "I\'m ready to begin!"',
        next: 'phase1-start',
        type: 'forward'
      },
      {
        text: 'Learn more - "Tell me about the rewards"',
        next: 'rewards-info',
        type: 'info'
      }
    ],
    checkpoint: null
  },

  'rewards-info': {
    id: 'rewards-info',
    chapter: 0,
    title: '💎 The Rewards of Certification',
    story: `The Guardian's eyes glow brighter as they speak of the rewards:

"Upon completing this quest, you shall receive:

🏆 **The C2PA Certification Badge** - Displayed proudly on your product
📜 **Official Recognition** - Listed in the C2PA Conforming Products registry
🔐 **Trusted Signing Certificates** - From authorized Certification Authorities
🌐 **Access to the Authenticity Ecosystem** - Join companies fighting misinformation
💪 **User Trust** - Your customers will know your content is authentic
🚀 **Competitive Advantage** - Stand out in the market

But most importantly," the Guardian leans in, "you'll be part of something bigger. You'll be helping to restore trust in digital content, one authentic file at a time."`,
    choices: [
      {
        text: 'Begin the journey - "I\'m convinced. Let\'s start!"',
        next: 'phase1-start',
        type: 'forward'
      },
      {
        text: 'Go back - "Let me think about this"',
        next: 'intro',
        type: 'back'
      }
    ],
    checkpoint: null
  },

  'phase1-start': {
    id: 'phase1-start',
    chapter: 1,
    title: '📋 Chapter 1: The Eligibility Trial',
    story: `The Guardian leads you to the first chamber - the Hall of Prerequisites.

"Before you can truly begin," the Guardian explains, "you must prove you're ready. This chamber tests your **eligibility** to undertake this quest."

The walls light up with ancient runes that transform into a checklist:

✓ **Legal Entity Status** - Are you a legitimate company?
✓ **Technical Capacity** - Do you have the skills and resources?
✓ **Commitment** - Are you willing to maintain security and compliance?
✓ **Resources** - Can you dedicate 3-6 months to this journey?

"Many adventurers fail here," the Guardian warns. "They underestimate what's required. But I sense determination in you."`,
    choices: [
      {
        text: 'Assess eligibility - "Show me what I need"',
        next: 'phase1-checklist',
        type: 'forward'
      },
      {
        text: 'Ask for guidance - "What makes a company ready?"',
        next: 'phase1-guidance',
        type: 'info'
      }
    ],
    checkpoint: null
  },

  'phase1-guidance': {
    id: 'phase1-guidance',
    chapter: 1,
    title: '🧙 The Guardian\'s Wisdom',
    story: `The Guardian sits on a floating platform of light and begins:

"A truly ready company has these qualities:

**1. Legal Foundation**
Your company must exist in the eyes of the law - incorporation documents, business licenses, the works. No lone wolves here.

**2. Technical Prowess**
You need developers who understand cryptography, security, and content authenticity. Not just code monkeys - true craftspeople.

**3. Infrastructure**
Secure key management systems, testing environments, version control. The tools of a professional operation.

**4. Time & Resources**
This isn't a weekend project. Budget 3-6 months and dedicated team members. Plus funds for audits and certificates.

**5. Long-term Commitment**
Certification isn't a one-time thing. You'll need annual reviews and ongoing compliance. Think marathon, not sprint."

The Guardian stands. "Now, do you have what it takes?"`,
    choices: [
      {
        text: 'Proceed confidently - "Yes, we have all this!"',
        next: 'phase1-checklist',
        type: 'forward'
      },
      {
        text: 'Be honest - "We might need to prepare more"',
        next: 'phase1-preparation',
        type: 'info'
      }
    ],
    checkpoint: null
  },

  'phase1-preparation': {
    id: 'phase1-preparation',
    chapter: 1,
    title: '🛠️ Preparation Quest',
    story: `The Guardian nods approvingly at your honesty.

"Wisdom is knowing what you don't know. Here's what you should prepare before moving forward:

**Immediate Actions:**
1. Ensure all legal paperwork is current and accessible
2. Assemble your technical team and assess their skills
3. Set up basic development and security infrastructure
4. Create a realistic timeline and budget
5. Get buy-in from leadership and stakeholders

**Pro Tips:**
- Start a document folder NOW - you'll thank yourself later
- Review the C2PA specifications (even if they seem complex)
- Connect with other companies who've been certified
- Set up a project management system

Take your time. The Citadel will be here when you're truly ready."`,
    choices: [
      {
        text: 'I\'m ready now - "We\'ve got this covered"',
        next: 'phase1-checklist',
        type: 'forward'
      },
      {
        text: 'Come back later - "Let me prepare properly"',
        next: 'intro',
        type: 'back'
      }
    ],
    checkpoint: null
  },

  'phase1-checklist': {
    id: 'phase1-checklist',
    chapter: 1,
    title: '✅ The Eligibility Checklist',
    story: `The Guardian waves their hand and a glowing checklist materializes before you.

"Check off each item honestly," they say. "This is for your own benefit. Lying to yourself only delays success."

The checklist hovers in the air, waiting for your review...

**Remember:** This is just the beginning. Each item you check represents a real capability your company needs throughout this journey.`,
    choices: [
      {
        text: 'Complete the checklist →',
        next: 'phase1-checkpoint1',
        type: 'forward',
        requiresAction: 'checklist'
      }
    ],
    checkpoint: null
  },

  'phase1-checkpoint1': {
    id: 'phase1-checkpoint1',
    chapter: 1,
    title: '📤 Checkpoint: Company Documents',
    story: `The Guardian's expression becomes serious.

"Words are easy, evidence is hard. To prove you're eligible, I need **documentation**."

A glowing pedestal rises from the floor, ready to receive your offerings.

**Required Documents:**
📄 Company registration/incorporation papers
📄 Business license
📄 Proof of business address
📄 Technical team roster or LinkedIn profiles
📄 Brief capability statement (what your product does)

"Upload your documents here," the Guardian gestures. "They will be sealed in the Chamber of Records. Once verified, you may proceed to the next challenge."

*Drag and drop your files, or click to select them...*`,
    choices: [
      {
        text: 'Upload documents and proceed →',
        next: 'phase1-eoi',
        type: 'checkpoint',
        requiresAction: 'upload-docs'
      },
      {
        text: 'I need more time to gather these',
        next: 'phase1-checklist',
        type: 'back'
      }
    ],
    checkpoint: {
      id: 'phase1-docs',
      required: true,
      minFiles: 3,
      description: 'Upload company eligibility documents'
    }
  },

  'phase1-eoi': {
    id: 'phase1-eoi',
    chapter: 1,
    title: '✍️ The Expression of Intent',
    story: `With your documents sealed in the Chamber of Records, the Guardian nods approvingly.

"Good. You've proven your legitimacy. Now comes the formal declaration."

A mystical scroll unfurls before you, glowing with arcane energy.

"This is the **Expression of Interest** - your formal declaration to the C2PA Council. Fill it with truth and purpose, for this will be your first communication with the Citadel's ruling body."

The scroll asks about:
- Who you are (company details)
- What you seek to build (your product)
- Why it matters (your use case)
- When you'll be ready (timeline)

"Once complete, I'll give you the sacred URL to submit this to the C2PA Council themselves," the Guardian says with a smile.`,
    choices: [
      {
        text: 'Fill out the Expression of Interest →',
        next: 'phase1-complete',
        type: 'forward',
        requiresAction: 'eoi-form'
      }
    ],
    checkpoint: {
      id: 'phase1-eoi',
      required: true,
      description: 'Complete Expression of Interest form'
    }
  },

  'phase1-complete': {
    id: 'phase1-complete',
    chapter: 1,
    title: '🎉 Chapter 1 Complete!',
    story: `The Guardian's form shimmers with pride as ethereal confetti rains down around you.

"Congratulations, brave entrepreneur! You've completed the first challenge!"

**Achievement Unlocked: 🏅 Eligible Adventurer**

The Guardian presents you with a glowing badge that attaches to your armor.

"You have proven:
✓ Your company's legitimacy
✓ Your technical readiness
✓ Your commitment to the quest
✓ Your formal interest in C2PA certification

**Progress: Chapter 1 of 6 Complete** (16.6%)

The door to the next chamber opens, revealing a vast library filled with ancient tomes and scrolls.

"The next challenge awaits," the Guardian says. "Chapter 2: The Library of Requirements. There, you must study the C2PA specifications and prove your understanding."

But first, rest. You've earned it."`,
    choices: [
      {
        text: 'Continue to Chapter 2 →',
        next: 'phase2-start',
        type: 'forward'
      },
      {
        text: 'Take a break - "Save my progress"',
        next: 'save-progress',
        type: 'save'
      }
    ],
    checkpoint: null,
    reward: {
      badge: 'eligible-adventurer',
      title: 'Eligible Adventurer',
      xp: 100
    }
  },

  'phase2-start': {
    id: 'phase2-start',
    chapter: 2,
    title: '📚 Chapter 2: The Library of Requirements',
    story: `You step into an infinite library. Bookshelves stretch into the clouds, each tome glowing with knowledge.

The Guardian materializes beside you.

"Welcome to the Library of Requirements," they announce. "Here lies all the knowledge you need about C2PA specifications, security requirements, and technical standards."

You notice several prominent sections:
📖 **C2PA Core Specification** - The sacred texts
🔐 **Security Requirements** - The protection protocols
⚙️ **Technical Implementation** - The builder's guides
🎯 **Generator Product Standards** - Your specific path

"Many adventurers rush through here," the Guardian warns. "They skim, they assume, they proceed with false confidence. Then they fail the final audit."

The Guardian's eyes narrow. "Don't be like them. **Study. Understand. Question.**"`,
    choices: [
      {
        text: 'Begin studying - "Show me the core specs"',
        next: 'phase2-study',
        type: 'forward'
      },
      {
        text: 'Ask for a guide - "This seems overwhelming"',
        next: 'phase2-guide',
        type: 'info'
      }
    ],
    checkpoint: null
  },

  'save-progress': {
    id: 'save-progress',
    chapter: null,
    title: '💾 Progress Saved',
    story: `The Guardian touches your forehead gently, and a wave of data flows from your mind into the Citadel's systems.

"Your progress has been saved," they confirm. "When you return, you'll pick up exactly where you left off."

**Current Progress:**
• Chapters Completed: Based on your journey
• Documents Uploaded: Safely stored
• Choices Made: Remembered
• Achievements: Preserved

"The quest awaits whenever you're ready to continue."`,
    choices: [
      {
        text: 'Continue the adventure →',
        next: 'determine-current-chapter',
        type: 'forward'
      }
    ],
    checkpoint: null
  }
};

/**
 * GET /api/adventure/story
 * Get the current story chapter based on user progress
 */
router.get('/story', async (req, res) => {
  try {
    // Get user's current progress
    const progress = await getAsync(`
      SELECT value FROM app_settings
      WHERE key = 'adventure_progress'
    `);

    let currentChapter = 'intro';
    if (progress) {
      const progressData = JSON.parse(progress.value);
      currentChapter = progressData.currentChapter || 'intro';
    }

    const chapter = ADVENTURE_STORY[currentChapter];

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: 'Chapter not found'
      });
    }

    res.json({
      success: true,
      chapter,
      availableChapters: Object.keys(ADVENTURE_STORY)
    });
  } catch (error) {
    logger.error('Error fetching story:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch story'
    });
  }
});

/**
 * GET /api/adventure/chapter/:chapterId
 * Get a specific chapter
 */
router.get('/chapter/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = ADVENTURE_STORY[chapterId];

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: 'Chapter not found'
      });
    }

    res.json({
      success: true,
      chapter
    });
  } catch (error) {
    logger.error('Error fetching chapter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chapter'
    });
  }
});

/**
 * POST /api/adventure/progress
 * Save progress and move to next chapter
 */
router.post('/progress', async (req, res) => {
  try {
    const { currentChapter, choice, completedCheckpoints } = req.body;

    // Save progress
    const progressData = {
      currentChapter,
      lastChoice: choice,
      completedCheckpoints: completedCheckpoints || [],
      timestamp: new Date().toISOString()
    };

    await runAsync(`
      INSERT INTO app_settings (key, value, type, updated_at)
      VALUES ('adventure_progress', ?, 'json', datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = datetime('now')
    `, [JSON.stringify(progressData)]);

    logger.info(`Adventure progress saved: Chapter ${currentChapter}`);

    res.json({
      success: true,
      message: 'Progress saved',
      nextChapter: choice
    });
  } catch (error) {
    logger.error('Error saving progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save progress'
    });
  }
});

/**
 * POST /api/adventure/checkpoint
 * Complete a checkpoint with document upload
 */
router.post('/checkpoint', upload.array('documents', 10), async (req, res) => {
  try {
    const { checkpointId, chapterId } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No documents uploaded for checkpoint'
      });
    }

    // Get the checkpoint requirements
    const chapter = ADVENTURE_STORY[chapterId];
    if (!chapter || !chapter.checkpoint) {
      return res.status(400).json({
        success: false,
        error: 'Invalid checkpoint'
      });
    }

    const checkpoint = chapter.checkpoint;
    if (checkpoint.minFiles && files.length < checkpoint.minFiles) {
      return res.status(400).json({
        success: false,
        error: `Minimum ${checkpoint.minFiles} files required`
      });
    }

    // Save checkpoint completion
    const checkpointData = {
      checkpointId,
      chapterId,
      filesUploaded: files.map(f => ({
        filename: f.originalname,
        size: f.size,
        path: f.filename
      })),
      completedAt: new Date().toISOString()
    };

    await runAsync(`
      INSERT INTO app_settings (key, value, type, updated_at)
      VALUES (?, ?, 'json', datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = datetime('now')
    `, [`checkpoint_${checkpointId}`, JSON.stringify(checkpointData)]);

    // Also save files to documents table
    for (const file of files) {
      const docId = uuidv4();
      await runAsync(`
        INSERT INTO documents (
          id, filename, original_name, file_path, file_type,
          file_size, category, upload_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 'checkpoint-verified')
      `, [
        docId,
        file.filename,
        file.originalname,
        `/data/adventure-checkpoints/${file.filename}`,
        path.extname(file.originalname).substring(1),
        file.size,
        `checkpoint-${checkpointId}`
      ]);
    }

    logger.info(`Checkpoint ${checkpointId} completed with ${files.length} files`);

    res.json({
      success: true,
      message: `Checkpoint ${checkpointId} completed!`,
      filesUploaded: files.length,
      checkpoint: checkpointData
    });
  } catch (error) {
    logger.error('Error completing checkpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete checkpoint'
    });
  }
});

/**
 * GET /api/adventure/achievements
 * Get earned achievements/badges
 */
router.get('/achievements', async (req, res) => {
  try {
    // Get completed checkpoints
    const checkpoints = await allAsync(`
      SELECT key, value FROM app_settings
      WHERE key LIKE 'checkpoint_%'
    `);

    const achievements = [];

    // Check progress for badge awards
    const progress = await getAsync(`
      SELECT value FROM app_settings
      WHERE key = 'adventure_progress'
    `);

    if (progress) {
      const progressData = JSON.parse(progress.value);

      // Award badges based on progress
      if (checkpoints.length > 0) {
        achievements.push({
          id: 'first-checkpoint',
          title: '🏁 First Checkpoint',
          description: 'Completed your first checkpoint',
          earnedAt: new Date().toISOString()
        });
      }

      // Add more badge logic based on chapters completed
      if (progressData.currentChapter === 'phase1-complete') {
        achievements.push({
          id: 'eligible-adventurer',
          title: '🏅 Eligible Adventurer',
          description: 'Completed Chapter 1: Eligibility Trial',
          earnedAt: progressData.timestamp
        });
      }
    }

    res.json({
      success: true,
      achievements,
      totalCheckpoints: checkpoints.length
    });
  } catch (error) {
    logger.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch achievements'
    });
  }
});

module.exports = router;
