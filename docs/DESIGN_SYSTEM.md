# CanvasBlox Design System

This document describes the visual design system, patterns, and implementation decisions for the CanvasBlox level editor.

## Color Palette

### Base Colors (CSS Variables)
Defined in `client/src/index.css`:

```css
--background: hsl(0 0% 10%)        /* Dark gray background */
--foreground: hsl(0 0% 90%)        /* Light gray text */
--card: hsl(0 0% 13%)              /* Slightly lighter than background */
--primary: hsl(217 91% 60%)        /* Blue - main accent */
--accent: hsl(188 95% 43%)         /* Cyan - secondary accent */
--destructive: hsl(0 84% 60%)      /* Red - delete/danger */
--border: hsl(0 0% 23%)            /* Subtle borders */
```

### Special Colors
- **Roblox Gradient:** `linear-gradient(135deg, #E4261F 0%, #9333EA 50%, #3B82F6 100%)`
  - Used in: Header background
  - Purpose: Branding, visual impact
- **Canvas Background:** `#5C94FC` (Mario sky blue)
  - Purpose: Familiar, inviting game aesthetic

### Tool Color Coding
- **Selection Tools:** Blue (`bg-blue-600`)
- **Drawing Tools:** Green (`bg-green-600`)
- **Linking Tools:** Purple (`bg-purple-600`)
- **Delete/Danger:** Red/Orange

### Palette Category Accents
- **Platforms:** Gray (`border-gray-500`)
- **Interactables:** Purple (`border-purple-500`)
- **Decorations:** Green (`border-green-500`)
- **Spawn Points:** Blue (`border-blue-500`)

## Typography

### Font Families
```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif
--font-serif: Georgia, serif
--font-mono: Menlo, monospace
```

Primary font: **Inter** (sans-serif) for all UI text.

## Shadows

### Shadow System (Chapter 8 - October 2025)
Custom shadow values optimized for dark theme in `tailwind.config.ts`:

```typescript
shadow-sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)"
shadow-md: "0 4px 6px -1px rgba(0, 0, 0, 0.4)"
shadow-lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
shadow-xl: "0 20px 25px -5px rgba(0, 0, 0, 0.6)"
```

**Design Decision:** Replaced Tailwind's default shadows (0.05-0.1 opacity) with darker variants (0.3-0.6 opacity) for better visibility on dark backgrounds.

**Usage:**
- `shadow-sm`: Subtle elements, small buttons
- `shadow-md`: Cards, tile palette items
- `shadow-lg`: Panels, modals, elevated surfaces
- `shadow-xl`: Floating elements, dropdowns

**Active in:** TilePalette cards (`shadow-lg hover:shadow-xl`)

## Borders

### Border Widths
- Standard: `1px` (via Tailwind's `border`)
- Accent strips: `4px` (via `border-l-4`)
- Selection rings: `2px` (via `ring-2`)

### Border Colors & Opacity
- **Subtle borders:** `border-white/10` (10% white)
  - Used for: Tile cards, glassmorphism panels
  - Purpose: Edge definition without heavy lines
- **Standard borders:** `border-border` (hsl(0 0% 23%))
  - Used for: Panel dividers, structural elements
- **Category accents:** Color-coded `border-l-4`
  - Used for: TilePalette category headers

## Effects

### Glassmorphism
Applied to: Toolbar, modal overlays

**Pattern:**
```css
bg-card/80 backdrop-blur-md border border-white/10
```

**Design Decision (Chapter 8):** Limited to toolbar only. Avoided applying to all panels to prevent performance issues and visual overload.

### Glow Effects
Defined in `client/src/index.css`:

```css
.active-glow {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);  /* Blue */
}

.active-glow-red {
  box-shadow: 0 0 20px rgba(228, 38, 31, 0.4);   /* Red */
}
```

**Usage:**
- Active tools: Blue glow
- Hover states: Increased glow intensity
- Delete actions: Red glow

**Design Decision (Chapter 8):** Kept existing glows, did not add more to avoid visual noise.

### Transitions
Standard transition: `transition-all duration-150 ease`

**Specific transitions:**
- Tool buttons: `all 0.15s ease`
- Hover lift: `transform: translateY(-2px)` with transition
- Modal animations: `fadeIn 0.2s ease`, `slideUp 0.3s ease`

## Interactive States

### Hover States
- **Buttons/Tools:** Lighter background + subtle glow
- **Tile cards:** Translate up 2px + increase shadow
- **Zoom controls:** Scale 1.05

### Active States
- **Tool buttons:**
  - Background: Color-coded (blue/green/purple)
  - Glow: Matching color at 0.5 opacity
  - Bottom border: 2px accent line
- **Selected tile cards:**
  - Ring: 2px primary color
  - Glow: Blue at 0.4 opacity

### Focus States
- Input fields: Border color changes to primary + 2px ring at 0.2 opacity

## Animations

### Keyframe Animations
Defined in `client/src/index.css`:

```css
@keyframes fadeIn          /* Opacity 0 → 1 */
@keyframes slideUp         /* Opacity 0 + translateY(20px) → normal */
@keyframes iconHover       /* Rotate -10deg + scale 1.1 */
@keyframes deleteObject    /* Opacity 1 + scale 1 → 0 + scale 0.8 */
@keyframes undoRedoFlash   /* Blue flash that fades out */
@keyframes pulse           /* Opacity oscillation for status indicators */
```

**Design Decision (Chapter 7):** All animations kept fast (200-400ms) to feel snappy, not slow.

## Layout Patterns

### Panel Structure
- **Left sidebar:** TilePalette (256px width)
- **Right sidebar:** PropertiesPanel (variable width)
- **Center:** Canvas (flex-1, fills remaining space)

### Spacing Scale
Following Tailwind defaults:
- `p-2`: 0.5rem (8px) - Tile card padding
- `p-3`: 0.75rem (12px) - Section padding
- `p-4`: 1rem (16px) - Panel padding
- `gap-2`: 0.5rem (8px) - Grid gaps

### Border Radius
```css
--radius: 0.5rem (8px)
```
- `rounded`: 4px (0.25rem)
- `rounded-md`: 6px (0.375rem)
- `rounded-lg`: 8px (0.5rem)

## Component Patterns

### Tile Cards
```css
bg-secondary/60 backdrop-blur-sm border border-white/10
rounded p-2 shadow-lg hover:shadow-xl
hover:transform hover:-translate-y-0.5
```

### Tool Buttons
```css
transition-all duration-150
hover: bg-[muted] + glow
active: bg-[color-coded] + glow + bottom-border
```

### Category Headers
```css
border-l-4 border-[category-color]
uppercase text-xs font-semibold
```

## Design Decisions Log

### Chapter 8 (October 2025) - Color & Theme Enhancements

**Decision: Minimalist approach over decoration**

**What we implemented:**
1. ✅ Custom shadow system (darker for dark theme)
2. ✅ Tile card borders (edge clarity)

**What we skipped:**
1. ❌ Additional gradient accents - Header gradient already sufficient
2. ❌ More glow effects - Would create visual noise
3. ❌ Glassmorphism everywhere - Performance cost, already applied to toolbar

**Rationale:**
- Focus on value over decoration
- Avoid visual overload
- Maintain performance
- Quality over quantity

**Commits:** 83c9d57, e4d3dd6

### Chapter 7 (October 2025) - Animations

**Decision: Fast, snappy animations (200-400ms max)**
- Delete fade-out: 250ms
- Undo/redo flash: 400ms
- Tool transitions: 150ms
- Save indicator: Color transitions only (no intrusive animations)

**Rationale:** Animations should enhance UX, not slow it down.

### Chapter 4 (October 2025) - Tile Palette

**Decision: Canvas-rendered platform previews**
- Platforms use actual game textures rendered on small canvas (96x48px)
- Other objects use SVG icons or Font Awesome
- Category accent strips for visual organization

### Chapter 3 (October 2025) - Canvas Background

**Decision: Solid Mario sky blue (#5C94FC)**
- Familiar, inviting aesthetic
- Non-intimidating for non-gamers
- Classic platformer reference

### Chapter 1 (October 2025) - Header

**Decision: Roblox-inspired gradient**
- Linear gradient: Red → Purple → Blue
- Bold, eye-catching branding
- Matches target audience (Roblox developers)

## Future Considerations

### Potential Enhancements (Not Yet Implemented)
- Theme switcher (light mode)
- Custom color picker for objects
- User-configurable accent colors
- Accessibility improvements (contrast ratios, reduced motion)

### Performance Guidelines
- Limit backdrop-blur usage (GPU-intensive)
- Keep animations under 400ms
- Use transform/opacity for GPU acceleration
- Debounce/throttle expensive operations
- Avoid nested glassmorphism effects

## File References

- **CSS Variables:** `client/src/index.css` (lines 5-42)
- **Shadow System:** `tailwind.config.ts` (lines 13-18)
- **Glassmorphism Examples:** `client/src/components/level-editor/Toolbar.tsx`
- **Glow Effects:** `client/src/index.css` (lines 257-264)
- **Animations:** `client/src/index.css` (lines 188-305)
- **Color Usage:** Various components in `client/src/components/level-editor/`
