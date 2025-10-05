# E2E Testing Guide

**How to write Playwright tests in CanvasBlox**

---

## Selector Priority (Use in Order)

```
1. getByRole()        ← Buttons, headings, interactive elements
2. getByLabel()       ← Form inputs
3. getByTestId()      ← Dynamic content, custom components
4. CSS/XPath          ← AVOID
```

---

## When to Use Each Selector

| Element | Selector | Example |
|---------|----------|---------|
| Button | `getByRole('button')` | `page.getByRole('button', { name: 'Save' })` |
| Heading | `getByRole('heading')` | `page.getByRole('heading', { name: 'Properties' })` |
| Input | `getByLabel()` | `page.getByLabel('Level Name')` |
| Canvas | `getByTestId()` | `page.getByTestId('level-canvas')` |
| Dynamic value | `getByTestId()` | `page.getByTestId('zoom-display')` |

---

## Adding Test IDs to Components

### ✅ ADD `data-testid` FOR:
- Dynamic values (zoom %, coordinates, counters)
- Status displays
- Custom components (canvas, overlays)
- Elements without semantic roles

### ❌ DON'T ADD `data-testid` FOR:
- Buttons with text → use `getByRole('button', { name: '...' })`
- Headings → use `getByRole('heading')`
- Form inputs with labels → use `getByLabel()`

### Naming Convention

```tsx
// ✅ GOOD: kebab-case, semantic
data-testid="statusbar-zoom-display"
data-testid="canvas-overlay"
data-testid="mouse-position"

// ❌ BAD
data-testid="div1"           // Not semantic
data-testid="ZoomDisplay"    // Not kebab-case
```

---

## Test Consolidation Pattern

When keyboard shortcut and UI button call the same function, test both in ONE test:

**Pattern:**
1. Setup: Create minimal test data
2. Test keyboard shortcut: Verify outcome
3. Reset state (undo or deselect)
4. Test UI button: Verify same outcome
5. Comment: "Both call same function - test both methods"

**Examples:**
- Undo: Ctrl+Z + button (commit 6d9a118)
- Redo: Ctrl+Y, Ctrl+Shift+Z + button (commit 6d9a118)
- Copy: Ctrl+C + button (commit 38864db)
- Paste: Ctrl+V + button (task 13.6)

**Benefits:**
- Reduces test count and duplication
- Makes it clear both inputs produce same result
- Easier to maintain (one place to update)

**Example Test:**
```typescript
test('should redo with Ctrl+Y, Ctrl+Shift+Z, and button', async ({ page }) => {
    // Both shortcuts and button call the same redo function - test all methods

    // Setup: Place tile, undo it
    await placeTile();
    await page.keyboard.press('Control+z');

    // Test Ctrl+Y
    await page.keyboard.press('Control+y');
    expect(tileCount).toBe(1);

    // Reset
    await page.keyboard.press('Control+z');

    // Test Ctrl+Shift+Z
    await page.keyboard.press('Control+Shift+z');
    expect(tileCount).toBe(1);

    // Reset
    await page.keyboard.press('Control+z');

    // Test button
    await redoButton.click();
    expect(tileCount).toBe(1);
});
```

---

## Common Patterns

### Test Dynamic Content

```typescript
// Get element
const zoomDisplay = page.getByTestId('statusbar-zoom-display');

// Check it exists
await expect(zoomDisplay).toBeVisible();

// Check text
await expect(zoomDisplay).toHaveText('100%');

// Get value and parse
const zoomText = await zoomDisplay.textContent();
const zoomValue = parseInt(zoomText?.replace('%', '') || '0');
expect(zoomValue).toBeGreaterThan(100);
```

### Test Buttons

```typescript
// ✅ Use role
await page.getByRole('button', { name: 'Save' }).click();

// ❌ Don't use CSS
await page.locator('.save-button').click();
```

### Test Canvas Interaction

```typescript
const canvas = page.getByTestId('level-canvas');
const box = await canvas.boundingBox();
await page.mouse.move(box.x + 100, box.y + 100);
```

### Use Test Helpers

Use helpers from `e2e/helpers.ts` to reduce boilerplate - `clickCanvas()`, `getObjectCount()`, `getZoomValue()`, etc.

---

## Quick Examples from CanvasBlox

### Example 1: Mouse Position

**Component:**
```tsx
<div data-testid="mouse-position">
  Mouse: ({x}, {y})
</div>
```

**Test:**
```typescript
const mousePos = page.getByTestId('mouse-position');
await expect(mousePos).toMatch(/Mouse: \(\d+, \d+\)/);
```

### Example 2: Zoom Display

**Component:**
```tsx
<span data-testid="statusbar-zoom-display">
  {Math.round(zoom * 100)}%
</span>
```

**Test:**
```typescript
const zoom = page.getByTestId('statusbar-zoom-display');
await expect(zoom).toHaveText('100%');
```

### Example 3: Selection Count

**Component:**
```tsx
<div data-testid="selection-count">
  Selected: {count} objects
</div>
```

**Test:**
```typescript
const count = page.getByTestId('selection-count');
await expect(count).toHaveText('Selected: 0 objects');
```

---

## Common Mistakes

### ❌ BAD
```typescript
// Brittle CSS
await page.locator('footer > div:nth-child(3)').click();

// Complex text matching
const footer = page.locator('footer');
const text = await footer.textContent();
const match = text?.match(/Zoom:\s*(\d+)%/);

// Manual waits
await page.waitForTimeout(500);
```

### ✅ GOOD
```typescript
// Stable test ID
await page.getByTestId('zoom-button').click();

// Direct access
const zoom = page.getByTestId('zoom-display');
const text = await zoom.textContent();

// Auto-waiting
await expect(page.getByTestId('result')).toBeVisible();
```

---

## Testing Checklist

When writing E2E tests:

- [ ] Used `getByRole()` for buttons/headings?
- [ ] Used `getByTestId()` for dynamic content?
- [ ] Avoided CSS selectors?
- [ ] Used auto-waiting (no `waitForTimeout`)?
- [ ] Tested behavior, not implementation?
- [ ] Added semantic `data-testid` to component if needed?

---

## Known Limitations

**Playwright cannot simulate some browser-native events:**
- `Ctrl+wheel` / `Cmd+wheel` for zoom
- Some complex keyboard combos

**If you can't test an interaction, skip it:**
```typescript
test.skip('should zoom with Ctrl+wheel', async ({ page }) => {
  // Manual verification only - Playwright can't simulate Ctrl+wheel
});
```

---

**Questions?** Just ask Claude - I can explain any pattern in detail when you need it.
