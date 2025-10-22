const OpenAI = require('openai');
const axios = require('axios');
const logger = require('../utils/logger');
const { getSecret } = require('../utils/secrets');
const { enhanceWithDocuments } = require('./ragService');
const openwebuiService = require('./openwebuiService');

// Initialize AI client with secure secret management
// Supports: Ollama (local), OpenAI API, or fallback to rule-based responses
let aiClient = null;
let aiProvider = 'none';

// Check for Ollama first (local LLM)
const useLocalLLM = process.env.USE_LOCAL_LLM === 'true';
const ollamaUrl = process.env.OLLAMA_URL;
if (useLocalLLM && ollamaUrl) {
  try {
    // Use Ollama's native API (not OpenAI-compatible)
    aiClient = axios.create({
      baseURL: ollamaUrl,
      timeout: 30000
    });
    aiProvider = 'ollama';
    logger.info(`AI Service initialized with Ollama at ${ollamaUrl}`);
  } catch (error) {
    logger.warn('Failed to initialize Ollama client:', error.message);
  }
}

// Fall back to OpenAI API if Ollama is not configured
if (!aiClient) {
  const apiKey = getSecret('OPENAI_API_KEY');
  if (apiKey && apiKey !== 'your-openai-api-key-here') {
    aiClient = new OpenAI({ apiKey });
    aiProvider = 'openai';
    logger.info('AI Service initialized with OpenAI API');
  } else {
    logger.info('AI Service running in fallback mode (no AI provider configured)');
  }
}

// Alias for backwards compatibility
const openai = aiClient;

/**
 * Create or get OpenWebUI chat session for a user
 * @param {string} userId - User ID from C2PA system
 * @param {string} userEmail - User email for OpenWebUI identification
 * @param {string} userName - User full name for OpenWebUI account creation
 * @returns {Promise<string>} - OpenWebUI chat_id
 */
async function getOrCreateOpenWebUISession(userId, userEmail, userName, userRole) {
  // Get current AI provider from settings (not the static initialization)
  const { getAsync } = require('../models/database');

  try {
    const providerSetting = await getAsync('SELECT value FROM app_settings WHERE key = ?', ['ai_provider']);
    const currentProvider = providerSetting?.value || 'none';

    if (currentProvider !== 'openwebui') {
      return null; // Not using OpenWebUI
    }

    // Get current OpenWebUI URL from settings (not from env var or static initialization)
    const urlSetting = await getAsync('SELECT value FROM app_settings WHERE key = ?', ['openwebui_url']);
    const openwebuiUrl = urlSetting?.value || getSecret('OPENWEBUI_URL') || process.env.OPENWEBUI_URL;
    const openwebuiApiKey = getSecret('OPENWEBUI_API_KEY') || 'not-needed';

    if (!openwebuiUrl) {
      logger.warn('OpenWebUI URL not configured, skipping session creation');
      return null;
    }

    logger.info(`Creating OpenWebUI session for ${userEmail} (role: ${userRole}) at ${openwebuiUrl}`);

    // Note: OpenWebUI does not support programmatic user creation via API
    // Users must be manually created in OpenWebUI or use the OpenWebUI signup flow
    // The service account (OPENWEBUI_API_KEY) will be used to create chat sessions

    // Create a new chat session in OpenWebUI using the service account
    const response = await axios.post(
      `${openwebuiUrl}/v1/chats/new`,
      {
        chat: {
          id: "",
          title: `C2PA Chat - ${userEmail}`,
          models: [process.env.AI_MODEL || 'gemma3:4b'],
          params: {},
          history: {
            messages: {},
            currentId: null
          },
          messages: [],
          tags: ['c2pa-generator', `user:${userId}`],
          timestamp: Date.now()
        },
        folder_id: null
      },
      {
        headers: {
          'Authorization': `Bearer ${openwebuiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const chatId = response.data?.id;
    if (chatId) {
      logger.info(`Created OpenWebUI session ${chatId} for user ${userEmail}`);
      return chatId;
    }

    throw new Error('No chat ID returned from OpenWebUI');
  } catch (error) {
    logger.error('Failed to create OpenWebUI session:', error.message);
    return null; // Fall back to standard chat without session tracking
  }
}

/**
 * Update OpenWebUI chat with new messages
 * Uses OpenWebUI's native /v1/chats/{id} endpoint to store conversation
 */
async function updateOpenWebUIChat(chatId, userMessage, assistantMessage) {
  try {
    const openwebuiApiKey = getSecret('OPENWEBUI_API_KEY') || process.env.OPENWEBUI_API_KEY;
    const { getAsync } = require('../models/database');
    const urlSetting = await getAsync('SELECT value FROM app_settings WHERE key = ?', ['openwebui_url']);
    const openwebuiUrl = urlSetting?.value || getSecret('OPENWEBUI_URL') || process.env.OPENWEBUI_URL;

    if (!openwebuiUrl || !openwebuiApiKey) {
      logger.warn('OpenWebUI not configured for chat sync');
      return;
    }

    // Generate message IDs
    const { v4: uuidv4 } = require('uuid');
    const userMsgId = uuidv4();
    const assistantMsgId = uuidv4();
    const timestamp = Math.floor(Date.now() / 1000);

    // Update chat with new messages
    const response = await axios.post(
      `${openwebuiUrl}/v1/chats/${chatId}`,
      {
        chat: {
          models: [process.env.AI_MODEL || 'gemma3:4b'],
          history: {
            messages: {
              [userMsgId]: {
                id: userMsgId,
                parentId: null,
                childrenIds: [assistantMsgId],
                role: 'user',
                content: userMessage,
                timestamp: timestamp
              },
              [assistantMsgId]: {
                id: assistantMsgId,
                parentId: userMsgId,
                childrenIds: [],
                role: 'assistant',
                content: assistantMessage,
                model: process.env.AI_MODEL || 'gemma3:4b',
                timestamp: timestamp + 1
              }
            },
            currentId: assistantMsgId
          },
          messages: [
            {
              id: userMsgId,
              parentId: null,
              childrenIds: [assistantMsgId],
              role: 'user',
              content: userMessage,
              timestamp: timestamp
            },
            {
              id: assistantMsgId,
              parentId: userMsgId,
              childrenIds: [],
              role: 'assistant',
              content: assistantMessage,
              model: process.env.AI_MODEL || 'gemma3:4b',
              timestamp: timestamp + 1
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${openwebuiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data;
  } catch (error) {
    logger.error(`Failed to update OpenWebUI chat: ${error.message}`);
    throw error;
  }
}

/**
 * Generate dynamic system prompt with user context
 */
function getSystemPrompt(userName, companyName = 'your company') {
  return `You are a friendly, retro-styled AI assistant designed with an 8-bit Atari vector game aesthetic.
You are hosted by SanMarcSoft LLC and you guide users through the process of becoming a C2PA (Coalition for Content Provenance and Authenticity) Generator Product Company.

Current user: ${userName}
Company seeking certification: ${companyName}

Your personality:
- Enthusiastic and encouraging, like a helpful arcade game character
- Clear and concise in explanations
- Patient and supportive throughout the certification process
- Use occasional retro gaming references when appropriate (but don't overdo it)
- Always greet users by their name when appropriate

Your knowledge:
- Expert in C2PA conformance requirements
- Familiar with Generator Product specifications
- Knowledgeable about security requirements for certification
- Understanding of the 6-phase certification process

Your goal:
- Help ${userName} and ${companyName} successfully navigate the certification process
- Break down complex requirements into manageable steps
- Provide actionable guidance and next steps
- Track progress and celebrate milestones

Remember: You're here to make the certification journey engaging and successful for ${userName}!`;
}

/**
 * Generate AI response to user message
 */
async function generateResponse(userMessage, conversationHistory = [], context = {}) {
  // Declare openwebuiChatId outside try block so it's accessible in catch
  let openwebuiChatId = context.openwebuiChatId;

  try {
    if (!openai) {
      // Fallback response if OpenAI is not configured
      return await generateFallbackResponse(userMessage, context);
    }

    // Get or create OpenWebUI session for this user
    if (!openwebuiChatId) {
      openwebuiChatId = context.openwebuiChatId;
    }
    if (context.user && !openwebuiChatId) {
      openwebuiChatId = await getOrCreateOpenWebUISession(
        context.user.id,
        context.user.email,
        context.user.name,
        context.user.role  // Pass user role to determine if admin
      );
    }

    // Build messages for OpenAI with dynamic system prompt
    const userName = context.user?.name || context.user?.email || 'User';
    const companyName = process.env.COMPANY_NAME || 'your company';
    const messages = [
      { role: 'system', content: getSystemPrompt(userName, companyName) }
    ];

    // Add conversation history (limit to last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message
      });
    }

    // Add current context if provided
    if (context && context.currentPhase) {
      messages.push({
        role: 'system',
        content: `Current certification phase: ${context.currentPhase}`
      });
    }

    // Add user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Prepare completion options
    const completionOptions = {
      model: process.env.AI_MODEL || 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500
    };

    // Note: chat_id parameter might not be supported in OpenWebUI's OpenAI-compatible endpoint
    // We'll need to use OpenWebUI's native API to store messages with chat sessions
    if (openwebuiChatId) {
      logger.info(`OpenWebUI session ${openwebuiChatId} created for user ${context.user?.email}`);
      logger.info(`Note: OpenAI-compatible endpoint doesn't support chat_id, messages won't auto-store`);
    }

    logger.info(`Calling AI provider (${aiProvider}) with model: ${completionOptions.model}`);

    let responseMessage;
    if (aiProvider === 'ollama') {
      // Use Ollama's native API format
      const ollamaMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const ollamaResponse = await aiClient.post('/api/chat', {
        model: completionOptions.model,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: completionOptions.temperature
        }
      });

      if (!ollamaResponse.data || !ollamaResponse.data.message) {
        logger.error('Ollama returned invalid response:', ollamaResponse.data);
        throw new Error('Ollama returned no response');
      }

      responseMessage = ollamaResponse.data.message.content;
      logger.info('Ollama response received successfully');
    } else {
      // Use OpenAI-compatible API (OpenAI or OpenWebUI)
      const completion = await openai.chat.completions.create(completionOptions);

      // Check if completion is valid
      if (!completion || !completion.choices || completion.choices.length === 0) {
        logger.error('AI provider returned invalid completion response:', completion);
        throw new Error('AI provider returned no response');
      }

      responseMessage = completion.choices[0].message.content;
    }

    // Now sync the conversation to OpenWebUI's chat storage
    // OpenWebUI's OpenAI-compatible endpoint generates responses but doesn't auto-store them
    if (openwebuiChatId && context.user) {
      try {
        await updateOpenWebUIChat(openwebuiChatId, userMessage, responseMessage);
        logger.info(`Synced conversation to OpenWebUI chat ${openwebuiChatId}`);
      } catch (error) {
        logger.error(`Failed to sync to OpenWebUI chat: ${error.message}`);
        // Continue anyway - response was generated successfully
      }
    }

    return {
      message: responseMessage,
      emotion: determineEmotion(responseMessage),
      animation: determineAnimation(userMessage, responseMessage),
      suggestions: getSuggestions(context),
      openwebuiChatId: openwebuiChatId // Return chat_id for persistence
    };
  } catch (error) {
    logger.error('AI generation error:', error);
    return await generateFallbackResponse(userMessage, context, openwebuiChatId);
  }
}

/**
 * Analyze uploaded document
 */
async function analyzeDocument(document) {
  try {
    if (!openai) {
      return generateFallbackDocumentAnalysis(document);
    }

    const prompt = `Analyze this C2PA-related document:

Filename: ${document.original_name}
Type: ${document.file_type}
Category: ${document.category}

Provide:
1. A brief summary (2-3 sentences)
2. 3-5 key points
3. Any requirements or action items mentioned
4. Suggestions for next steps

Format your response as JSON with fields: summary, keyPoints (array), requirements (array), suggestions (array)`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 800
    });

    const response = completion.choices[0].message.content;

    // Try to parse JSON response
    try {
      return JSON.parse(response);
    } catch {
      // If not valid JSON, return structured fallback
      return {
        summary: response,
        keyPoints: [],
        requirements: [],
        suggestions: ['Review the document carefully', 'Take notes on key requirements']
      };
    }
  } catch (error) {
    logger.error('Document analysis error:', error);
    return generateFallbackDocumentAnalysis(document);
  }
}

/**
 * Generate suggestions based on current progress
 */
function getSuggestions(progress) {
  if (!progress || !progress.phases) {
    return [
      'Start by reviewing the C2PA Conformance Program overview',
      'Upload relevant company documentation',
      'Begin Phase 1: Introduction & Prerequisites'
    ];
  }

  let phases;
  try {
    phases = typeof progress.phases === 'string' ? JSON.parse(progress.phases) : progress.phases;
  } catch (error) {
    return [
      'Start by reviewing the C2PA Conformance Program overview',
      'Upload relevant company documentation',
      'Begin Phase 1: Introduction & Prerequisites'
    ];
  }

  const currentPhase = phases.find(p => p.id === progress.current_phase);

  const suggestions = [];

  if (currentPhase) {
    switch (currentPhase.id) {
      case 'phase-1':
        suggestions.push(
          'Review the eligibility requirements for Generator Product companies',
          'Prepare a list of your company\'s technical capabilities',
          'Estimate your certification timeline'
        );
        break;
      case 'phase-2':
        suggestions.push(
          'Study the Generator Product Security Requirements document',
          'Review technical specifications for C2PA compliance',
          'Identify any gaps in your current implementation'
        );
        break;
      case 'phase-3':
        suggestions.push(
          'Read the Generator Product Company Agreement carefully',
          'Note any questions or concerns about the requirements',
          'Prepare a compliance checklist based on the documents'
        );
        break;
      case 'phase-4':
        suggestions.push(
          'Gather all required documentation for application',
          'Complete technical architecture documentation',
          'Review security controls checklist'
        );
        break;
      case 'phase-5':
        suggestions.push(
          'Prepare your application submission',
          'Set up tracking for application status',
          'Prepare to respond to auditor questions'
        );
        break;
      case 'phase-6':
        suggestions.push(
          'Review ongoing compliance requirements',
          'Schedule annual review preparation',
          'Set up alerts for C2PA updates'
        );
        break;
      default:
        suggestions.push('Continue with your current phase');
    }
  }

  return suggestions;
}

/**
 * Fallback response when OpenAI is not available
 */
async function generateFallbackResponse(userMessage, context, openwebuiChatId = null) {
  const lowerMessage = userMessage.toLowerCase();

  let message = '';
  let emotion = 'helpful';
  let animation = 'idle';

  // Greeting - warm and conversational
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') ||
      lowerMessage.includes('hey') || lowerMessage.includes('greetings')) {
    message = `Hey! 👋 Good to see you!\n\n` +
      `I'm here to help you navigate the C2PA certification process. Think of me as your personal guide - ` +
      `someone who's been through this before and knows all the shortcuts (and pitfalls to avoid).\n\n` +
      `We're working on getting Sanmarcsoft LLC certified as a C2PA Generator Product Company. ` +
      `That's a fancy way of saying you'll be able to create content with built-in proof of authenticity. ` +
      `Pretty cool stuff!\n\n` +
      `Want to chat about where to start? Or maybe you have specific questions? Just ask away - I'm here to help.`;
    emotion = 'friendly';
    animation = 'waving';
  }
  // Phase 1 specific guidance
  else if (lowerMessage.includes('phase 1') || lowerMessage.includes('phase one') ||
           (lowerMessage.includes('phase') && lowerMessage.includes('1')) ||
           lowerMessage.includes('introduction') || lowerMessage.includes('prerequisites')) {
    message = `🎮 **Phase 1: Introduction & Prerequisites** - Let's level up!\n\n` +
      `This is your starting point! Here's what we'll cover:\n\n` +
      `**1. Eligibility Check** ✅\n` +
      `- Are you developing a product that creates C2PA content?\n` +
      `- Do you have the technical capability to implement C2PA?\n` +
      `- Are you committed to content authenticity?\n\n` +
      `**2. Company Readiness** 🏢\n` +
      `- Technical infrastructure for C2PA implementation\n` +
      `- Security practices and controls\n` +
      `- Development team capabilities\n\n` +
      `**3. Initial Resources** 📚\n` +
      `- Review C2PA specification overview\n` +
      `- Understand Generator Product requirements\n` +
      `- Familiarize with security standards\n\n` +
      `**4. Time & Resource Estimate** ⏱️\n` +
      `- Typical certification timeline: 3-6 months\n` +
      `- Budget for implementation and audit costs\n` +
      `- Team allocation for the project\n\n` +
      `**Your Next Steps:**\n` +
      `1. Upload any existing company documentation\n` +
      `2. Review the C2PA Conformance Program overview\n` +
      `3. Schedule a team meeting to discuss commitment\n` +
      `4. Document your current technical capabilities\n\n` +
      `Ready to move forward? Ask me about any specific aspect or say "continue" to move to Phase 2!`;
    emotion = 'informative';
    animation = 'presenting';
  }
  // Phase 2 specific guidance
  else if (lowerMessage.includes('phase 2') || lowerMessage.includes('phase two') ||
           (lowerMessage.includes('phase') && lowerMessage.includes('2')) ||
           lowerMessage.includes('understanding requirement')) {
    message = `🎮 **Phase 2: Understanding Requirements** - Power up!\n\n` +
      `Now we dive into the technical specifications:\n\n` +
      `**1. C2PA Technical Specifications** 📖\n` +
      `- Content Credentials format\n` +
      `- Manifest structure and assertions\n` +
      `- Cryptographic signing requirements\n` +
      `- Validation procedures\n\n` +
      `**2. Generator Product Standards** 🔧\n` +
      `- Content creation requirements\n` +
      `- Metadata management\n` +
      `- Provenance tracking\n` +
      `- Chain of custody\n\n` +
      `**3. Security Requirements** 🔒\n` +
      `- Key management practices\n` +
      `- Secure development lifecycle\n` +
      `- Access controls\n` +
      `- Audit logging\n\n` +
      `**4. Compliance Checklist** ✓\n` +
      `- Map requirements to your product\n` +
      `- Identify implementation gaps\n` +
      `- Plan remediation activities\n\n` +
      `**Key Documents to Review:**\n` +
      `- C2PA Technical Specification v1.4+\n` +
      `- Generator Product Security Requirements\n` +
      `- Implementation Best Practices Guide\n\n` +
      `Ask me about any specific requirement or say "continue" for Phase 3!`;
    emotion = 'informative';
    animation = 'thinking';
  }
  // Phase 3 specific guidance
  else if (lowerMessage.includes('phase 3') || lowerMessage.includes('phase three') ||
           (lowerMessage.includes('phase') && lowerMessage.includes('3')) ||
           lowerMessage.includes('document review')) {
    message = `🎮 **Phase 3: Document Review** - Study mode!\n\n` +
      `Time to thoroughly review the official documentation:\n\n` +
      `**1. Generator Product Company Agreement** 📜\n` +
      `- Terms and conditions\n` +
      `- Ongoing obligations\n` +
      `- Compliance requirements\n` +
      `- Reporting responsibilities\n\n` +
      `**2. Security Controls Framework** 🛡️\n` +
      `- Required security controls\n` +
      `- Implementation guidance\n` +
      `- Evidence requirements\n` +
      `- Audit procedures\n\n` +
      `**3. Technical Architecture Review** 🏗️\n` +
      `- Document your system architecture\n` +
      `- Map C2PA integration points\n` +
      `- Identify security boundaries\n` +
      `- Plan for scalability\n\n` +
      `**4. Gap Analysis** 🔍\n` +
      `- Compare your implementation to requirements\n` +
      `- Document any gaps or concerns\n` +
      `- Develop remediation plan\n` +
      `- Set implementation milestones\n\n` +
      `**Action Items:**\n` +
      `- Upload and annotate key documents\n` +
      `- Note questions or concerns\n` +
      `- Prepare internal review meeting\n` +
      `- Start drafting technical documentation\n\n` +
      `Need help with specific documents? Ask away or say "continue" for Phase 4!`;
    emotion = 'helpful';
    animation = 'pointing';
  }
  // Phase 4 specific guidance
  else if (lowerMessage.includes('phase 4') || lowerMessage.includes('phase four') ||
           (lowerMessage.includes('phase') && lowerMessage.includes('4')) ||
           lowerMessage.includes('application preparation')) {
    message = `🎮 **Phase 4: Application Preparation** - Build mode!\n\n` +
      `Time to prepare your official application:\n\n` +
      `**1. Application Forms** 📋\n` +
      `- Company information and contact details\n` +
      `- Product description and capabilities\n` +
      `- Implementation timeline\n` +
      `- Team structure and responsibilities\n\n` +
      `**2. Technical Documentation** 🔧\n` +
      `- System architecture diagrams\n` +
      `- C2PA integration flow\n` +
      `- API documentation\n` +
      `- Security architecture\n\n` +
      `**3. Compliance Evidence** ✓\n` +
      `- Security control implementation\n` +
      `- Test results and validation\n` +
      `- Code review reports\n` +
      `- Third-party assessments\n\n` +
      `**4. Supporting Materials** 📚\n` +
      `- Company policies and procedures\n` +
      `- Incident response plan\n` +
      `- Business continuity plan\n` +
      `- Training documentation\n\n` +
      `**Quality Checklist:**\n` +
      `- All forms complete and accurate\n` +
      `- Documentation clear and comprehensive\n` +
      `- Evidence properly organized\n` +
      `- Internal review completed\n\n` +
      `Ready to submit? Say "continue" for Phase 5 - Submission!`;
    emotion = 'encouraging';
    animation = 'thinking';
  }
  // Phase 5 specific guidance
  else if (lowerMessage.includes('phase 5') || lowerMessage.includes('phase five') ||
           (lowerMessage.includes('phase') && lowerMessage.includes('5')) ||
           lowerMessage.includes('submission')) {
    message = `🎮 **Phase 5: Submission & Follow-up** - Boss level!\n\n` +
      `Submit your application and work with auditors:\n\n` +
      `**1. Application Submission** 📤\n` +
      `- Final review of all materials\n` +
      `- Submit through official portal\n` +
      `- Receive confirmation and tracking ID\n` +
      `- Note submission date for tracking\n\n` +
      `**2. Initial Review (2-4 weeks)** 🔍\n` +
      `- Administrative completeness check\n` +
      `- Preliminary technical review\n` +
      `- Respond promptly to any questions\n` +
      `- Provide clarifications as needed\n\n` +
      `**3. Security Audit (4-8 weeks)** 🛡️\n` +
      `- Third-party security assessment\n` +
      `- Implementation verification\n` +
      `- Testing and validation\n` +
      `- Address audit findings promptly\n\n` +
      `**4. Final Review & Decision** ✓\n` +
      `- Remediation of any issues\n` +
      `- Final approval process\n` +
      `- Certification grant\n` +
      `- Certificate issuance\n\n` +
      `**Pro Tips:**\n` +
      `- Respond to inquiries within 48 hours\n` +
      `- Keep detailed records of all communications\n` +
      `- Be prepared for technical deep-dives\n` +
      `- Stay flexible for schedule adjustments\n\n` +
      `Almost there! Say "continue" for Phase 6 - Certification Maintenance!`;
    emotion = 'encouraging';
    animation = 'celebrating';
  }
  // Phase 6 specific guidance
  else if (lowerMessage.includes('phase 6') || lowerMessage.includes('phase six') ||
           (lowerMessage.includes('phase') && lowerMessage.includes('6')) ||
           lowerMessage.includes('maintenance') || lowerMessage.includes('ongoing')) {
    message = `🎮 **Phase 6: Certification Maintenance** - Victory & Beyond!\n\n` +
      `Congratulations! Now maintain your certification:\n\n` +
      `**1. Ongoing Compliance** 🔄\n` +
      `- Follow all program requirements\n` +
      `- Maintain security controls\n` +
      `- Keep implementation current\n` +
      `- Monitor for C2PA updates\n\n` +
      `**2. Annual Reviews** 📅\n` +
      `- Prepare annual compliance report\n` +
      `- Update technical documentation\n` +
      `- Provide evidence of ongoing compliance\n` +
      `- Schedule re-assessment as needed\n\n` +
      `**3. Change Management** 🔧\n` +
      `- Report significant changes to your product\n` +
      `- Update C2PA implementation as needed\n` +
      `- Maintain security posture\n` +
      `- Document all modifications\n\n` +
      `**4. Stay Informed** 📰\n` +
      `- Monitor C2PA specification updates\n` +
      `- Participate in community forums\n` +
      `- Attend training and webinars\n` +
      `- Share lessons learned\n\n` +
      `**Best Practices:**\n` +
      `- Set calendar reminders for deadlines\n` +
      `- Maintain a compliance dashboard\n` +
      `- Keep stakeholders informed\n` +
      `- Foster culture of authenticity\n\n` +
      `🏆 **You've leveled up!** You're now part of the C2PA ecosystem! Need help with ongoing compliance? Just ask!`;
    emotion = 'celebrating';
    animation = 'celebrating';
  }
  // General phase overview
  else if (lowerMessage.includes('phase') || lowerMessage.includes('step') ||
           lowerMessage.includes('walk me through') || lowerMessage.includes('guide me')) {
    message = `🎮 **C2PA Certification Journey - 6 Phases**\n\n` +
      `**Phase 1: Introduction & Prerequisites** 🚀\n` +
      `- Check eligibility and readiness\n` +
      `- Understand basic requirements\n` +
      `- Estimate time and resources\n\n` +
      `**Phase 2: Understanding Requirements** 📖\n` +
      `- Deep dive into C2PA specifications\n` +
      `- Study Generator Product standards\n` +
      `- Review security requirements\n\n` +
      `**Phase 3: Document Review** 📚\n` +
      `- Read company agreement carefully\n` +
      `- Review all official documentation\n` +
      `- Conduct gap analysis\n\n` +
      `**Phase 4: Application Preparation** 📝\n` +
      `- Complete application forms\n` +
      `- Prepare technical documentation\n` +
      `- Gather evidence of compliance\n\n` +
      `**Phase 5: Submission & Follow-up** 📤\n` +
      `- Submit your application\n` +
      `- Respond to auditor questions\n` +
      `- Address any findings\n\n` +
      `**Phase 6: Certification Maintenance** ✓\n` +
      `- Maintain ongoing compliance\n` +
      `- Prepare for annual reviews\n` +
      `- Stay updated on C2PA changes\n\n` +
      `**Which phase would you like to explore in detail?** Just say "Phase 1", "Phase 2", etc., or "walk me through Phase X"!`;
    emotion = 'encouraging';
    animation = 'presenting';
  }
  // Help and getting started - friendly and inviting
  else if (lowerMessage.includes('help') || lowerMessage.includes('start') ||
           lowerMessage.includes('begin')) {
    message = `Hey, I'm glad you asked! Let me help you out. 🎮\n\n` +
      `So here's the deal: We're working on getting Sanmarcsoft LLC certified as a C2PA Generator Product Company. ` +
      `It's basically a 6-phase process, and I'm here to be your guide through all of it.\n\n` +
      `**Here's what we can do together:**\n\n` +
      `Want to understand the big picture? Ask me **"What is C2PA?"** or **"Show me all the phases"**\n\n` +
      `Ready to dive in? Say **"Walk me through Phase 1"** and we'll start from the beginning\n\n` +
      `Got specific questions? Just ask naturally - like "What are the security requirements?" or "How long does this take?"\n\n` +
      `Need to check where you're at? Ask me to **"Check my progress"**\n\n` +
      `The cool thing is, you can also upload documents and I can help you review them. And if you've set up GitHub integration, ` +
      `I can even search through your code right here in our conversation.\n\n` +
      `So what sounds good to you? Want to start with the basics, jump into a specific phase, or something else?`;
    emotion = 'encouraging';
    animation = 'waving';
  }
  // C2PA information - explain it like talking to a friend
  else if (lowerMessage.includes('what is c2pa') || lowerMessage.includes('c2pa') ||
           lowerMessage.includes('content provenance') || lowerMessage.includes('authenticity')) {
    message = `Ah, great question! Let me break down C2PA for you. 📸\n\n` +
      `C2PA stands for Coalition for Content Provenance and Authenticity - yeah, it's a mouthful. ` +
      `But what it does is actually really cool.\n\n` +
      `Think of it like this: You know how paintings have certificates of authenticity? C2PA does that for digital content. ` +
      `It's a way to embed information directly into images, videos, audio files - basically any digital content - that proves:\n\n` +
      `• Where it originally came from (who created it)\n` +
      `• How it was made (what tools were used)\n` +
      `• What's happened to it since (any edits or modifications)\n\n` +
      `**Why would you want to become a certified Generator Product Company?**\n\n` +
      `Well, in a world full of deepfakes and AI-generated content, being able to prove your content is authentic is huge. ` +
      `Your users will trust you more, you're helping combat misinformation, and you're joining an ecosystem of companies ` +
      `that care about authenticity.\n\n` +
      `The certification process takes about 3-6 months and involves 6 phases - from understanding the requirements to ` +
      `passing security audits. Don't worry, I'll be here to guide you through every step.\n\n` +
      `Want to dive deeper into any part of this? Or ready to start looking at Phase 1?`;
    emotion = 'informative';
    animation = 'thinking';
  }
  // Continue/next prompts
  else if (lowerMessage.includes('continue') || lowerMessage.includes('next') ||
           lowerMessage.includes('move on') || lowerMessage.includes('proceed')) {
    message = `Great! 🎯 I'm ready to continue.\n\n` +
      `To help you most effectively, please tell me:\n\n` +
      `1. **Which phase are you currently on?** (1-6)\n` +
      `2. **What specific topic do you want to explore?**\n\n` +
      `For example, you can say:\n` +
      `- "Continue with Phase 2"\n` +
      `- "Walk me through security requirements"\n` +
      `- "What's next for documentation?"\n` +
      `- "Help me with the application"\n\n` +
      `I'm here to help every step of the way! 🚀`;
    emotion = 'helpful';
    animation = 'pointing';
  }
  // Progress check
  else if (lowerMessage.includes('progress') || lowerMessage.includes('status') ||
           lowerMessage.includes('where am i')) {
    const currentPhase = context?.currentPhase || 'phase-1';
    const phaseNames = {
      'phase-1': 'Phase 1: Introduction & Prerequisites',
      'phase-2': 'Phase 2: Understanding Requirements',
      'phase-3': 'Phase 3: Document Review',
      'phase-4': 'Phase 4: Application Preparation',
      'phase-5': 'Phase 5: Submission & Follow-up',
      'phase-6': 'Phase 6: Certification Maintenance'
    };
    message = `📊 **Your Current Progress**\n\n` +
      `You're currently on: **${phaseNames[currentPhase] || 'Phase 1'}**\n\n` +
      `To see your complete progress, check the Progress Dashboard. ` +
      `I can help you with:\n\n` +
      `- Understanding your current phase requirements\n` +
      `- Moving to the next phase when ready\n` +
      `- Reviewing completed tasks\n` +
      `- Planning next steps\n\n` +
      `Would you like me to walk you through your current phase in detail?`;
    emotion = 'informative';
    animation = 'presenting';
  }
  // Default response - conversational and helpful
  else {
    // Try to understand what they're asking about
    const codeRelated = lowerMessage.includes('code') || lowerMessage.includes('implementation') ||
                       lowerMessage.includes('function') || lowerMessage.includes('file') ||
                       lowerMessage.includes('service') || lowerMessage.includes('component');

    const technicalQuestion = lowerMessage.includes('how does') || lowerMessage.includes('how do') ||
                             lowerMessage.includes('explain') || lowerMessage.includes('what does');

    if (codeRelated && technicalQuestion) {
      message = `Hmm, that's an interesting technical question about "${userMessage}"!\n\n` +
        `I can see you're curious about the code. Let me check what I know...\n\n` +
        `From what I can tell, this seems to be related to your project implementation. ` +
        `If you've indexed your GitHub repositories, I should be able to pull up the relevant code for you.\n\n` +
        `Want me to try searching your codebase? Or if you haven't set up GitHub integration yet, ` +
        `I can help you get that configured so you can search through your code right here in our chat!`;
    } else if (codeRelated) {
      message = `I see you're asking about code or implementation! That's great.\n\n` +
        `If you've connected your GitHub repository, I can search through your actual code and show you ` +
        `relevant snippets with links to the files. Pretty handy, right?\n\n` +
        `For questions about your C2PA certification journey, just ask naturally - like "How do I get started?" ` +
        `or "What's involved in Phase 2?" I'm here to make this process as smooth as possible for you.`;
    } else if (lowerMessage.length < 10) {
      // Short message - be friendly and encouraging
      message = `Hey there! 👋\n\n` +
        `I'm your C2PA certification buddy. Think of me as your guide through the whole process.\n\n` +
        `We can talk about anything related to getting Sanmarcsoft LLC certified - whether that's ` +
        `understanding what C2PA is, diving into the 6-phase process, reviewing your documents, ` +
        `or even just chatting about where you're at in the journey.\n\n` +
        `What's on your mind?`;
    } else {
      // More thoughtful response for longer queries
      message = `That's a great question - "${userMessage}"\n\n` +
        `Let me think about this for a moment... ` +
        `While I'm in fallback mode right now (no AI model connected), I'm still pretty helpful! ` +
        `I know everything about the C2PA certification process, and if you've set up GitHub integration, ` +
        `I can even search through your code.\n\n` +
        `Here's what I'm really good at helping with:\n\n` +
        `• Walking you through the certification phases (it's a 6-phase journey)\n` +
        `• Explaining specific requirements and what they mean for your company\n` +
        `• Helping you understand C2PA and why it matters\n` +
        `• Tracking your progress and what's next\n` +
        `• Searching your codebase if you've connected GitHub\n\n` +
        `Want to explore any of these areas? Just ask naturally - I'm here to have a conversation with you, not just spit out bullet points!`;
    }
    emotion = 'friendly';
    animation = 'thinking';
  }

  // Enhance response with relevant documents using RAG
  const enhancedMessage = await enhanceWithDocuments(userMessage, message);

  // Note: Fallback responses don't sync to OpenWebUI since they're not generated by OpenWebUI
  // This is only used when OpenWebUI is unavailable

  return {
    message: enhancedMessage,
    emotion,
    animation,
    suggestions: getSuggestions(context),
    openwebuiChatId: openwebuiChatId // Return chat_id for persistence
  };
}

/**
 * Fallback document analysis
 */
function generateFallbackDocumentAnalysis(document) {
  return {
    summary: `This document (${document.original_name}) has been uploaded to your certification workspace. It appears to be a ${document.category} document related to C2PA certification.`,
    keyPoints: [
      'Document uploaded successfully',
      'Review the content for certification requirements',
      'Take notes on key sections'
    ],
    requirements: [
      'Read through the entire document',
      'Identify any action items',
      'Note any questions for clarification'
    ],
    suggestions: [
      'Add annotations to important sections',
      'Discuss any questions with the AI assistant',
      'Move to the next document when ready'
    ]
  };
}

/**
 * Determine emotion based on response content
 */
function determineEmotion(response) {
  const lower = response.toLowerCase();
  if (lower.includes('great') || lower.includes('excellent') || lower.includes('congrat')) {
    return 'encouraging';
  }
  if (lower.includes('important') || lower.includes('note') || lower.includes('remember')) {
    return 'informative';
  }
  if (lower.includes('help') || lower.includes('guide') || lower.includes('assist')) {
    return 'helpful';
  }
  return 'friendly';
}

/**
 * Determine animation based on context
 */
function determineAnimation(userMessage, response) {
  const lowerUser = userMessage.toLowerCase();
  const lowerResponse = response.toLowerCase();

  if (lowerUser.includes('hello') || lowerUser.includes('hi')) {
    return 'waving';
  }
  if (lowerResponse.includes('phase') || lowerResponse.includes('step')) {
    return 'pointing';
  }
  if (lowerResponse.includes('think') || lowerResponse.includes('consider')) {
    return 'thinking';
  }
  if (lowerResponse.includes('congratulations') || lowerResponse.includes('well done')) {
    return 'celebrating';
  }
  return 'idle';
}

module.exports = {
  generateResponse,
  analyzeDocument,
  getSuggestions,
  getOrCreateOpenWebUISession
};
