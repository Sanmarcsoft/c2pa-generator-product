# Themed Components

A comprehensive set of theme-aware React components for the C2PA Generator application. These components automatically adapt to the current theme (Modern Minimalist, Friendly Approachable, or Tech-Savvy) using CSS custom properties.

## Components

### Button

A versatile button component with multiple variants, sizes, and states.

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost'` (default: `'primary'`)
- `size`: `'small' | 'medium' | 'large'` (default: `'medium'`)
- `danger`: `boolean` - Red styling for destructive actions
- `disabled`: `boolean` - Disabled state
- `loading`: `boolean` - Shows spinner
- `fullWidth`: `boolean` - Full width button
- `type`: `'button' | 'submit' | 'reset'` (default: `'button'`)
- `onClick`: `function` - Click handler

**Example:**
```jsx
import { Button } from '../components/themed';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

<Button variant="secondary" size="small">
  Cancel
</Button>

<Button variant="primary" danger loading>
  Delete
</Button>
```

---

### Input

Form input component supporting text, email, password, and textarea variants.

**Props:**
- `type`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'`
- `as`: `'input' | 'textarea'` - Render as input or textarea
- `label`: `string` - Input label
- `placeholder`: `string` - Placeholder text
- `value`: `string | number` - Input value
- `onChange`: `function` - Change handler
- `error`: `boolean | string` - Error state or message
- `success`: `boolean` - Success state
- `disabled`: `boolean` - Disabled state
- `required`: `boolean` - Required field indicator
- `fullWidth`: `boolean` (default: `true`)
- `helperText`: `string` - Helper text below input
- `rows`: `number` - Rows for textarea (default: 3)

**Example:**
```jsx
import { Input } from '../components/themed';

<Input
  label="Email Address"
  type="email"
  placeholder="example@domain.com"
  required
/>

<Input
  as="textarea"
  label="Description"
  rows={4}
  helperText="Maximum 500 characters"
/>

<Input
  label="Username"
  error="Username is required"
/>
```

---

### Card

Container component with optional header, body, and footer sections.

**Props:**
- `children`: `ReactNode` - Card content
- `interactive`: `boolean` - Makes card clickable
- `hover`: `boolean` - Shows hover effects
- `padding`: `'none' | 'small' | 'medium' | 'large'` (default: `'medium'`)
- `onClick`: `function` - Click handler

**Sub-components:**
- `CardHeader` - Card header section
- `CardBody` - Card body section
- `CardFooter` - Card footer section

**Example:**
```jsx
import { Card, CardHeader, CardBody, CardFooter } from '../components/themed';

<Card>
  <h3>Simple Card</h3>
  <p>Card content</p>
</Card>

<Card padding="none">
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

<Card interactive hover onClick={handleClick}>
  <p>Clickable card</p>
</Card>
```

---

### ChatMessage

Chat message bubble component for both user and assistant messages.

**Props:**
- `sender`: `'user' | 'assistant'` (required)
- `message`: `string` - Message text
- `timestamp`: `Date | string | number` - Message timestamp
- `avatar`: `string` - Avatar URL or emoji
- `actions`: `array` - Action buttons
  - `label`: `string` - Button label
  - `icon`: `ReactNode` - Button icon
  - `onClick`: `function` - Click handler
- `isLoading`: `boolean` - Loading state with animated dots

**Example:**
```jsx
import { ChatMessage } from '../components/themed';

<ChatMessage
  sender="user"
  message="What is C2PA?"
  timestamp={new Date()}
/>

<ChatMessage
  sender="assistant"
  message="C2PA is a technical standard..."
  timestamp={new Date()}
  actions={[
    { label: 'View Source', icon: '📎', onClick: handleViewSource },
    { label: 'Copy', icon: '📋', onClick: handleCopy }
  ]}
/>

<ChatMessage sender="assistant" isLoading />
```

---

### Navigation

Responsive navigation bar with mobile hamburger menu.

**Props:**
- `logo`: `ReactNode` (required) - Logo text or component
- `logoHref`: `string` (default: `'/'`)
- `tagline`: `string` - Optional tagline below logo
- `items`: `array` - Navigation items
  - `label`: `string` - Item label
  - `href`: `string` - Item link
  - `icon`: `ReactNode` - Item icon
  - `active`: `boolean` - Active state
- `actions`: `ReactNode` - Action buttons (e.g., login, profile)
- `mobileBreakpoint`: `number` (default: 768) - Breakpoint for mobile menu
- `onNavigate`: `function` - Navigation handler

**Example:**
```jsx
import { Navigation } from '../components/themed';

<Navigation
  logo="C2PA Generator"
  tagline="Certification Assistant"
  items={[
    { label: 'Home', href: '/', active: true, icon: '🏠' },
    { label: 'Chat', href: '/chat', icon: '💬' },
    { label: 'Documents', href: '/docs', icon: '📄' }
  ]}
  actions={
    <>
      <Button variant="ghost" size="small">Login</Button>
      <Button variant="primary" size="small">Sign Up</Button>
    </>
  }
  onNavigate={(item) => console.log('Navigate to:', item)}
/>
```

---

### Modal

Accessible modal/dialog component with focus management.

**Props:**
- `isOpen`: `boolean` (required) - Whether modal is open
- `onClose`: `function` (required) - Close handler
- `title`: `string` - Modal title
- `children`: `ReactNode` (required) - Modal content
- `footer`: `ReactNode` - Modal footer (typically buttons)
- `size`: `'small' | 'medium' | 'large' | 'full'` (default: `'medium'`)
- `closeOnOverlayClick`: `boolean` (default: `true`)
- `closeOnEscape`: `boolean` (default: `true`)
- `showCloseButton`: `boolean` (default: `true`)

**Example:**
```jsx
import { Modal, Button } from '../components/themed';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  footer={
    <>
      <Button variant="secondary" onClick={handleClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

---

### Badge

Small status or label indicator (already exists in codebase).

---

## Theme System

All components use CSS custom properties that are defined by the current theme. The theme is managed by the `ThemeContext` and applied via the `data-theme` attribute on a parent element.

### Available Themes

1. **Modern Minimalist** (`modern-minimalist`) - Clean, sophisticated interface
2. **Friendly Approachable** (`friendly-approachable`) - Warm, welcoming design
3. **Tech-Savvy** (`tech-savvy`) - Professional, technical aesthetic

### Using Themes

```jsx
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

// Wrap your app with ThemeProvider
<ThemeProvider>
  <App />
</ThemeProvider>

// Use theme in components
const { currentTheme, changeTheme } = useTheme();

// Change theme
changeTheme('modern-minimalist');
```

### CSS Custom Properties

All components use these variables (defined in each theme):

**Colors:**
- `--accent-blue`, `--accent-green`, `--accent-yellow`, `--accent-red`
- `--background-primary`, `--background-secondary`, `--background-tertiary`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--border-color`

**Typography:**
- `--font-primary`, `--font-code`
- `--text-display`, `--text-h1`, `--text-h2`, `--text-h3`, `--text-h4`, `--text-h5`
- `--text-base`, `--text-sm`, `--text-xs`
- `--weight-light`, `--weight-regular`, `--weight-medium`, `--weight-semibold`, `--weight-bold`

**Spacing:**
- `--space-1` through `--space-24` (0.25rem to 6rem)

**Border Radius:**
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-full`

**Transitions:**
- `--transition-fast`, `--transition-normal`, `--transition-slow`

---

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus States**: Clear focus indicators with `:focus-visible`
- **ARIA Attributes**: Proper semantic markup and ARIA labels
- **Screen Reader Support**: Descriptive labels and alternative text
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Touch Targets**: Minimum 44x44px for mobile devices

---

## Best Practices

1. **Always import from the index**:
   ```jsx
   import { Button, Input, Card } from '../components/themed';
   ```

2. **Use semantic HTML**: Components render appropriate HTML elements

3. **Provide labels**: Always include labels for inputs and ARIA labels for icon buttons

4. **Handle loading states**: Use `loading` prop on buttons during async operations

5. **Test across themes**: Components should look good in all three themes

6. **Mobile-first**: Components are responsive by default

---

## Development

### Adding New Components

1. Create component file: `NewComponent.jsx`
2. Create styles file: `NewComponent.css`
3. Use CSS custom properties from theme
4. Export from `index.js`
5. Document in this README

### Testing Components

Use the **ThemeShowcase** page to test components across all themes:

```jsx
import ThemeShowcase from '../pages/ThemeShowcase';

// Navigate to /theme-showcase to see all components
```

---

## File Structure

```
frontend/src/
├── components/
│   └── themed/
│       ├── Button.jsx
│       ├── Button.css
│       ├── Input.jsx
│       ├── Input.css
│       ├── Card.jsx
│       ├── Card.css
│       ├── Badge.jsx
│       ├── Badge.css
│       ├── ChatMessage.jsx
│       ├── ChatMessage.css
│       ├── Navigation.jsx
│       ├── Navigation.css
│       ├── Modal.jsx
│       ├── Modal.css
│       ├── index.js
│       └── README.md
├── contexts/
│   └── ThemeContext.jsx
├── styles/
│   └── themes/
│       ├── modernMinimalist.css
│       ├── friendlyApproachable.css
│       └── techSavvy.css
└── pages/
    ├── ThemeShowcase.jsx
    └── ThemeShowcase.css
```

---

## Support

For questions or issues with themed components, please refer to:
- Design specification: `/docs/designs/THEME_01_MODERN_MINIMALIST.md`
- Theme context: `/frontend/src/contexts/ThemeContext.jsx`
- Component showcase: `/frontend/src/pages/ThemeShowcase.jsx`
