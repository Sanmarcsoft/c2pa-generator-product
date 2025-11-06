# Theme Test Suite Documentation

## Overview

This directory contains comprehensive Test-Driven Development (TDD) specifications for three React UI theme implementations for the C2PA Generator Product AI Chatbot Assistant:

1. **Modern Minimalist** - Clean, sophisticated interface with generous whitespace
2. **Friendly & Approachable** - Warm, inviting interface with soft colors and rounded shapes
3. **Tech-Savvy & Trustworthy** - Sophisticated, professional interface with dark theme and electric accents

## Test Files

### Core Test Suites

#### `ThemeSystem.test.jsx`
Tests the core theme management functionality:
- Theme loading and initialization
- Theme switching and state management
- Persistence to localStorage and database
- Default theme fallback behavior
- CSS custom property application
- Performance benchmarks (<100ms switching)

**Key Test Coverage:**
- 8 test suites
- ~50 test cases
- Covers all three themes
- Performance validation
- Error recovery scenarios

#### `ThemeComponents.test.jsx`
Tests component rendering across all themes:
- Button variants (primary, secondary, danger)
- Form elements (text, password, select, textarea)
- Chat interface components
- Navigation components
- Card components
- Modal/dialog components

**Key Test Coverage:**
- 8 test suites
- ~80 test cases per theme
- Cross-theme consistency validation
- Component performance testing

#### `Responsive.test.jsx`
Tests responsive design behavior:
- Mobile viewports (320px, 375px, 414px)
- Tablet viewports (768px, 1024px)
- Desktop viewports (1280px, 1920px)
- Touch target sizes (minimum 44x44px)
- Font size requirements (minimum 14-16px)
- Grid layout adaptations

**Key Test Coverage:**
- 10 test suites
- ~60 test cases
- Multiple viewport sizes
- Touch accessibility validation

#### `Accessibility.test.jsx`
Tests WCAG 2.1 AA compliance:
- Contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Keyboard navigation (Tab, Shift+Tab, Enter, Space)
- Focus indicators (visible and persistent)
- ARIA labels and roles
- Screen reader compatibility
- Color blindness support

**Key Test Coverage:**
- 8 test suites
- ~70 test cases
- Automated axe accessibility testing
- Manual keyboard navigation tests
- Contrast validation for all themes

#### `VisualRegression.test.jsx`
Tests visual consistency:
- Component snapshots for each theme
- Color palette validation (hex format, consistency)
- Typography scale validation
- Spacing system validation (4px base unit)
- Animation timing validation
- Shadow system validation

**Key Test Coverage:**
- 8 test suites
- ~90 test cases
- Jest snapshot testing
- Theme completeness validation
- Cross-theme comparison

#### `Performance.test.jsx`
Tests performance characteristics:
- Theme switching performance (<100ms)
- CSS bundle size optimization
- Animation frame rates (60fps target)
- Paint and layout thrashing prevention
- Memory leak detection
- Render performance (<16ms per frame)

**Key Test Coverage:**
- 10 test suites
- ~60 test cases
- Performance benchmarking
- Memory profiling
- Frame rate analysis

### Utilities

#### `testUtils.js`
Shared utilities and helpers:
- Viewport mocking (`VIEWPORTS`, `setViewport`)
- Color validation (`getContrastRatio`, `meetsWCAGContrast`)
- Performance measurement (`measurePerformance`, `measureFrameRate`)
- Mock data generators
- Accessibility helpers
- LocalStorage mocking

## Running Tests

### Run All Theme Tests

```bash
npm test -- themes
```

### Run Specific Test Suite

```bash
npm test -- ThemeSystem.test.jsx
npm test -- ThemeComponents.test.jsx
npm test -- Responsive.test.jsx
npm test -- Accessibility.test.jsx
npm test -- VisualRegression.test.jsx
npm test -- Performance.test.jsx
```

### Run Tests for Specific Theme

```bash
npm test -- --testNamePattern="modern-minimalist"
npm test -- --testNamePattern="friendly-approachable"
npm test -- --testNamePattern="tech-savvy-trustworthy"
```

### Run with Coverage

```bash
npm test -- --coverage themes
```

### Watch Mode

```bash
npm test -- --watch themes
```

## Test Requirements

### Dependencies

Ensure these packages are installed:

```json
{
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/user-event": "^14.5.1",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "jest-axe": "^8.0.0"
}
```

### Additional Setup

Install jest-axe for accessibility testing:

```bash
npm install --save-dev jest-axe
```

## Test Coverage Goals

### Target Coverage Metrics

- **Line Coverage:** 95%+
- **Branch Coverage:** 90%+
- **Function Coverage:** 95%+
- **Statement Coverage:** 95%+

### Per-Theme Coverage

Each theme should have:
- ✅ All component variants tested
- ✅ All responsive breakpoints validated
- ✅ WCAG 2.1 AA compliance verified
- ✅ Visual snapshots captured
- ✅ Performance benchmarks met

## Requirements Coverage

### Theme System Requirements

| Requirement | Test Suite | Status |
|-------------|-----------|--------|
| Load default theme on first visit | ThemeSystem.test.jsx | ✅ |
| Persist theme to localStorage | ThemeSystem.test.jsx | ✅ |
| Switch themes in <100ms | ThemeSystem.test.jsx, Performance.test.jsx | ✅ |
| Apply CSS custom properties | ThemeSystem.test.jsx | ✅ |
| Fallback to default on error | ThemeSystem.test.jsx | ✅ |

### Component Requirements

| Requirement | Test Suite | Status |
|-------------|-----------|--------|
| Render button variants (3) | ThemeComponents.test.jsx | ✅ |
| Render form inputs (text, password, select, textarea) | ThemeComponents.test.jsx | ✅ |
| Render chat messages (AI, user) | ThemeComponents.test.jsx | ✅ |
| Render navigation (desktop, mobile) | ThemeComponents.test.jsx | ✅ |
| Render cards (standard, interactive) | ThemeComponents.test.jsx | ✅ |
| Render modals/dialogs | ThemeComponents.test.jsx | ✅ |

### Responsive Requirements

| Requirement | Test Suite | Status |
|-------------|-----------|--------|
| Support mobile (320px, 375px, 414px) | Responsive.test.jsx | ✅ |
| Support tablet (768px, 1024px) | Responsive.test.jsx | ✅ |
| Support desktop (1280px, 1920px) | Responsive.test.jsx | ✅ |
| Minimum touch targets (44x44px) | Responsive.test.jsx | ✅ |
| Minimum font sizes (14-16px) | Responsive.test.jsx | ✅ |

### Accessibility Requirements

| Requirement | Test Suite | Status |
|-------------|-----------|--------|
| WCAG 2.1 AA contrast ratios | Accessibility.test.jsx | ✅ |
| Keyboard navigation | Accessibility.test.jsx | ✅ |
| Focus indicators | Accessibility.test.jsx | ✅ |
| ARIA labels and roles | Accessibility.test.jsx | ✅ |
| Screen reader support | Accessibility.test.jsx | ✅ |
| Color blindness support | Accessibility.test.jsx | ✅ |

### Visual Requirements

| Requirement | Test Suite | Status |
|-------------|-----------|--------|
| Consistent color palettes | VisualRegression.test.jsx | ✅ |
| Typography scale validation | VisualRegression.test.jsx | ✅ |
| Spacing system (4px base) | VisualRegression.test.jsx | ✅ |
| Component snapshots | VisualRegression.test.jsx | ✅ |
| Theme completeness | VisualRegression.test.jsx | ✅ |

### Performance Requirements

| Requirement | Test Suite | Status |
|-------------|-----------|--------|
| Theme switch <100ms | Performance.test.jsx | ✅ |
| Render performance <16ms | Performance.test.jsx | ✅ |
| Animation 60fps | Performance.test.jsx | ✅ |
| No memory leaks | Performance.test.jsx | ✅ |
| No layout thrashing | Performance.test.jsx | ✅ |

## Test Data

### Theme Configurations

Expected values for each theme are defined in `testUtils.js`:

```javascript
import { EXPECTED_COLORS, THEME_IDS, THEME_NAMES } from './testUtils';
```

### Mock Data

Utilities provide generators for:
- Chat messages: `generateMockChatMessages(count)`
- Documents: `generateMockDocuments(count)`
- User data: `generateMockUser()`

## Common Test Patterns

### Testing Theme Switch

```javascript
test('should switch theme', () => {
  const { result } = renderHook(() => useTheme(), {
    wrapper: ThemeProvider
  });

  act(() => {
    result.current.setTheme('friendly-approachable');
  });

  expect(result.current.currentTheme).toBe('friendly-approachable');
});
```

### Testing Component Rendering

```javascript
test('should render button in theme', () => {
  render(
    <ThemeProvider initialTheme="modern-minimalist">
      <Button variant="primary">Click Me</Button>
    </ThemeProvider>
  );

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
});
```

### Testing Accessibility

```javascript
test('should have no axe violations', async () => {
  const { container } = render(
    <ThemeProvider>
      <Component />
    </ThemeProvider>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Testing Performance

```javascript
test('should complete in <100ms', () => {
  const duration = measurePerformance(() => {
    // Operation to measure
  });

  expect(duration).toBeLessThan(100);
});
```

## Troubleshooting

### Common Issues

#### Tests Timeout

Increase timeout for async tests:

```javascript
test('async test', async () => {
  // test code
}, 10000); // 10 second timeout
```

#### Snapshot Mismatches

Update snapshots after intentional changes:

```bash
npm test -- -u
```

#### Performance Tests Flaky

Performance tests may be affected by system load. Run multiple times:

```bash
npm test -- --testPathPattern=Performance --runInBand
```

#### Accessibility Violations

Check axe output for specific violations:

```javascript
const results = await axe(container);
console.log(results.violations);
```

## Best Practices

### Writing New Tests

1. **Follow TDD:** Write tests before implementation
2. **Use Descriptive Names:** `test('should render primary button in modern-minimalist theme')`
3. **Test One Thing:** Each test should validate a single behavior
4. **Clean Up:** Use `afterEach` to reset state
5. **Use Test Utils:** Import shared utilities from `testUtils.js`

### Maintaining Tests

1. **Update Snapshots:** When design changes intentionally
2. **Review Coverage:** Ensure new features are tested
3. **Refactor Tests:** Keep tests DRY with shared utilities
4. **Document Changes:** Update this README with new patterns

### Performance Testing

1. **Run in Isolation:** Use `--runInBand` for consistent results
2. **Allow Variance:** Set reasonable thresholds (e.g., <100ms not <50ms)
3. **Profile Regularly:** Catch performance regressions early
4. **Use Real Scenarios:** Test with realistic data sizes

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Theme Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- themes --coverage
      - uses: codecov/codecov-action@v3
```

## Resources

### Related Documentation

- [Theme Design Specs](/docs/designs/)
- [Theme PRD](/docs/UI_THEMES_PRD.md)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [jest-axe Docs](https://github.com/nickcolley/jest-axe)

### WCAG Guidelines

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)

## Contributing

When adding new tests:

1. Follow existing patterns in test files
2. Use utilities from `testUtils.js`
3. Ensure cross-theme coverage
4. Add requirements mapping to this README
5. Update coverage goals if needed

## Support

For questions or issues with the test suite:

1. Check this README first
2. Review existing test patterns
3. Check Jest/React Testing Library docs
4. Ask in team chat or create an issue

---

**Last Updated:** 2025-10-23
**Test Suite Version:** 1.0.0
**Total Test Files:** 6
**Total Test Cases:** ~400+
**Code Coverage Target:** 95%+
