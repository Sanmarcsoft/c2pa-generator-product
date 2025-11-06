# Trusteddit C2PA Certification Platform - Progress Page Design Specification

**Version:** 1.0.0
**Date:** 2025-11-06
**Designer:** UI/UX Design Specialist
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Flows and Interaction Patterns](#2-user-flows-and-interaction-patterns)
3. [Component Hierarchy](#3-component-hierarchy)
4. [Wireframes](#4-wireframes)
5. [Component Specifications](#5-component-specifications)
6. [Design System and Styling](#6-design-system-and-styling)
7. [Accessibility Requirements](#7-accessibility-requirements)
8. [Responsive Design Specifications](#8-responsive-design-specifications)
9. [Implementation Files](#9-implementation-files)
10. [Summary and Next Steps](#10-summary-and-next-steps)

---

## 1. Executive Summary

### 1.1 Overview

This document specifies the design for the redesigned Progress Page of the Trusteddit C2PA Certification Platform. The page features a split-screen layout with a retro-futuristic "Rocket Progress Chart" on the left and embedded AI Assistant Chat and Document Upload components on the right.

### 1.2 Key Design Decisions

**Split-Screen Layout (Desktop):**
- 50/50 vertical split maximizes both progress visualization and interactive tools
- Allows users to track progress while simultaneously uploading documents or chatting with the AI assistant
- Eliminates navigation between pages for core workflow tasks

**CRT Vector Graphics Aesthetic:**
- Aligns with Trusteddit's "8-Bit Retro" brand theme
- Creates memorable, distinctive visual identity inspired by 1980s arcade terminals
- Uses thin vector lines, phosphor glow effects, and scanline overlays
- Color palette: Bright green (#00FF00) vectors on very dark background (#0a0a0a)

**Mobile Toggle UI:**
- Recognizes that split-screen is impractical on small screens
- Provides clear toggle buttons to switch between Progress Chart and Interactive Tools
- Maintains full functionality while optimizing for touch interaction

**Rocket as Progress Indicator:**
- Uses rocket metaphor (journey, launch, achievement) which resonates with certification process
- Vector-style rocket icon animates vertically through 6 phase milestones
- Position on chart provides immediate visual feedback of completion status

### 1.3 Design System Alignment

This design fully integrates with the existing Trusteddit theme system:
- Uses CSS custom properties from `[data-theme="retro"]` theme
- Maintains brand colors (Trusteddit Blue #3C83F6, Trusteddit Orange #FF4500)
- Follows established spacing scale, typography, and interaction patterns
- Compatible with all four themes but optimized for Retro theme

---

## 2. User Flows and Interaction Patterns

### 2.1 Primary User Flow: Viewing Progress

```
User authenticates
    |
    v
Navigate to /progress
    |
    v
Progress Page loads
    |
    +---> [Desktop] Split-screen view displays
    |         |
    |         +---> Left: Rocket Progress Chart renders
    |         |       - Fetches current phase from API
    |         |       - Animates rocket to current position
    |         |       - Highlights in-progress phase
    |         |
    |         +---> Right: Chat & Upload components render
    |                 - Chat connects to AI service
    |                 - Upload shows phase-specific dropzone
    |
    +---> [Mobile] Toggle panel view
              |
              +---> Defaults to Progress Chart
              +---> Toggle buttons visible at top
```

### 2.2 Interaction Flow: Uploading Document

```
User clicks upload area (or drags file)
    |
    v
File selection dialog opens
    |
    v
User selects document
    |
    v
Phase selector dropdown updates
    |
    v
User selects target phase (1-6)
    |
    v
User selects requirement type
    |
    v
Upload button becomes enabled
    |
    v
User clicks "Upload Document"
    |
    v
Progress bar animates (0% → 100%)
    |
    v
Success message displays
    |
    v
Rocket Progress Chart updates
    |
    +---> If phase complete → Rocket animates to next phase
    +---> If requirements remain → Phase indicator pulses
```

### 2.3 Interaction Flow: Phase Milestone Click

```
User hovers over phase milestone marker
    |
    v
Tooltip appears showing:
    - Phase name
    - Status (Pending / In Progress / Completed)
    - # of documents required/uploaded
    |
    v
User clicks milestone marker
    |
    v
Modal/Panel opens showing:
    - Phase details
    - Requirements checklist
    - Uploaded documents list
    - Action buttons (Upload, View Chat History)
    |
    v
User closes modal
    |
    v
Returns to progress view
```

### 2.4 State Transitions

**Phase Status States:**

```
PENDING
  |
  | (User starts uploading documents)
  v
IN_PROGRESS
  |
  | (All requirements met)
  v
COMPLETED
  |
  | (Admin review & approval)
  v
GO_STATUS (Phase approved for submission)
```

### 2.5 Edge Cases

**No Progress Data:**
- Display: Empty rocket chart with all phases in PENDING state
- Message: "Welcome! Begin your certification journey by uploading documents."
- Action: Prominent CTA to start with Phase 1

**API Failure:**
- Display: Error state with retry button
- Message: "Unable to load progress data. Please check your connection."
- Fallback: Use cached data from localStorage if available

**Document Upload Failure:**
- Display: Error message in upload component
- Action: Retry button, option to select different file
- Preserve form data (phase, requirement type selections)

---

## 3. Component Hierarchy

### 3.1 Component Tree

```
ProgressPage
├── PageHeader
│   └── Title: "Certification Progress"
│
├── ProgressPageContainer
│   ├── LeftPanel (Desktop) / TogglePanel (Mobile)
│   │   └── RocketProgressChart
│   │       ├── CRTBackground
│   │       │   ├── ScanlineOverlay
│   │       │   ├── VignetteEffect
│   │       │   └── PhosphorGlow
│   │       │
│   │       ├── VerticalTrack
│   │       │   ├── ConnectingLine (dashed vertical)
│   │       │   └── PhaseMarkers (6x)
│   │       │       ├── MarkerCircle
│   │       │       ├── PhaseLabel
│   │       │       └── TooltipTrigger
│   │       │
│   │       ├── RocketIcon (SVG)
│   │       │   ├── RocketBody
│   │       │   ├── RocketFins
│   │       │   ├── RocketNose
│   │       │   └── ExhaustGlow
│   │       │
│   │       └── PhaseDetailsModal (conditional)
│   │           ├── ModalHeader
│   │           ├── RequirementsList
│   │           ├── DocumentsList
│   │           └── ActionButtons
│   │
│   └── RightPanel (Desktop) / TogglePanel (Mobile)
│       ├── ChatSection
│       │   └── EmbeddedAIChat
│       │       ├── MessageList
│       │       │   └── MessageBubble (n)
│       │       ├── InputArea
│       │       │   ├── TextInput
│       │       │   └── SendButton
│       │       └── TypingIndicator
│       │
│       └── UploadSection
│           └── EmbeddedDocumentUpload
│               ├── DropZone
│               │   ├── DropIcon
│               │   └── InstructionText
│               ├── FileSelector
│               ├── PhaseSelector (Dropdown)
│               ├── RequirementTypeSelector (Dropdown)
│               ├── UploadButton
│               └── ProgressBar
│
└── MobileToggleBar (Mobile only)
    ├── ToggleButton: Progress Chart
    └── ToggleButton: Interactive Tools
```

### 3.2 Data Flow

```
ProgressPage Component
    |
    +---> useEffect: Fetch progress data on mount
    |         API: GET /api/progress/current
    |         State: currentPhase, phasesData[]
    |
    +---> Pass data down:
    |         RocketProgressChart receives: { currentPhase, phasesData }
    |         EmbeddedDocumentUpload receives: { currentPhase, onUploadSuccess }
    |         EmbeddedAIChat receives: { context: currentPhase }
    |
    +---> Handle events:
              onDocumentUploaded() → Refetch progress data → Update chart
              onPhaseMarkerClick(phaseId) → Open phase details modal
```

### 3.3 Component Responsibilities

**ProgressPage:**
- Layout orchestration
- Data fetching (progress status)
- State management (currentPhase, phasesData)
- Responsive breakpoint handling
- Event coordination between child components

**RocketProgressChart:**
- Visual progress representation
- Phase milestone rendering
- Rocket animation
- CRT visual effects
- Tooltip display
- Phase details modal trigger

**EmbeddedAIChat:**
- Message display
- User input handling
- API communication with AI service
- Typing indicators
- Message history scrolling

**EmbeddedDocumentUpload:**
- File selection (drag-drop & browse)
- Form inputs (phase, requirement type)
- Upload progress display
- Success/error feedback
- File validation

---

## 4. Wireframes

### 4.1 Desktop Layout (≥ 1024px)

```
┌────────────────────────────────────────────────────────────────────┐
│  HEADER: [Logo] TRUSTEDDIT | HOME | PROGRESS | C2PA PRODUCTS      │
│          User Profile ▼                                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─ Certification Progress ────────────────────────────────────┐  │
│  │                                                               │  │
│  │  ┌──────────────────────┬───────────────────────────────┐   │  │
│  │  │                      │                               │   │  │
│  │  │  CRT SCREEN          │  ╔═══════════════════════╗    │   │  │
│  │  │  [Scanlines]         │  ║  AI ASSISTANT CHAT    ║    │   │  │
│  │  │  [Dark: #0a0a0a]     │  ╚═══════════════════════╝    │   │  │
│  │  │                      │  ┌──────────────────────┐    │   │  │
│  │  │   PHASE 1            │  │ User: How do I...    │    │   │  │
│  │  │   ◯────────          │  │                      │    │   │  │
│  │  │   PREPARATION        │  │ AI: To get started...│    │   │  │
│  │  │   ● Completed        │  │                      │    │   │  │
│  │  │                      │  │ User: Thanks!        │    │   │  │
│  │  │   PHASE 2            │  └──────────────────────┘    │   │  │
│  │  │   ◯────────          │  [Type message...]  [Send]   │   │  │
│  │  │   UNDERSTANDING      │                               │   │  │
│  │  │   ● Completed        │  ╔═══════════════════════╗    │   │  │
│  │  │        │             │  ║  DOCUMENT UPLOAD      ║    │   │  │
│  │  │   PHASE 3 ◄──┐       │  ╚═══════════════════════╝    │   │  │
│  │  │   ◯────────  │       │  ┌──────────────────────┐    │   │  │
│  │  │   REVIEW     │       │  │  📄 Drag & Drop      │    │   │  │
│  │  │   ◐ In Progress      │  │     or click to      │    │   │  │
│  │  │        │             │  │     select file      │    │   │  │
│  │  │      [🚀] ◄──┘       │  └──────────────────────┘    │   │  │
│  │  │  (Rocket at          │                               │   │  │
│  │  │   Phase 3)           │  Phase: [▼ Phase 3      ]    │   │  │
│  │  │        │             │  Type:  [▼ Test Results ]    │   │  │
│  │  │   PHASE 4            │                               │   │  │
│  │  │   ◯────────          │  [Upload Document]            │   │  │
│  │  │   APPLICATION        │  ▓▓▓▓▓░░░░░ 45%              │   │  │
│  │  │   ◯ Pending          │                               │   │  │
│  │  │                      │                               │   │  │
│  │  │   PHASE 5            │                               │   │  │
│  │  │   ◯────────          │                               │   │  │
│  │  │   SUBMISSION         │                               │   │  │
│  │  │   ◯ Pending          │                               │   │  │
│  │  │                      │                               │   │  │
│  │  │   PHASE 6            │                               │   │  │
│  │  │   ◯────────          │                               │   │  │
│  │  │   MAINTENANCE        │                               │   │  │
│  │  │   ◯ Pending          │                               │   │  │
│  │  │                      │                               │   │  │
│  │  └──────────────────────┴───────────────────────────────┘   │  │
│  │       50% width                   50% width                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 4.2 Tablet Layout (768px - 1023px)

```
┌─────────────────────────────────────────────┐
│  HEADER: [Logo] TRUSTEDDIT                 │
│          HOME | PROGRESS | User ▼           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ Certification Progress ─────────────┐  │
│  │                                       │  │
│  │  ┌──────────────┬────────────────┐   │  │
│  │  │ CRT SCREEN   │  CHAT & UPLOAD │   │  │
│  │  │              │                │   │  │
│  │  │  PHASE 1 ◯   │  [Chat...]     │   │  │
│  │  │  ● Complete  │                │   │  │
│  │  │              │  [Upload...]   │   │  │
│  │  │  PHASE 2 ◯   │                │   │  │
│  │  │  ● Complete  │                │   │  │
│  │  │              │                │   │  │
│  │  │  PHASE 3 ◯   │                │   │  │
│  │  │  ◐ In Prog   │                │   │  │
│  │  │   [🚀]       │                │   │  │
│  │  │              │                │   │  │
│  │  │  PHASE 4 ◯   │                │   │  │
│  │  │  ◯ Pending   │                │   │  │
│  │  │              │                │   │  │
│  │  │  PHASE 5 ◯   │                │   │  │
│  │  │  ◯ Pending   │                │   │  │
│  │  │              │                │   │  │
│  │  │  PHASE 6 ◯   │                │   │  │
│  │  │  ◯ Pending   │                │   │  │
│  │  │              │                │   │  │
│  │  └──────────────┴────────────────┘   │  │
│  │     50% width       50% width         │  │
│  └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.3 Mobile Layout (< 768px)

```
┌──────────────────────────────────┐
│  HEADER: ☰ [Logo] Profile ▼     │
├──────────────────────────────────┤
│                                  │
│  ┌─ Certification Progress ───┐ │
│  │                             │ │
│  │  ┌─────────┬──────────┐    │ │
│  │  │ PROGRESS│   TOOLS  │    │ │  ← Toggle Buttons
│  │  │  [🚀]   │   [💬]   │    │ │
│  │  └─────────┴──────────┘    │ │
│  │          (Active)           │ │
│  │                             │ │
│  │  ┌───────────────────────┐ │ │
│  │  │                       │ │ │
│  │  │   CRT SCREEN          │ │ │
│  │  │   [Full Width]        │ │ │
│  │  │                       │ │ │
│  │  │   PHASE 1 ◯           │ │ │
│  │  │   ● Completed         │ │ │
│  │  │                       │ │ │
│  │  │   PHASE 2 ◯           │ │ │
│  │  │   ● Completed         │ │ │
│  │  │        │              │ │ │
│  │  │   PHASE 3 ◯           │ │ │
│  │  │   ◐ In Progress       │ │ │
│  │  │     [🚀]              │ │ │
│  │  │        │              │ │ │
│  │  │   PHASE 4 ◯           │ │ │
│  │  │   ◯ Pending           │ │ │
│  │  │                       │ │ │
│  │  │   PHASE 5 ◯           │ │ │
│  │  │   ◯ Pending           │ │ │
│  │  │                       │ │ │
│  │  │   PHASE 6 ◯           │ │ │
│  │  │   ◯ Pending           │ │ │
│  │  │                       │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  └─────────────────────────────┘ │
│                                  │
└──────────────────────────────────┘

When "TOOLS" tab clicked:

┌──────────────────────────────────┐
│  HEADER: ☰ [Logo] Profile ▼     │
├──────────────────────────────────┤
│                                  │
│  ┌─ Certification Progress ───┐ │
│  │                             │ │
│  │  ┌─────────┬──────────┐    │ │
│  │  │ PROGRESS│   TOOLS  │    │ │
│  │  │  [🚀]   │   [💬]   │    │ │
│  │  └─────────┴──────────┘    │ │
│  │                  (Active)   │ │
│  │                             │ │
│  │  ┌───────────────────────┐ │ │
│  │  │  AI CHAT              │ │ │
│  │  │  ┌─────────────────┐  │ │ │
│  │  │  │ Messages...     │  │ │ │
│  │  │  │                 │  │ │ │
│  │  │  └─────────────────┘  │ │ │
│  │  │  [Type...] [Send]    │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  │  ┌───────────────────────┐ │ │
│  │  │  DOCUMENT UPLOAD      │ │ │
│  │  │  ┌─────────────────┐  │ │ │
│  │  │  │  📄 Drop file   │  │ │ │
│  │  │  │                 │  │ │ │
│  │  │  └─────────────────┘  │ │ │
│  │  │  Phase: [▼ Phase 3] │ │ │
│  │  │  Type: [▼ Results ] │ │ │
│  │  │  [Upload Document]   │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  └─────────────────────────────┘ │
│                                  │
└──────────────────────────────────┘
```

---

## 5. Component Specifications

### 5.1 RocketProgressChart Component

**Purpose:** Displays certification progress as a vertical timeline with animated rocket icon.

**File Location:** `/frontend/src/components/RocketProgressChart.jsx`
**CSS File:** `/frontend/src/components/RocketProgressChart.css`

#### Props

```typescript
interface RocketProgressChartProps {
  currentPhase: number;           // 1-6, current active phase
  phasesData: PhaseData[];        // Array of phase information
  onPhaseClick?: (phaseId: number) => void; // Optional click handler
  compact?: boolean;              // Compact mode for tablet/mobile
}

interface PhaseData {
  id: number;                     // 1-6
  name: string;                   // "Preparation", "Understanding", etc.
  status: 'pending' | 'in-progress' | 'completed' | 'go';
  documentsRequired: number;
  documentsUploaded: number;
  description?: string;
}
```

#### State Management

```javascript
const [animatingToPhase, setAnimatingToPhase] = useState(null);
const [tooltipVisible, setTooltipVisible] = useState(false);
const [tooltipPhase, setTooltipPhase] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
const [selectedPhase, setSelectedPhase] = useState(null);
```

#### Rendering Logic

```javascript
// Calculate rocket position based on currentPhase
const rocketPositionY = calculateRocketPosition(currentPhase);

// Phases array with positions
const phases = [
  { id: 1, y: 50, name: 'PHASE 1\nPREPARATION' },
  { id: 2, y: 150, name: 'PHASE 2\nUNDERSTANDING' },
  { id: 3, y: 250, name: 'PHASE 3\nREVIEW' },
  { id: 4, y: 350, name: 'PHASE 4\nAPPLICATION' },
  { id: 5, y: 450, name: 'PHASE 5\nSUBMISSION' },
  { id: 6, y: 550, name: 'PHASE 6\nMAINTENANCE' }
];
```

#### CRT Visual Effects

**Scanlines:**
```css
.crt-scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 10;
}
```

**Phosphor Glow:**
```css
.phosphor-glow {
  box-shadow:
    inset 0 0 80px rgba(0, 255, 0, 0.1),
    inset 0 0 40px rgba(0, 255, 0, 0.15),
    0 0 40px rgba(0, 255, 0, 0.05);
}
```

**Screen Curvature:**
```css
.crt-screen {
  background: #0a0a0a;
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  /* Subtle CRT curve using clip-path */
  clip-path: polygon(
    2% 0%, 98% 0%,
    100% 2%, 100% 98%,
    98% 100%, 2% 100%,
    0% 98%, 0% 2%
  );
}
```

**Vignette:**
```css
.crt-vignette {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  pointer-events: none;
  z-index: 5;
}
```

**Optional Flicker Animation:**
```css
@keyframes crtFlicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.98; }
}

.crt-screen {
  animation: crtFlicker 3s ease-in-out infinite;
}
```

#### Rocket Icon SVG

```svg
<svg
  width="40"
  height="60"
  viewBox="0 0 40 60"
  className="rocket-icon"
  style={{ transform: `translateY(${rocketPositionY}px)` }}
>
  <!-- Rocket Nose (Pointed triangle) -->
  <path
    d="M 20 0 L 28 15 L 12 15 Z"
    fill="none"
    stroke="#00FF00"
    strokeWidth="2"
    className="rocket-part"
  />

  <!-- Rocket Body (Rectangle) -->
  <rect
    x="12"
    y="15"
    width="16"
    height="25"
    fill="none"
    stroke="#00FF00"
    strokeWidth="2"
    className="rocket-part"
  />

  <!-- Left Fin -->
  <path
    d="M 12 30 L 4 45 L 12 40 Z"
    fill="none"
    stroke="#00FF00"
    strokeWidth="2"
    className="rocket-part"
  />

  <!-- Right Fin -->
  <path
    d="M 28 30 L 36 45 L 28 40 Z"
    fill="none"
    stroke="#00FF00"
    strokeWidth="2"
    className="rocket-part"
  />

  <!-- Window (Circle) -->
  <circle
    cx="20"
    cy="25"
    r="3"
    fill="none"
    stroke="#00FFFF"
    strokeWidth="2"
  />

  <!-- Exhaust Glow (Filter effect) -->
  <defs>
    <filter id="exhaustGlow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0
                0 1 0 0 0
                0 0 0 0 0
                0 0 0 1 0"/>
    </filter>
  </defs>

  <circle
    cx="20"
    cy="50"
    r="8"
    fill="#00FF00"
    opacity="0.3"
    filter="url(#exhaustGlow)"
    className="exhaust-glow"
  />
</svg>
```

**Rocket Animation (Phase Change):**
```css
.rocket-icon {
  transition: transform 800ms cubic-bezier(0.4, 0.0, 0.2, 1);
  filter: drop-shadow(0 0 8px rgba(0, 255, 0, 0.8));
}

.rocket-icon.animating {
  animation: rocketLaunch 800ms ease-in-out;
}

@keyframes rocketLaunch {
  0% { transform: translateY(var(--start-y)); }
  20% { transform: translateY(var(--start-y)) scale(1.1); }
  50% { transform: translateY(calc((var(--start-y) + var(--end-y)) / 2)) scale(0.95); }
  80% { transform: translateY(var(--end-y)) scale(1.05); }
  100% { transform: translateY(var(--end-y)) scale(1); }
}
```

#### Phase Milestone Markers

**Marker Circle:**
```jsx
<circle
  cx="200"
  cy={phase.y}
  r="12"
  fill={getMarkerFill(phase.status)}
  stroke="#00FF00"
  strokeWidth="2"
  className={`phase-marker phase-marker-${phase.status}`}
  onClick={() => handlePhaseClick(phase.id)}
  onMouseEnter={() => showTooltip(phase.id)}
  onMouseLeave={() => hideTooltip()}
/>
```

**Marker States:**
```css
/* Pending */
.phase-marker-pending {
  fill: transparent;
  stroke: #444444;
  stroke-width: 2px;
}

/* In Progress */
.phase-marker-in-progress {
  fill: transparent;
  stroke: #00FF00;
  stroke-width: 3px;
  animation: pulseMilestone 1.5s ease-in-out infinite;
}

@keyframes pulseMilestone {
  0%, 100% {
    stroke-opacity: 1;
    filter: drop-shadow(0 0 4px rgba(0, 255, 0, 0.6));
  }
  50% {
    stroke-opacity: 0.5;
    filter: drop-shadow(0 0 12px rgba(0, 255, 0, 1));
  }
}

/* Completed */
.phase-marker-completed {
  fill: #00DD00;
  stroke: #00FF00;
  stroke-width: 2px;
  filter: drop-shadow(0 0 6px rgba(0, 255, 0, 0.4));
}

/* Go Status (Extra bright) */
.phase-marker-go {
  fill: #00FF00;
  stroke: #00FFFF;
  stroke-width: 3px;
  animation: celebrateGo 2s ease-in-out infinite;
}

@keyframes celebrateGo {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(0, 255, 0, 1));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(0, 255, 255, 1));
    transform: scale(1.15);
  }
}
```

**Connecting Vertical Line:**
```svg
<line
  x1="200"
  y1="50"
  x2="200"
  y2="550"
  stroke="#00FF00"
  strokeWidth="2"
  strokeDasharray="8, 4"
  opacity="0.5"
/>
```

**Phase Labels:**
```jsx
<text
  x="230"
  y={phase.y + 5}
  fill="#00FF00"
  fontSize="12"
  fontFamily="'Courier New', monospace"
  letterSpacing="1"
  textTransform="uppercase"
>
  {phase.name}
</text>

<text
  x="230"
  y={phase.y + 20}
  fill="#888888"
  fontSize="11"
  fontFamily="'Courier New', monospace"
>
  {phase.status === 'completed' ? '✓ COMPLETE' :
   phase.status === 'in-progress' ? '◐ IN PROGRESS' :
   '◯ PENDING'}
</text>
```

#### Tooltip

```jsx
{tooltipVisible && (
  <div
    className="phase-tooltip"
    style={{
      top: tooltipPosition.y,
      left: tooltipPosition.x
    }}
  >
    <div className="tooltip-header">{tooltipPhase.name}</div>
    <div className="tooltip-status">{tooltipPhase.status}</div>
    <div className="tooltip-progress">
      {tooltipPhase.documentsUploaded} / {tooltipPhase.documentsRequired} documents
    </div>
    <div className="tooltip-hint">Click for details</div>
  </div>
)}
```

```css
.phase-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #00FF00;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  color: #00FF00;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
  animation: tooltipFadeIn 200ms ease-out;
}

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.tooltip-header {
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #00FFFF;
}

.tooltip-status {
  margin-bottom: 0.25rem;
}

.tooltip-hint {
  margin-top: 0.5rem;
  font-size: 0.65rem;
  color: #888888;
  font-style: italic;
}
```

#### Accessibility

```jsx
<svg
  role="img"
  aria-label={`Certification progress: Currently on Phase ${currentPhase} of 6`}
  aria-describedby="progress-description"
>
  <title>Certification Progress Chart</title>
  <desc id="progress-description">
    A vertical progress chart showing 6 certification phases.
    You are currently at Phase {currentPhase}: {phasesData[currentPhase-1].name}.
    {phasesData.filter(p => p.status === 'completed').length} phases completed.
  </desc>

  {/* SVG content */}
</svg>

{/* Keyboard navigation */}
<button
  className="phase-button sr-only-focusable"
  onClick={() => handlePhaseClick(phase.id)}
  aria-label={`Phase ${phase.id}: ${phase.name}, ${phase.status}`}
>
  Phase {phase.id}
</button>
```

---

### 5.2 EmbeddedAIChat Component

**Purpose:** Compact AI assistant chat interface embedded in the Progress Page.

**File Location:** `/frontend/src/components/EmbeddedAIChat.jsx`
**CSS File:** `/frontend/src/components/EmbeddedAIChat.css`

#### Props

```typescript
interface EmbeddedAIChatProps {
  context?: string;              // Optional context (e.g., current phase)
  maxHeight?: string;            // Max height (default: "400px")
  showHeader?: boolean;          // Show/hide header (default: true)
  compact?: boolean;             // Compact mode (smaller padding)
}
```

#### Structure

```jsx
<div className="embedded-ai-chat">
  <div className="chat-header">
    <span className="chat-icon">🤖</span>
    <h3>AI Assistant</h3>
    <span className="chat-status">{isOnline ? 'Online' : 'Offline'}</span>
  </div>

  <div className="chat-messages" ref={messagesRef}>
    {messages.map(msg => (
      <div
        key={msg.id}
        className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
      >
        <div className="message-avatar">
          {msg.sender === 'user' ? '👤' : '🤖'}
        </div>
        <div className="message-bubble">
          <div className="message-text">{msg.text}</div>
          <div className="message-time">{formatTime(msg.timestamp)}</div>
        </div>
      </div>
    ))}

    {isTyping && (
      <div className="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    )}
  </div>

  <div className="chat-input-area">
    <textarea
      className="chat-input"
      placeholder="Ask a question..."
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyPress={handleKeyPress}
      rows={2}
    />
    <button
      className="chat-send-button"
      onClick={handleSend}
      disabled={!inputValue.trim() || isSending}
    >
      {isSending ? '...' : 'Send'}
    </button>
  </div>
</div>
```

#### Styling

```css
.embedded-ai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--background-secondary, #F9FAFB);
  border: 1px solid var(--border-subtle, #E5E7EB);
  border-radius: var(--radius-lg, 0.75rem);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--background-primary, #FFFFFF);
  border-bottom: 1px solid var(--border-subtle, #E5E7EB);
}

.chat-icon {
  font-size: 1.5rem;
}

.chat-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.chat-status {
  font-size: 0.75rem;
  color: var(--text-tertiary, #9CA3AF);
  padding: 0.25rem 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 12px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
}

.message {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: var(--background-primary, #FFFFFF);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.user-message .message-bubble {
  background: var(--accent-blue, #2563EB);
  color: #FFFFFF;
  border-bottom-right-radius: 0.25rem;
}

.ai-message .message-bubble {
  border-bottom-left-radius: 0.25rem;
}

.message-text {
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.25rem;
}

.message-time {
  font-size: 0.7rem;
  color: var(--text-tertiary, #9CA3AF);
  text-align: right;
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--text-tertiary, #9CA3AF);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

.chat-input-area {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--background-primary, #FFFFFF);
  border-top: 1px solid var(--border-subtle, #E5E7EB);
}

.chat-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-default, #D1D5DB);
  border-radius: var(--radius-md, 0.5rem);
  font-family: inherit;
  font-size: 0.875rem;
  resize: none;
  transition: border-color 150ms;
}

.chat-input:focus {
  outline: none;
  border-color: var(--accent-blue, #2563EB);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.chat-send-button {
  padding: 0.75rem 1.5rem;
  background: var(--accent-blue, #2563EB);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-md, 0.5rem);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 150ms;
}

.chat-send-button:hover:not(:disabled) {
  background: var(--accent-blue-dark, #1D4ED8);
}

.chat-send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Auto-scroll Behavior

```javascript
useEffect(() => {
  if (messagesRef.current) {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }
}, [messages]);
```

#### Accessibility

```jsx
<div
  className="chat-messages"
  role="log"
  aria-live="polite"
  aria-label="Chat messages"
>
  {/* Messages */}
</div>

<textarea
  aria-label="Type your message"
  aria-describedby="chat-hint"
/>
<span id="chat-hint" className="sr-only">
  Press Enter to send message
</span>
```

---

### 5.3 EmbeddedDocumentUpload Component

**Purpose:** Compact document upload interface with drag-and-drop, phase selection, and progress feedback.

**File Location:** `/frontend/src/components/EmbeddedDocumentUpload.jsx`
**CSS File:** `/frontend/src/components/EmbeddedDocumentUpload.css`

#### Props

```typescript
interface EmbeddedDocumentUploadProps {
  currentPhase?: number;          // Pre-select phase (default: user's current phase)
  onUploadSuccess?: (document: Document) => void; // Callback on success
  onUploadError?: (error: Error) => void; // Callback on error
  compact?: boolean;              // Compact mode
}

interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  phase: number;
  requirementType: string;
  uploadedAt: string;
}
```

#### Structure

```jsx
<div className="embedded-document-upload">
  <div className="upload-header">
    <span className="upload-icon">📄</span>
    <h3>Upload Document</h3>
  </div>

  <div
    className={`dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onClick={handleBrowseClick}
  >
    {!file ? (
      <>
        <div className="dropzone-icon">📁</div>
        <p className="dropzone-text">
          <strong>Drag & drop</strong> your file here
          <br />
          or <span className="browse-link">click to browse</span>
        </p>
        <p className="dropzone-hint">
          Supported: PDF, DOC, DOCX, TXT (Max 10MB)
        </p>
      </>
    ) : (
      <>
        <div className="file-preview">
          <span className="file-icon">📄</span>
          <div className="file-info">
            <div className="file-name">{file.name}</div>
            <div className="file-size">{formatFileSize(file.size)}</div>
          </div>
          <button
            className="file-remove"
            onClick={handleRemoveFile}
            aria-label="Remove file"
          >
            ✕
          </button>
        </div>
      </>
    )}
  </div>

  <input
    type="file"
    ref={fileInputRef}
    onChange={handleFileSelect}
    accept=".pdf,.doc,.docx,.txt"
    style={{ display: 'none' }}
  />

  <div className="upload-form">
    <div className="form-group">
      <label htmlFor="phase-selector">Phase:</label>
      <select
        id="phase-selector"
        value={selectedPhase}
        onChange={(e) => setSelectedPhase(Number(e.target.value))}
        disabled={isUploading}
      >
        <option value="">Select Phase...</option>
        <option value="1">Phase 1 - Preparation</option>
        <option value="2">Phase 2 - Understanding</option>
        <option value="3">Phase 3 - Document Review</option>
        <option value="4">Phase 4 - Application</option>
        <option value="5">Phase 5 - Submission</option>
        <option value="6">Phase 6 - Maintenance</option>
      </select>
    </div>

    <div className="form-group">
      <label htmlFor="requirement-type">Requirement Type:</label>
      <select
        id="requirement-type"
        value={requirementType}
        onChange={(e) => setRequirementType(e.target.value)}
        disabled={isUploading || !selectedPhase}
      >
        <option value="">Select Type...</option>
        {getRequirementTypesForPhase(selectedPhase).map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  </div>

  {uploadProgress > 0 && uploadProgress < 100 && (
    <div className="upload-progress">
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
      <div className="progress-text">{uploadProgress}%</div>
    </div>
  )}

  {error && (
    <div className="upload-error">
      <span className="error-icon">⚠️</span>
      <span className="error-message">{error}</span>
    </div>
  )}

  {successMessage && (
    <div className="upload-success">
      <span className="success-icon">✓</span>
      <span className="success-message">{successMessage}</span>
    </div>
  )}

  <button
    className="upload-button"
    onClick={handleUpload}
    disabled={!canUpload || isUploading}
  >
    {isUploading ? 'Uploading...' : 'Upload Document'}
  </button>
</div>
```

#### Styling

```css
.embedded-document-upload {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--background-secondary, #F9FAFB);
  border: 1px solid var(--border-subtle, #E5E7EB);
  border-radius: var(--radius-lg, 0.75rem);
}

.upload-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.upload-icon {
  font-size: 1.5rem;
}

.upload-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.dropzone {
  border: 2px dashed var(--border-default, #D1D5DB);
  border-radius: var(--radius-lg, 0.75rem);
  padding: 2rem;
  text-align: center;
  background: var(--background-primary, #FFFFFF);
  cursor: pointer;
  transition: all 200ms;
}

.dropzone:hover {
  border-color: var(--accent-blue, #2563EB);
  background: rgba(37, 99, 235, 0.02);
}

.dropzone.dragging {
  border-color: var(--accent-blue, #2563EB);
  background: rgba(37, 99, 235, 0.05);
  border-style: solid;
}

.dropzone.has-file {
  border-style: solid;
  border-color: var(--accent-green, #10B981);
  background: rgba(16, 185, 129, 0.02);
}

.dropzone-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.dropzone-text {
  font-size: 0.875rem;
  color: var(--text-secondary, #6B7280);
  margin-bottom: 0.5rem;
}

.dropzone-text strong {
  color: var(--text-primary, #111827);
  font-weight: 600;
}

.browse-link {
  color: var(--accent-blue, #2563EB);
  text-decoration: underline;
}

.dropzone-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary, #9CA3AF);
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-secondary, #F9FAFB);
  border-radius: var(--radius-md, 0.5rem);
}

.file-icon {
  font-size: 2rem;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin-bottom: 0.25rem;
}

.file-size {
  font-size: 0.75rem;
  color: var(--text-tertiary, #9CA3AF);
}

.file-remove {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-tertiary, #9CA3AF);
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  transition: color 150ms;
}

.file-remove:hover {
  color: var(--accent-error, #DC2626);
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #111827);
}

.form-group select {
  padding: 0.75rem;
  border: 1px solid var(--border-default, #D1D5DB);
  border-radius: var(--radius-md, 0.5rem);
  font-family: inherit;
  font-size: 0.875rem;
  background: var(--background-primary, #FFFFFF);
  color: var(--text-primary, #111827);
  cursor: pointer;
  transition: border-color 150ms;
}

.form-group select:focus {
  outline: none;
  border-color: var(--accent-blue, #2563EB);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background: var(--background-tertiary, #E5E7EB);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--accent-blue, #2563EB);
  transition: width 300ms ease-out;
  border-radius: 4px;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #6B7280);
  min-width: 3rem;
  text-align: right;
}

.upload-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(220, 38, 38, 0.05);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-md, 0.5rem);
  color: var(--accent-error, #DC2626);
  font-size: 0.875rem;
}

.upload-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-md, 0.5rem);
  color: var(--accent-green, #10B981);
  font-size: 0.875rem;
}

.upload-button {
  padding: 0.875rem 1.5rem;
  background: var(--accent-blue, #2563EB);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-md, 0.5rem);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 150ms;
  width: 100%;
}

.upload-button:hover:not(:disabled) {
  background: var(--accent-blue-dark, #1D4ED8);
}

.upload-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### File Validation

```javascript
const validateFile = (file) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (file.size > MAX_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File type not supported. Please upload PDF, DOC, DOCX, or TXT');
  }

  return true;
};
```

#### Accessibility

```jsx
<div
  className="dropzone"
  role="button"
  tabIndex={0}
  aria-label="Drop file here or click to browse"
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleBrowseClick();
    }
  }}
>
  {/* Dropzone content */}
</div>

<label htmlFor="phase-selector">
  Phase:
  <span className="required-indicator" aria-label="required">*</span>
</label>
```

---

### 5.4 MobileToggleBar Component

**Purpose:** Toggle buttons for switching between Progress Chart and Interactive Tools on mobile devices.

**File Location:** `/frontend/src/components/MobileToggleBar.jsx`
**CSS File:** `/frontend/src/components/MobileToggleBar.css`

#### Props

```typescript
interface MobileToggleBarProps {
  activePanel: 'progress' | 'tools';
  onToggle: (panel: 'progress' | 'tools') => void;
}
```

#### Structure

```jsx
<div className="mobile-toggle-bar">
  <button
    className={`toggle-button ${activePanel === 'progress' ? 'active' : ''}`}
    onClick={() => onToggle('progress')}
    aria-pressed={activePanel === 'progress'}
  >
    <span className="toggle-icon">🚀</span>
    <span className="toggle-label">Progress</span>
  </button>

  <button
    className={`toggle-button ${activePanel === 'tools' ? 'active' : ''}`}
    onClick={() => onToggle('tools')}
    aria-pressed={activePanel === 'tools'}
  >
    <span className="toggle-icon">💬</span>
    <span className="toggle-label">Tools</span>
  </button>
</div>
```

#### Styling

```css
.mobile-toggle-bar {
  display: none;
}

@media (max-width: 767px) {
  .mobile-toggle-bar {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--background-primary, #FFFFFF);
    border-bottom: 1px solid var(--border-subtle, #E5E7EB);
  }

  .toggle-button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--background-secondary, #F9FAFB);
    border: 2px solid var(--border-default, #D1D5DB);
    border-radius: var(--radius-lg, 0.75rem);
    cursor: pointer;
    transition: all 200ms;
    font-family: inherit;
  }

  .toggle-button.active {
    background: var(--accent-blue, #2563EB);
    border-color: var(--accent-blue, #2563EB);
    color: #FFFFFF;
  }

  .toggle-icon {
    font-size: 1.5rem;
  }

  .toggle-label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .toggle-button:not(.active):hover {
    border-color: var(--accent-blue, #2563EB);
    background: rgba(37, 99, 235, 0.05);
  }
}
```

---

## 6. Design System and Styling

### 6.1 Color Palette

#### CRT Rocket Chart Colors

```css
:root {
  /* CRT Background */
  --crt-bg: #0a0a0a;
  --crt-bg-light: #1a1a1a;

  /* Vector Graphics Colors */
  --crt-primary: #00FF00;      /* Bright green */
  --crt-secondary: #00DD00;    /* Slightly dimmer green */
  --crt-accent: #00FFFF;       /* Cyan for highlights */
  --crt-dim: #444444;          /* Inactive elements */

  /* Alternative: Amber CRT */
  --crt-amber-primary: #FFB000;
  --crt-amber-secondary: #FF9900;
  --crt-amber-accent: #FFCC00;
}
```

#### General UI Colors (Retro Theme)

```css
[data-theme="retro"] {
  /* Backgrounds */
  --background-primary: #000000;
  --background-secondary: #1a1a1a;
  --background-tertiary: #2a2a2a;

  /* Text */
  --text-primary: #00FF00;
  --text-secondary: #00FFFF;
  --text-tertiary: #888888;

  /* Borders */
  --border-default: #00FF00;
  --border-subtle: #444444;

  /* Accents */
  --accent-blue: #00FFFF;
  --accent-green: #00FF00;
  --accent-yellow: #FFFF00;
  --accent-error: #FF00FF;

  /* Trusteddit Brand */
  --trusteddit-blue: #3C83F6;
  --trusteddit-orange: #FF4500;
}
```

### 6.2 Typography

#### Font Families

```css
:root {
  /* Retro Theme Fonts */
  --font-primary: 'Press Start 2P', monospace;
  --font-code: 'Courier New', 'Consolas', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

#### Font Sizes

```css
:root {
  /* Heading Sizes */
  --text-display: 2.5rem;      /* 40px */
  --text-h1: 2rem;             /* 32px */
  --text-h2: 1.5rem;           /* 24px */
  --text-h3: 1.25rem;          /* 20px */
  --text-h4: 1.125rem;         /* 18px */
  --text-h5: 1rem;             /* 16px */

  /* Body Sizes */
  --text-base: 0.875rem;       /* 14px */
  --text-sm: 0.8125rem;        /* 13px */
  --text-xs: 0.75rem;          /* 12px */

  /* Chart-specific */
  --text-phase-label: 0.75rem; /* 12px, uppercase */
  --text-phase-status: 0.6875rem; /* 11px */
}
```

#### Font Weights

```css
:root {
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

#### Line Heights

```css
:root {
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.8;
}
```

#### Letter Spacing

```css
.phase-label {
  letter-spacing: 0.05em;      /* 1px at 12px font */
  text-transform: uppercase;
}

.site-title {
  letter-spacing: -0.02em;     /* Tight for large text */
}
```

### 6.3 Spacing Scale

```css
:root {
  /* Fine-grained scale */
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */

  /* Legacy spacing (for compatibility) */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
}
```

### 6.4 Border Radius

```css
:root {
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;  /* Fully rounded */
}
```

### 6.5 Shadows

```css
:root {
  /* Standard Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* CRT Glow Effects */
  --glow-green: 0 0 10px rgba(0, 255, 0, 0.6), 0 0 20px rgba(0, 255, 0, 0.4);
  --glow-cyan: 0 0 10px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.4);
  --glow-magenta: 0 0 10px rgba(255, 0, 255, 0.6), 0 0 20px rgba(255, 0, 255, 0.4);

  /* Phase Marker Glows */
  --glow-active: 0 0 12px rgba(0, 255, 0, 1), 0 0 24px rgba(0, 255, 0, 0.6);
  --glow-go: 0 0 16px rgba(0, 255, 255, 1), 0 0 32px rgba(0, 255, 255, 0.6);
}
```

### 6.6 Transitions

```css
:root {
  /* Duration */
  --transition-fast: 150ms;
  --transition-base: 250ms;
  --transition-normal: 300ms;
  --transition-slow: 500ms;

  /* Easing */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);

  /* Common Transitions */
  --transition-colors: color var(--transition-base) var(--ease-in-out),
                       background-color var(--transition-base) var(--ease-in-out),
                       border-color var(--transition-base) var(--ease-in-out);

  --transition-transform: transform var(--transition-base) var(--ease-in-out);

  --transition-all: all var(--transition-base) var(--ease-in-out);
}
```

### 6.7 Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-fixed: 1200;
  --z-modal-backdrop: 1300;
  --z-modal: 1400;
  --z-tooltip: 1500;
}
```

### 6.8 Interactive Element States

#### Hover States

```css
/* Buttons */
.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--glow-green);
}

/* Phase Markers */
.phase-marker:hover {
  transform: scale(1.1);
  cursor: pointer;
}

/* Links */
a:hover {
  color: var(--crt-accent);
  text-shadow: var(--glow-cyan);
}
```

#### Focus States

```css
/* Keyboard focus indicator */
*:focus-visible {
  outline: 2px solid var(--crt-accent);
  outline-offset: 2px;
}

/* Input focus */
input:focus,
textarea:focus,
select:focus {
  border-color: var(--crt-accent);
  box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.1);
}
```

#### Active States

```css
.button:active {
  transform: translateY(0);
}

.toggle-button.active {
  background: var(--crt-primary);
  color: var(--crt-bg);
  border-color: var(--crt-primary);
}
```

#### Disabled States

```css
.button:disabled,
input:disabled,
select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### 6.9 Animation Keyframes

```css
/* Pulsing Glow (In-Progress Phase) */
@keyframes pulseMilestone {
  0%, 100% {
    stroke-opacity: 1;
    filter: drop-shadow(0 0 4px rgba(0, 255, 0, 0.6));
  }
  50% {
    stroke-opacity: 0.5;
    filter: drop-shadow(0 0 12px rgba(0, 255, 0, 1));
  }
}

/* Celebration (Go Status) */
@keyframes celebrateGo {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(0, 255, 0, 1));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(0, 255, 255, 1));
    transform: scale(1.15);
  }
}

/* Rocket Launch Animation */
@keyframes rocketLaunch {
  0% { transform: translateY(var(--start-y)); }
  20% { transform: translateY(var(--start-y)) scale(1.1); }
  50% { transform: translateY(calc((var(--start-y) + var(--end-y)) / 2)) scale(0.95); }
  80% { transform: translateY(var(--end-y)) scale(1.05); }
  100% { transform: translateY(var(--end-y)) scale(1); }
}

/* Floating Animation (Hero Avatar) */
@keyframes floating {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In from Bottom */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 7. Accessibility Requirements

### 7.1 WCAG 2.1 AA Compliance

**Color Contrast Ratios:**

Test all color combinations:

```
Text on Background:
- #00FF00 on #0a0a0a: 15.3:1 ✓ (Exceeds AAA - 7:1)
- #00FFFF on #0a0a0a: 14.7:1 ✓ (Exceeds AAA)
- #888888 on #0a0a0a: 4.8:1 ✓ (Meets AA - 4.5:1)
- #FFFFFF on #2563EB: 8.6:1 ✓ (Exceeds AAA)

Interactive Elements (minimum 3:1 for UI components):
- Button borders: #00FF00 on #0a0a0a: 15.3:1 ✓
- Phase markers: #00FF00 on #0a0a0a: 15.3:1 ✓
```

### 7.2 Semantic HTML

```html
<!-- Progress Page Structure -->
<main id="main-content" role="main" aria-labelledby="page-title">
  <h1 id="page-title">Certification Progress</h1>

  <section aria-labelledby="progress-chart-title">
    <h2 id="progress-chart-title" class="sr-only">Progress Visualization</h2>
    <div role="img" aria-label="Rocket progress chart showing Phase 3 of 6 active">
      <!-- SVG Chart -->
    </div>
  </section>

  <section aria-labelledby="chat-title">
    <h2 id="chat-title" class="sr-only">AI Assistant Chat</h2>
    <div role="log" aria-live="polite">
      <!-- Chat messages -->
    </div>
  </section>

  <section aria-labelledby="upload-title">
    <h2 id="upload-title" class="sr-only">Document Upload</h2>
    <form aria-label="Upload certification document">
      <!-- Upload form -->
    </form>
  </section>
</main>
```

### 7.3 ARIA Labels and Roles

**Rocket Progress Chart:**
```html
<svg
  role="img"
  aria-labelledby="chart-title chart-desc"
>
  <title id="chart-title">Certification Progress Chart</title>
  <desc id="chart-desc">
    Interactive progress tracker showing 6 certification phases.
    You are currently at Phase 3: Document Review.
    Phases 1 and 2 are completed.
    Phases 4, 5, and 6 are pending.
  </desc>

  <g role="button"
     tabindex="0"
     aria-label="Phase 3: Document Review - In Progress - Click for details">
    <circle cx="200" cy="250" r="12" />
  </g>
</svg>
```

**Chat Messages:**
```html
<div
  className="chat-messages"
  role="log"
  aria-live="polite"
  aria-atomic="false"
  aria-relevant="additions"
>
  <div className="message user-message" role="article">
    <div aria-label="You said">
      <p>How do I upload documents?</p>
    </div>
  </div>

  <div className="message ai-message" role="article">
    <div aria-label="AI assistant replied">
      <p>To upload documents, use the upload section below...</p>
    </div>
  </div>
</div>
```

**Document Upload:**
```html
<form aria-label="Upload certification document">
  <div
    className="dropzone"
    role="button"
    tabIndex="0"
    aria-label="Drop file here or click to browse. Supported formats: PDF, DOC, DOCX, TXT. Maximum size: 10MB"
  >
    <!-- Dropzone content -->
  </div>

  <label for="phase-selector">
    Phase
    <span className="required" aria-label="required">*</span>
  </label>
  <select
    id="phase-selector"
    aria-required="true"
    aria-describedby="phase-help"
  >
    <option>Select Phase...</option>
  </select>
  <span id="phase-help" className="sr-only">
    Select the certification phase this document relates to
  </span>
</form>
```

**Loading States:**
```html
<div
  role="status"
  aria-live="polite"
  aria-label="Uploading document"
>
  <div className="progress-bar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100">
    45%
  </div>
</div>
```

### 7.4 Keyboard Navigation

**Tab Order:**
1. Skip to main content link (hidden, visible on focus)
2. Header navigation links
3. User profile dropdown button
4. Progress chart phase markers (each focusable)
5. Chat input textarea
6. Chat send button
7. Upload dropzone (acts as button)
8. Phase selector dropdown
9. Requirement type dropdown
10. Upload button

**Keyboard Shortcuts:**
```javascript
// Global keyboard handler
useEffect(() => {
  const handleKeyPress = (e) => {
    // Escape: Close modals/dropdowns
    if (e.key === 'Escape') {
      closeAllModals();
    }

    // Enter/Space on phase marker: Open details
    if ((e.key === 'Enter' || e.key === ' ') &&
        e.target.classList.contains('phase-marker')) {
      e.preventDefault();
      handlePhaseClick(e.target.dataset.phaseId);
    }

    // Ctrl+U: Focus upload section
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      document.getElementById('upload-section').focus();
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Focus Trap in Modals:**
```javascript
// When modal opens, trap focus within modal
const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  firstElement.focus();
};
```

### 7.5 Screen Reader Support

**Skip Links:**
```html
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--crt-bg);
  color: var(--crt-primary);
  padding: 8px;
  text-decoration: none;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
</style>
```

**Screen Reader Only Text:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Live Region Announcements:**
```jsx
// Announce progress updates to screen readers
<div role="status" aria-live="polite" className="sr-only">
  {announcement}
</div>

// Example announcements:
// - "Document uploaded successfully to Phase 3"
// - "Phase 3 completed. Moving to Phase 4"
// - "New message from AI assistant"
```

### 7.6 Focus Management

**Auto-focus on Page Load:**
```javascript
useEffect(() => {
  // Focus page title for screen reader announcement
  document.getElementById('page-title').focus();
}, []);
```

**Focus on Modal Open:**
```javascript
const openPhaseModal = (phaseId) => {
  setModalOpen(true);
  setSelectedPhase(phaseId);

  // Focus modal after render
  setTimeout(() => {
    const modal = document.getElementById('phase-modal');
    const firstButton = modal.querySelector('button');
    firstButton?.focus();
  }, 100);
};
```

**Return Focus on Modal Close:**
```javascript
const closeModal = () => {
  const triggerElement = document.querySelector(`[data-phase-id="${selectedPhase}"]`);
  setModalOpen(false);

  // Return focus to trigger element
  setTimeout(() => {
    triggerElement?.focus();
  }, 100);
};
```

---

## 8. Responsive Design Specifications

### 8.1 Breakpoint Definitions

```css
/* Mobile First Approach */

/* Extra Small (Mobile Portrait) */
/* Default: < 480px */

/* Small (Mobile Landscape) */
@media (min-width: 480px) {
  /* Styles */
}

/* Medium (Tablet Portrait) */
@media (min-width: 768px) {
  /* Split-screen layout starts here */
}

/* Large (Tablet Landscape / Small Desktop) */
@media (min-width: 1024px) {
  /* Full split-screen, optimal spacing */
}

/* Extra Large (Desktop) */
@media (min-width: 1280px) {
  /* Max width containers, generous spacing */
}
```

### 8.2 Layout Adaptations by Breakpoint

#### Mobile (< 768px)

**Layout:**
- Single column, full width
- Toggle buttons at top
- Panels stack vertically when toggled
- Reduced padding (1rem instead of 2rem)

**Progress Chart:**
- Compact height (400px max)
- Smaller rocket icon (30x45)
- Reduced phase marker size (18px)
- Horizontal layout alternative (optional)

**Chat:**
- Full width
- Max height: 300px
- Smaller font sizes

**Upload:**
- Full width
- Stacked form fields
- Larger touch targets (min 44x44px)

```css
@media (max-width: 767px) {
  .progress-page-container {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    display: none;
  }

  .left-panel.active,
  .right-panel.active {
    display: block;
  }

  .rocket-chart {
    height: 400px;
    padding: 1rem;
  }

  .rocket-icon {
    width: 30px;
    height: 45px;
  }

  .phase-marker {
    r: 9px;
  }

  .chat-messages {
    max-height: 300px;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  /* Touch-friendly buttons */
  button,
  .dropzone,
  .toggle-button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

#### Tablet (768px - 1023px)

**Layout:**
- 50/50 split maintained
- Slightly reduced padding
- Smaller fonts

**Progress Chart:**
- Moderate height (500px)
- Standard rocket size (40x60)

```css
@media (min-width: 768px) and (max-width: 1023px) {
  .progress-page-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    height: calc(100vh - 140px);
  }

  .left-panel {
    padding: 1.5rem;
  }

  .right-panel {
    padding: 1rem;
  }

  .rocket-chart {
    height: 500px;
  }

  .chat-messages {
    max-height: 350px;
  }
}
```

#### Desktop (≥ 1024px)

**Layout:**
- Full 50/50 split
- Generous padding (2rem)
- Full-height panels

**Progress Chart:**
- Optimal height (600px)
- Full-size rocket (40x60)
- All visual effects enabled

```css
@media (min-width: 1024px) {
  .progress-page-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    height: calc(100vh - 100px);
  }

  .left-panel {
    padding: 2rem;
  }

  .right-panel {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .rocket-chart {
    height: 600px;
  }

  .chat-messages {
    max-height: 400px;
  }
}
```

### 8.3 Component Responsive Behavior

**RocketProgressChart:**
```css
.rocket-chart {
  width: 100%;
  height: 100%;
  max-height: 600px;
  position: relative;
}

@media (max-width: 767px) {
  .rocket-chart {
    max-height: 400px;
  }

  .phase-label {
    font-size: 0.65rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .rocket-chart {
    max-height: 500px;
  }
}
```

**EmbeddedAIChat:**
```css
.embedded-ai-chat {
  height: 100%;
  min-height: 300px;
}

@media (max-width: 767px) {
  .embedded-ai-chat {
    min-height: 250px;
  }

  .chat-messages {
    max-height: 250px;
  }

  .message-bubble {
    max-width: 80%;
  }
}

@media (min-width: 1024px) {
  .chat-messages {
    max-height: 400px;
  }
}
```

**EmbeddedDocumentUpload:**
```css
.embedded-document-upload {
  width: 100%;
}

@media (max-width: 767px) {
  .dropzone {
    padding: 1.5rem 1rem;
  }

  .dropzone-icon {
    font-size: 2rem;
  }

  .upload-form {
    gap: 0.75rem;
  }
}
```

### 8.4 Touch-Friendly Interactions

**Minimum Touch Target Size:**
```css
/* Ensure all interactive elements meet 44x44px minimum */
@media (max-width: 1023px) {
  button,
  a,
  [role="button"],
  input[type="submit"],
  input[type="button"] {
    min-height: 44px;
    min-width: 44px;
    padding: 0.75rem 1rem;
  }

  .phase-marker {
    /* Increase hit area without changing visual size */
    r: 12px; /* Visual */
    stroke-width: 3px;
  }

  .phase-marker::before {
    /* Expanded hit area */
    content: '';
    position: absolute;
    width: 44px;
    height: 44px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
```

**Touch Gestures:**
```javascript
// Swipe to toggle panels on mobile
let touchStartX = 0;
let touchEndX = 0;

const handleTouchStart = (e) => {
  touchStartX = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeThreshold = 50;

  if (touchEndX < touchStartX - swipeThreshold) {
    // Swipe left: Go to Tools
    setActivePanel('tools');
  }

  if (touchEndX > touchStartX + swipeThreshold) {
    // Swipe right: Go to Progress
    setActivePanel('progress');
  }
};
```

### 8.5 Responsive Typography

```css
/* Fluid typography using clamp() */
:root {
  --text-display: clamp(1.75rem, 4vw, 2.5rem);
  --text-h1: clamp(1.5rem, 3vw, 2rem);
  --text-h2: clamp(1.25rem, 2.5vw, 1.5rem);
  --text-base: clamp(0.8125rem, 1.5vw, 0.875rem);
}

/* Phase labels scale with container */
.phase-label {
  font-size: clamp(0.625rem, 1.5vw, 0.75rem);
}
```

### 8.6 Images and Media

**Responsive Logo:**
```css
.logo-image {
  width: 100%;
  height: auto;
  max-width: 144px;
  object-fit: contain;
}

@media (max-width: 767px) {
  .logo-image {
    max-width: 80px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .logo-image {
    max-width: 100px;
  }
}
```

**Responsive SVG:**
```html
<svg
  viewBox="0 0 400 600"
  preserveAspectRatio="xMidYMid meet"
  style="width: 100%; height: auto;"
>
  <!-- Chart content -->
</svg>
```

### 8.7 Container Queries (Future Enhancement)

```css
/* When container query support is widespread */
@container (min-width: 768px) {
  .rocket-chart {
    /* Styles based on container width, not viewport */
  }
}
```

---

## 9. Implementation Files

The following files should be created/modified for this implementation:

### 9.1 New Files to Create

**Component Files:**

1. `/frontend/src/components/RocketProgressChart.jsx`
   - Main progress chart component with CRT styling
   - SVG rendering of rocket and phase milestones
   - Tooltip and modal functionality

2. `/frontend/src/components/RocketProgressChart.css`
   - CRT visual effects (scanlines, glow, vignette)
   - Rocket animations
   - Phase marker states
   - Responsive adjustments

3. `/frontend/src/components/EmbeddedAIChat.jsx`
   - Compact chat interface
   - Message display and input
   - Auto-scroll and typing indicators

4. `/frontend/src/components/EmbeddedAIChat.css`
   - Chat bubble styling
   - Message layout
   - Input area design

5. `/frontend/src/components/EmbeddedDocumentUpload.jsx`
   - Drag-and-drop file upload
   - Form inputs (phase, requirement type)
   - Progress and feedback display

6. `/frontend/src/components/EmbeddedDocumentUpload.css`
   - Dropzone styling
   - Form layout
   - Progress bar design

7. `/frontend/src/components/MobileToggleBar.jsx`
   - Toggle buttons for mobile view
   - Panel switching logic

8. `/frontend/src/components/MobileToggleBar.css`
   - Toggle button styling
   - Active state indicators

**Page Files:**

9. `/frontend/src/pages/ProgressPage.jsx`
   - Main page component
   - Layout orchestration
   - Data fetching and state management

10. `/frontend/src/pages/ProgressPage.css`
    - Page layout (split-screen grid)
    - Panel styling
    - Responsive breakpoints

**Additional Files:**

11. `/frontend/src/utils/progressHelpers.js`
    - Utility functions for progress calculations
    - Phase position calculations
    - Status determination logic

12. `/frontend/src/hooks/useProgress.js`
    - Custom hook for progress data fetching
    - State management
    - API integration

### 9.2 Files to Modify

**Existing Files:**

1. `/frontend/src/App.jsx`
   - Add route for `/progress` page (if not exists)
   - Import ProgressPage component

2. `/frontend/src/components/Header.jsx`
   - Update logo sizing (144px → 60px)
   - Adjust site title font size
   - Ensure "PROGRESS" link exists and is styled correctly

3. `/frontend/src/components/Header.css`
   - Modify `.logo-image` max-height to 60px
   - Adjust `.logo-text` font-size to 1.5rem
   - Update responsive breakpoints

4. `/frontend/src/styles/global.css`
   - Add CRT-specific CSS variables if not already present
   - Ensure design tokens are defined

5. `/frontend/src/styles/themes/retro.css`
   - Verify CRT color variables exist
   - Add any missing glow effects or animation keyframes

### 9.3 API Endpoints Needed

**Backend Routes (if not existing):**

1. `GET /api/progress/current`
   - Returns current phase and detailed progress data
   - Response:
   ```json
   {
     "currentPhase": 3,
     "phases": [
       {
         "id": 1,
         "name": "Preparation",
         "status": "completed",
         "documentsRequired": 5,
         "documentsUploaded": 5
       },
       // ... phases 2-6
     ]
   }
   ```

2. `GET /api/progress/phases/:phaseId`
   - Returns detailed information for a specific phase
   - Includes requirements, uploaded documents, checklist

3. `POST /api/documents/upload`
   - Handles document upload with multipart form data
   - Requires: file, phase, requirementType
   - Returns: document metadata

4. `GET /api/requirements/types?phase=:phaseId`
   - Returns requirement types for a given phase
   - Used to populate dropdown options

### 9.4 File Structure Overview

```
/frontend/src/
├── components/
│   ├── RocketProgressChart.jsx         [NEW]
│   ├── RocketProgressChart.css         [NEW]
│   ├── EmbeddedAIChat.jsx             [NEW]
│   ├── EmbeddedAIChat.css             [NEW]
│   ├── EmbeddedDocumentUpload.jsx     [NEW]
│   ├── EmbeddedDocumentUpload.css     [NEW]
│   ├── MobileToggleBar.jsx            [NEW]
│   ├── MobileToggleBar.css            [NEW]
│   ├── Header.jsx                     [MODIFY]
│   └── Header.css                     [MODIFY]
│
├── pages/
│   ├── ProgressPage.jsx               [NEW or MODIFY]
│   └── ProgressPage.css               [NEW or MODIFY]
│
├── hooks/
│   └── useProgress.js                 [NEW]
│
├── utils/
│   └── progressHelpers.js             [NEW]
│
├── styles/
│   ├── global.css                     [MODIFY]
│   └── themes/
│       └── retro.css                  [MODIFY]
│
└── App.jsx                            [MODIFY]
```

---

## 10. Summary and Next Steps

### 10.1 Design Completion Status

This design specification document provides:

✓ **Complete Visual Design**
- CRT vector graphics aesthetic with scanlines, glow, and vignette effects
- Rocket icon SVG specification with animation
- Phase milestone marker designs and states
- Color palette and typography system

✓ **Comprehensive Component Specifications**
- RocketProgressChart with full props, state, and rendering logic
- EmbeddedAIChat with message display and input
- EmbeddedDocumentUpload with drag-drop and form controls
- MobileToggleBar for responsive navigation

✓ **Detailed Layout Specifications**
- Desktop split-screen (50/50)
- Tablet split-screen (adjusted)
- Mobile toggle panel system
- Responsive breakpoints and adaptations

✓ **Accessibility Compliance**
- WCAG 2.1 AA color contrast verified
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation patterns
- Screen reader support

✓ **Responsive Design**
- Mobile-first approach
- Touch-friendly interactions (44x44px minimum)
- Fluid typography
- Responsive images and SVG

### 10.2 Ready-for-Development Checklist

**Phase 1: Setup and Core Layout**
- [ ] Create base ProgressPage component with split-screen grid layout
- [ ] Implement responsive breakpoints (mobile toggle system)
- [ ] Set up data fetching with useProgress hook
- [ ] Modify Header component (logo sizing, navigation)

**Phase 2: Rocket Progress Chart**
- [ ] Create RocketProgressChart component structure
- [ ] Implement CRT background with visual effects (scanlines, glow, vignette)
- [ ] Build SVG rocket icon with positioning logic
- [ ] Render phase milestone markers with states (pending, in-progress, completed, go)
- [ ] Add vertical connecting line
- [ ] Implement tooltip on hover
- [ ] Add rocket launch animation
- [ ] Implement phase click handler (modal trigger)

**Phase 3: Embedded Components**
- [ ] Create EmbeddedAIChat component
- [ ] Implement message display with auto-scroll
- [ ] Add chat input and send functionality
- [ ] Create EmbeddedDocumentUpload component
- [ ] Implement drag-and-drop file handling
- [ ] Add form controls (phase selector, requirement type)
- [ ] Build progress bar and feedback display

**Phase 4: Mobile Experience**
- [ ] Create MobileToggleBar component
- [ ] Implement panel switching logic
- [ ] Add swipe gesture support (optional)
- [ ] Test touch interactions on real devices

**Phase 5: Accessibility**
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard navigation
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Verify color contrast ratios
- [ ] Add skip links and focus management

**Phase 6: Polish and Testing**
- [ ] Fine-tune animations and transitions
- [ ] Test across browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test responsive behavior at all breakpoints
- [ ] Conduct usability testing
- [ ] Performance optimization (lazy loading, code splitting)

### 10.3 Recommendations for Implementation

**Development Order:**

1. **Start with Layout Structure** - Build the page skeleton and grid system first. This establishes the foundation for all components.

2. **Build Static Rocket Chart** - Create the CRT background and static phase markers before adding animations. Verify visual appearance matches specification.

3. **Add Interactivity Gradually** - Implement hover tooltips, then click handlers, then animations. Test each interaction layer independently.

4. **Integrate Live Data** - Connect to API endpoints once the UI is functional with mock data. This allows frontend development to proceed independently.

5. **Mobile Last, But Not Least** - While using a mobile-first CSS approach, implement the mobile toggle system after the desktop version is stable. This ensures the core experience is solid.

6. **Accessibility Throughout** - Don't defer accessibility to the end. Add ARIA labels and keyboard navigation as you build each component.

**Code Quality Standards:**

- **Component Size**: Keep components under 300 lines. Extract sub-components if needed.
- **CSS Organization**: Use BEM naming convention for CSS classes. Group related styles together.
- **Performance**: Use React.memo() for RocketProgressChart if it receives frequent prop updates.
- **Error Handling**: Implement comprehensive error boundaries and user-friendly error messages.
- **Testing**: Write unit tests for utility functions and integration tests for key user flows.

**Browser Testing Matrix:**

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest 2 | High |
| Firefox | Latest 2 | High |
| Safari | Latest 2 | High |
| Edge | Latest 2 | Medium |
| Mobile Safari (iOS) | Latest | High |
| Chrome (Android) | Latest | High |

**Performance Targets:**

- Initial page load: < 2 seconds
- Rocket animation: 60fps (smooth)
- Document upload progress: Real-time updates (< 100ms latency)
- Chat message display: < 50ms from receive to render

### 10.4 Known Challenges and Solutions

**Challenge 1: SVG Animation Performance**
- **Issue**: Complex SVG animations may lag on lower-end devices
- **Solution**: Use CSS transforms instead of SVG attribute animations. Consider requestAnimationFrame for complex sequences.

**Challenge 2: CRT Effect Authenticity**
- **Issue**: Achieving authentic CRT look without performance impact
- **Solution**: Use static background images for scanlines instead of CSS gradients. Apply effects sparingly on mobile.

**Challenge 3: Real-time Progress Updates**
- **Issue**: Rocket chart needs to update when documents are uploaded
- **Solution**: Implement WebSocket connection or use polling (every 5 seconds). Show optimistic UI updates immediately.

**Challenge 4: Mobile Layout Switching**
- **Issue**: Maintaining state when toggling between Progress and Tools panels
- **Solution**: Keep both components mounted but hidden via CSS. Use `display: none` instead of conditional rendering.

**Challenge 5: Accessibility of SVG Chart**
- **Issue**: Making SVG chart fully accessible to screen readers
- **Solution**: Provide detailed ARIA labels, use semantic roles, and offer alternative text summary of progress status.

### 10.5 Future Enhancements

**Phase 2 Features (Post-MVP):**

1. **Animated Rocket Exhaust** - Particle effect showing rocket "thrust" during phase transitions
2. **Phase Detail Modal** - Full-screen modal with requirements checklist, document list, and phase-specific guidance
3. **Progress Sharing** - Generate shareable link or PDF report of certification progress
4. **Achievement Badges** - Award visual badges when phases complete
5. **Historical Timeline** - View past progress changes with date stamps
6. **Multi-Product View** - Switch between different C2PA products in progress tracking
7. **Dark Mode CRT** - Already designed; implement theme toggle
8. **Amber CRT Option** - Alternative color scheme (amber instead of green)
9. **Confetti Celebration** - Visual celebration when final phase completes
10. **Export Progress Report** - Download PDF with full progress summary

**Experimental Features:**

- **3D Rocket Model** - Use Three.js for 3D rendered rocket (performance intensive)
- **Voice Input for Chat** - Speech-to-text for AI assistant queries
- **Gamification** - Points, levels, and leaderboards for certification progress
- **AR Progress View** - View rocket chart in augmented reality using device camera

---

## Appendix A: Design Tokens Reference

```css
/* Complete Design Token Reference */
:root {
  /* === COLORS === */

  /* CRT Rocket Chart */
  --crt-bg: #0a0a0a;
  --crt-bg-light: #1a1a1a;
  --crt-primary: #00FF00;
  --crt-secondary: #00DD00;
  --crt-accent: #00FFFF;
  --crt-dim: #444444;
  --crt-amber-primary: #FFB000;
  --crt-amber-secondary: #FF9900;
  --crt-amber-accent: #FFCC00;

  /* General UI */
  --background-primary: #000000;
  --background-secondary: #1a1a1a;
  --background-tertiary: #2a2a2a;
  --text-primary: #00FF00;
  --text-secondary: #00FFFF;
  --text-tertiary: #888888;
  --border-default: #00FF00;
  --border-subtle: #444444;

  /* Accents */
  --accent-blue: #00FFFF;
  --accent-green: #00FF00;
  --accent-yellow: #FFFF00;
  --accent-error: #FF00FF;
  --trusteddit-blue: #3C83F6;
  --trusteddit-orange: #FF4500;

  /* === TYPOGRAPHY === */
  --font-primary: 'Press Start 2P', monospace;
  --font-code: 'Courier New', 'Consolas', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  --text-display: 2.5rem;
  --text-h1: 2rem;
  --text-h2: 1.5rem;
  --text-h3: 1.25rem;
  --text-h4: 1.125rem;
  --text-h5: 1rem;
  --text-base: 0.875rem;
  --text-sm: 0.8125rem;
  --text-xs: 0.75rem;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.8;

  /* === SPACING === */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* === BORDERS & RADIUS === */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* === SHADOWS === */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  --glow-green: 0 0 10px rgba(0, 255, 0, 0.6), 0 0 20px rgba(0, 255, 0, 0.4);
  --glow-cyan: 0 0 10px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.4);
  --glow-magenta: 0 0 10px rgba(255, 0, 255, 0.6), 0 0 20px rgba(255, 0, 255, 0.4);
  --glow-active: 0 0 12px rgba(0, 255, 0, 1), 0 0 24px rgba(0, 255, 0, 0.6);
  --glow-go: 0 0 16px rgba(0, 255, 255, 1), 0 0 32px rgba(0, 255, 255, 0.6);

  /* === TRANSITIONS === */
  --transition-fast: 150ms;
  --transition-base: 250ms;
  --transition-normal: 300ms;
  --transition-slow: 500ms;

  /* === Z-INDEX === */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-fixed: 1200;
  --z-modal-backdrop: 1300;
  --z-modal: 1400;
  --z-tooltip: 1500;
}
```

---

## Appendix B: Code Snippets

### B.1 ProgressPage Component (Skeleton)

```jsx
import React, { useState, useEffect } from 'react';
import RocketProgressChart from '../components/RocketProgressChart';
import EmbeddedAIChat from '../components/EmbeddedAIChat';
import EmbeddedDocumentUpload from '../components/EmbeddedDocumentUpload';
import MobileToggleBar from '../components/MobileToggleBar';
import { useProgress } from '../hooks/useProgress';
import './ProgressPage.css';

function ProgressPage() {
  const { currentPhase, phasesData, loading, error, refetch } = useProgress();
  const [activePanel, setActivePanel] = useState('progress');

  const handleDocumentUpload = (document) => {
    // Refetch progress data after successful upload
    refetch();
  };

  const handlePhaseClick = (phaseId) => {
    // Open phase details modal
    console.log('Phase clicked:', phaseId);
  };

  if (loading) return <div>Loading progress...</div>;
  if (error) return <div>Error loading progress: {error.message}</div>;

  return (
    <div className="progress-page">
      <header className="page-header">
        <h1 id="page-title">Certification Progress</h1>
      </header>

      <MobileToggleBar
        activePanel={activePanel}
        onToggle={setActivePanel}
      />

      <div className="progress-page-container">
        <div className={`left-panel ${activePanel === 'progress' ? 'active' : ''}`}>
          <RocketProgressChart
            currentPhase={currentPhase}
            phasesData={phasesData}
            onPhaseClick={handlePhaseClick}
          />
        </div>

        <div className={`right-panel ${activePanel === 'tools' ? 'active' : ''}`}>
          <section className="chat-section">
            <EmbeddedAIChat context={`Phase ${currentPhase}`} />
          </section>

          <section className="upload-section">
            <EmbeddedDocumentUpload
              currentPhase={currentPhase}
              onUploadSuccess={handleDocumentUpload}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;
```

### B.2 useProgress Hook

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useProgress() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phasesData, setPhasesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/progress/current');
      setCurrentPhase(response.data.currentPhase);
      setPhasesData(response.data.phases);
    } catch (err) {
      setError(err);
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return {
    currentPhase,
    phasesData,
    loading,
    error,
    refetch: fetchProgress
  };
}
```

### B.3 Progress Calculation Helper

```javascript
export const calculateRocketPosition = (currentPhase, totalPhases = 6) => {
  const chartHeight = 600;
  const topMargin = 50;
  const bottomMargin = 50;
  const availableHeight = chartHeight - topMargin - bottomMargin;
  const phaseGap = availableHeight / (totalPhases - 1);

  return topMargin + (currentPhase - 1) * phaseGap;
};

export const getPhaseStatus = (phase, currentPhase, documents) => {
  if (phase.id < currentPhase) return 'completed';
  if (phase.id === currentPhase) return 'in-progress';
  if (phase.id > currentPhase) return 'pending';

  // Check for "go" status if all documents uploaded
  if (phase.documentsUploaded >= phase.documentsRequired) {
    return 'go';
  }

  return 'pending';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
```

---

## Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-06 | UI/UX Design Specialist | Initial design specification |

**Approval:**

- Design Lead: _____________________ Date: _________
- Frontend Lead: _____________________ Date: _________
- Product Owner: _____________________ Date: _________

**Distribution:**

- Frontend Development Team
- QA/Testing Team
- Product Management
- Accessibility Specialist

---

**END OF DESIGN SPECIFICATION DOCUMENT**

For questions or clarifications, contact the design team or refer to the implementation guide in Section 10.
