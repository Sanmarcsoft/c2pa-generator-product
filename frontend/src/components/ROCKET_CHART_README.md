# RocketProgressChart Component

**Atari-Style Vector Graphics Progress Visualization for Trusteddit C2PA Certification Platform**

---

## Overview

The `RocketProgressChart` component displays C2PA certification progress as an animated vector rocket moving through 6 phase milestones with authentic CRT screen aesthetics inspired by 1980s arcade terminals.

### Key Features

- **CRT Aesthetic**: Scanlines, phosphor glow, and screen vignette effects
- **Vector Graphics**: Green (#00FF00) line-art rocket and milestone markers
- **Smooth Animations**: Rocket moves vertically through phases with cubic-bezier easing
- **4 Phase States**: Pending, In-Progress, Completed, and Go (ready)
- **Interactive**: Hover tooltips and click handlers for phase details
- **Accessible**: Full ARIA support and keyboard navigation
- **Responsive**: Optimized layouts for desktop, tablet, and mobile

---

## Installation & Import

```jsx
import RocketProgressChart from './components/RocketProgressChart';
import './styles/rocket-chart.css';
```

---

## Basic Usage

```jsx
import React from 'react';
import RocketProgressChart from './components/RocketProgressChart';

const MyProgressPage = () => {
  const phases = [
    {
      id: 'phase-1',
      number: 1,
      name: 'Preparation & Registration',
      status: 'completed',
      completedTasks: 3,
      totalTasks: 3
    },
    {
      id: 'phase-2',
      number: 2,
      name: 'Knowledge Assessment',
      status: 'in-progress',
      completedTasks: 1,
      totalTasks: 2
    },
    // ... phases 3-6
  ];

  return (
    <RocketProgressChart
      currentPhase="phase-2"
      phases={phases}
    />
  );
};
```

---

## Props API

### `RocketProgressChart`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentPhase` | `string` | No | `'phase-1'` | Current active phase ID (e.g., `'phase-3'`) |
| `phases` | `Phase[]` | No | `[]` | Array of 6 phase objects with status and details |
| `onPhaseClick` | `(phase: Phase) => void` | No | `null` | Callback function when milestone is clicked |

### `Phase` Object Interface

```typescript
interface Phase {
  id: string;                // Unique identifier: 'phase-1', 'phase-2', etc.
  number: number;            // Phase number: 1-6
  name: string;              // Display name: 'Preparation & Registration'
  status: PhaseStatus;       // 'pending' | 'in-progress' | 'completed' | 'go'
  completedTasks?: number;   // Optional: Number of completed tasks
  totalTasks?: number;       // Optional: Total tasks in phase
}

type PhaseStatus = 'pending' | 'in-progress' | 'completed' | 'go';
```

---

## Phase Status States

### 1. Pending (Gray)
- **Visual**: Gray outline circle (#444)
- **Meaning**: Phase not yet started
- **Usage**: Future phases waiting to be unlocked

### 2. In-Progress (Amber)
- **Visual**: Amber pulsing circle (#FFB000) with glow
- **Meaning**: Currently active phase with incomplete tasks
- **Usage**: User is working on this phase
- **Animation**: Pulsing stroke and glow effect

### 3. Completed (Green)
- **Visual**: Green filled circle (#00FF00) with checkmark
- **Meaning**: All phase tasks completed
- **Usage**: Phase finished, awaiting admin review
- **Icon**: Checkmark path visible inside circle

### 4. Go (Bright Green)
- **Visual**: Bright green filled circle with intense glow
- **Meaning**: Admin-approved, ready for final submission
- **Usage**: Phase approved and cleared for next stage
- **Animation**: Bright pulsing glow effect

---

## Visual Design Details

### Color Palette

```css
--crt-bg: #0a0a0a;           /* Deep black background */
--crt-primary: #00FF00;       /* Bright green vectors */
--crt-secondary: #00DD00;     /* Dimmer green */
--crt-accent: #00FFFF;        /* Cyan highlights */
--crt-dim: #444444;           /* Inactive elements */
--crt-amber: #FFB000;         /* In-progress indicator */
```

### CRT Effects

1. **Scanlines**: Horizontal lines overlaid at 2px intervals
2. **Phosphor Glow**: Drop-shadow filter on active elements
3. **Screen Vignette**: Radial gradient darkening edges
4. **Flicker**: Subtle opacity animation (optional, 3s cycle)

### Typography

- **Font**: `'Courier New', monospace`
- **Phase Numbers**: 0.75rem, bold, uppercase
- **Phase Names**: 0.875rem, medium weight, letter-spacing 0.5px
- **Tooltips**: 0.75rem - 0.875rem

---

## Rocket Animation

### Movement

- **Trigger**: When `currentPhase` prop changes
- **Duration**: 800ms
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (material design standard)
- **Property**: `top` position (Y-axis translation)
- **Exhaust**: Intensifies during movement (faster flicker)

### Rocket Composition

The rocket is built from vector SVG paths:
- **Nose Cone**: Pointed triangle
- **Body**: Rounded rectangle with window/cockpit
- **Fins**: Two trapezoid shapes (left and right)
- **Exhaust**: Animated orange/yellow flame paths

---

## Interactivity

### Hover States

**Milestone Hover**:
- Scale up slightly (1.1x)
- Display tooltip with phase details
- Tooltip shows: name, status, tasks completed

**Rocket Hover**:
- Scale up (1.05x)
- Intensify glow effect

### Click Handlers

```jsx
<RocketProgressChart
  currentPhase="phase-3"
  phases={phases}
  onPhaseClick={(phase) => {
    console.log('User clicked:', phase.name);
    // Open modal, navigate to detail page, etc.
  }}
/>
```

### Keyboard Navigation

- **Tab**: Navigate between milestone markers
- **Enter / Space**: Activate milestone (trigger `onPhaseClick`)
- **Focus Indicator**: Cyan outline (#00FFFF) with 4px offset

---

## Accessibility

### ARIA Attributes

```html
<!-- Container -->
<div
  role="progressbar"
  aria-valuemin="1"
  aria-valuemax="6"
  aria-valuenow="3"
  aria-label="C2PA Certification Progress: Phase 3 of 6"
>

<!-- Milestone Marker -->
<div
  role="button"
  tabindex="0"
  aria-label="Phase 2: Knowledge Assessment - In Progress"
>

<!-- Rocket Icon -->
<div
  role="img"
  aria-label="Progress rocket at Phase 3 of 6"
>
```

### Screen Reader Support

- Live region announces phase changes: `role="status" aria-live="polite"`
- Semantic HTML with proper button roles
- Clear, descriptive labels for all interactive elements

### Reduced Motion

Users with `prefers-reduced-motion` enabled:
- Animations disabled
- Rocket moves instantly (no transition)
- Pulsing effects removed

---

## Responsive Behavior

### Desktop (≥1024px)
- Full height: 600px
- Milestone markers: 32px diameter
- Rocket size: 48x60px
- Phase names visible

### Tablet (768-1023px)
- Reduced height: 500px
- Milestone markers: 24px diameter
- Rocket size: 40x50px
- Smaller font sizes

### Mobile (<768px)
- Height: 450px
- Milestone markers: 20px diameter
- Rocket size: 36x45px
- Phase names hidden (numbers only)
- Tooltips smaller

---

## Integration Example

### With Progress Page (Split-Screen Layout)

```jsx
import React, { useState, useEffect } from 'react';
import RocketProgressChart from './components/RocketProgressChart';
import ChatComponent from './components/ChatComponent';
import DocumentUpload from './components/DocumentUpload';

const IntegratedProgressPage = () => {
  const [currentPhase, setCurrentPhase] = useState('phase-1');
  const [phases, setPhases] = useState([]);

  useEffect(() => {
    // Fetch progress from API
    fetch('/api/progress')
      .then(res => res.json())
      .then(data => {
        setCurrentPhase(data.currentPhase);
        setPhases(data.phases);
      });
  }, []);

  const handlePhaseClick = (phase) => {
    // Open phase details modal
    console.log('Show details for:', phase.name);
  };

  return (
    <div className="progress-page-container">
      {/* Left Panel: Rocket Chart */}
      <div className="left-panel">
        <h2>Your Certification Journey</h2>
        <RocketProgressChart
          currentPhase={currentPhase}
          phases={phases}
          onPhaseClick={handlePhaseClick}
        />
      </div>

      {/* Right Panel: Interactive Tools */}
      <div className="right-panel">
        <ChatComponent currentPhase={currentPhase} />
        <DocumentUpload currentPhase={currentPhase} />
      </div>
    </div>
  );
};
```

---

## Customization

### Alternative Color Scheme (Amber CRT)

Override CSS custom properties:

```css
.rocket-chart-container.amber-theme {
  --crt-primary: #FFB000;
  --crt-secondary: #FF9900;
  --crt-accent: #FFCC00;
}

.rocket-chart-container.amber-theme .rocket-icon {
  filter: drop-shadow(0 0 8px #FFB000) drop-shadow(0 0 16px #FFB000);
}
```

### Disable CRT Flicker

Remove the `.crt-effect` class from the container:

```jsx
<div className="rocket-chart-container"> {/* No crt-effect class */}
```

### Custom Milestone Colors

Modify the CSS for specific status states:

```css
.milestone-marker.in-progress .milestone-circle circle {
  stroke: #FF00FF; /* Magenta instead of amber */
}
```

---

## Performance Considerations

### Optimization Tips

1. **Memoization**: Wrap component in `React.memo()` if parent re-renders frequently
2. **Debounce Updates**: If fetching progress data frequently, debounce API calls
3. **Reduced Motion**: Automatically disables animations for better performance
4. **CSS Animations**: Uses CSS transforms instead of JavaScript for smooth 60fps

### Bundle Size

- **Component**: ~4KB (minified)
- **Styles**: ~3KB (minified)
- **VectorRocket SVG**: ~2KB
- **Total**: ~9KB

---

## Testing

### Unit Tests

Run tests with Jest and React Testing Library:

```bash
npm test RocketProgressChart.test.jsx
```

### Manual Testing Checklist

- [ ] Rocket displays at correct position for each phase
- [ ] CRT effects visible (scanlines, glow, vignette)
- [ ] Milestones change color based on status
- [ ] Rocket animates smoothly when phase changes
- [ ] Click handlers trigger correctly
- [ ] Tooltip displays on hover
- [ ] Keyboard navigation works (Tab + Enter)
- [ ] Screen reader announces phase changes
- [ ] Responsive on mobile/tablet/desktop
- [ ] Reduced motion respected

---

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

**Note**: Requires CSS Grid, CSS Custom Properties, and SVG animation support.

---

## Troubleshooting

### Rocket not animating

**Issue**: Rocket jumps instead of smoothly transitioning
**Solution**: Ensure CSS file is imported and `transition` property is applied

### Tooltips not appearing

**Issue**: Hover doesn't show tooltips
**Solution**: Check z-index stacking context and pointer-events

### Incorrect phase positions

**Issue**: Milestones overlap or misaligned
**Solution**: Verify container height matches CSS (600px default)

### Accessibility warnings

**Issue**: ARIA violations in dev tools
**Solution**: Ensure all phases have unique IDs and proper labels

---

## Related Components

- **VectorRocket**: SVG rocket icon component
- **IntegratedProgressPage**: Parent container page
- **ChatComponent**: AI assistant chat interface
- **DocumentUpload**: Phase-specific document upload

---

## Credits

- **Design Inspiration**: Atari vector graphics arcade games (1980s)
- **CRT Effects**: Based on authentic CRT monitor phosphor glow
- **Color Palette**: Classic green terminal aesthetics

---

## License

Part of Trusteddit C2PA Certification Platform
© 2025 Trusteddit. All rights reserved.
