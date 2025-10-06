# Modifier Key Selection Patterns - Industry Research & Recommendations

**Date:** 2025-10-06
**Status:** Research Complete - Design Document
**Related Tasks:** Task 20.1-20.6 (Chapter 20 - Advanced Selection Modifiers)

---

## Executive Summary

This document analyzes industry-standard modifier key patterns from leading design tools (Photoshop, Figma, Illustrator, Tiled) and provides recommendations for implementing modifier-based selection in CanvasBlox.

**Key Findings:**
- Shift key: Multi-select / Additive selection / Area expansion
- Ctrl/Cmd key: Temporary tool override / Subtractive selection / Toggle behavior
- Alt key: Alternative behavior (not prioritized for CanvasBlox)
- Visual feedback: Cursor changes, status indicators, highlighted selections

---

## Industry Pattern Analysis

### 1. Shift Key Behavior

#### Photoshop
- **Selection tools:** Holding Shift adds to selection (additive)
- **Layer selection:** Shift-click selects multiple layers (range select)
- **Modifier with tools:** Shift constrains proportions (rectangles → squares)

#### Figma
- **Multi-select:** Shift-click adds objects to selection
- **Enhanced movement:** Shift + arrow keys = 10px movement (vs 1px)
- **Box selection:** Shift expands current selection area

#### Illustrator
- **Additive selection:** Shift-click adds objects to selection
- **Constrain proportions:** Shift maintains aspect ratio when resizing

#### Tiled Map Editor
- **Additive selection:** Holding Shift expands current selection with new area
- **Line drawing:** Shift-click creates line between two points (stamp brush)
- **Square constraint:** Shift makes rectangles square

#### Pattern Summary (Shift)
- **Primary use:** Additive selection (add to current selection)
- **Secondary use:** Constrain proportions / Enhanced magnitude
- **Consistency:** All tools use Shift for "add to selection"

---

### 2. Ctrl/Cmd Key Behavior

#### Photoshop
- **Temporary tool override:** Ctrl temporarily activates selection tool
- **Auto-select toggle:** Ctrl temporarily flips auto-select on/off with move tool
- **Layer content selection:** Ctrl-click layer creates selection from pixels

#### Figma
- **Deep selection:** Ctrl/Cmd-click selects nested elements
- **Box selection:** Ctrl + arrow keys for keyboard box selection
- **Enhanced navigation:** Ctrl modifies navigation behavior

#### Illustrator
- **Temporary tool override:** Ctrl gives selection tool while held
- **Direct selection:** Ctrl (with selection tool) gives direct selection tool
- **Group selection:** Ctrl+Alt gives group selection tool

#### Tiled Map Editor
- **Subtractive selection:** Holding Ctrl subtracts new area from selection
- **Snap toggle:** Ctrl toggles snapping to tile grid
- **Force move:** Ctrl+Alt forces move operation

#### Pattern Summary (Ctrl/Cmd)
- **Primary use:** Temporary tool override (most consistent across tools)
- **Secondary use:** Subtractive selection / Toggle behavior
- **Consistency:** Strong pattern for "temporary tool access"

---

### 3. Ctrl+Shift Combined Behavior

#### Photoshop
- **Auto-select multi:** Ctrl+Shift-click adds/removes layers from selection

#### Figma
- **Deep multi-select:** Ctrl+Shift allows selecting multiple nested elements

#### Illustrator
- **Group operations:** Ctrl+Shift provides group selection modifications

#### Tiled Map Editor
- **Intersection selection:** Ctrl+Shift selects intersection of areas
- **Circle/ellipse drawing:** Ctrl+Shift-click creates circle/ellipse

#### Pattern Summary (Ctrl+Shift)
- **Primary use:** Combined modifier for advanced operations
- **Consistency:** Less standardized, tool-specific

---

### 4. Temporary Tool Override Pattern

All professional tools implement a "temporary tool override" pattern:

**How it works:**
1. User has Tool A selected (e.g., Brush, Pen, Move)
2. User presses modifier key (typically Ctrl/Cmd)
3. Tool temporarily switches to selection tool
4. User performs action (select, click, drag)
5. User releases modifier key
6. Tool returns to Tool A

**Benefits:**
- Reduces tool switching interruptions
- Maintains workflow momentum
- Familiar pattern from industry tools
- Enables rapid selection adjustments without losing context

**Implementation considerations:**
- Store "active tool" and "suspended tool" separately
- On modifier press: suspend current tool, activate temporary tool
- On modifier release: restore suspended tool
- Visual feedback: Show both tools (active highlighted, suspended dimmed)

---

### 5. Visual Feedback Patterns

All tools provide clear visual feedback for modifier states:

#### Cursor Changes
- **Shift (additive):** Plus (+) icon near cursor
- **Ctrl (temporary tool):** Cursor changes to temporary tool icon
- **Box selection:** Crosshair or dotted rectangle cursor

#### Status Indicators
- **Status bar:** Text indicating current mode ("Add to selection", "Subtract from selection")
- **Toolbar:** Highlighted tool shows current active tool
- **Selection outline:** Pulsing or animated outline on selected objects

#### Selection Visual States
- **Selected:** Highlighted outline (typically blue/cyan)
- **Multi-selected:** Same outline on all selected objects
- **Hover:** Different color (pre-selection state)
- **Locked/Protected:** Different visual treatment (grayed out)

---

## Recommendations for CanvasBlox

Based on industry research, here are recommendations for CanvasBlox modifier key implementation:

### Phase 1: Core Modifier Patterns (Tasks 20.2-20.3)

#### Recommendation 1: Shift+Drag for Multi-Select
- **Behavior:** Holding Shift temporarily activates multi-select tool (box selection)
- **Rationale:** Consistent with Tiled Map Editor (direct competitor), aligns with Shift = "additive" pattern
- **UX:** Press Shift → drag selection box → release mouse → objects selected → release Shift → return to previous tool
- **Visual feedback:** Cursor changes to crosshair, status bar shows "Multi-select (Shift)"

#### Recommendation 2: Ctrl+Click for Additive Selection
- **Behavior:** Ctrl+click toggles individual objects in selection
- **Rationale:** Consistent with all professional tools, familiar to users
- **UX:** Hold Ctrl → click object → adds to selection (or removes if already selected)
- **Visual feedback:** Plus (+) cursor, status bar shows "Add to selection (Ctrl)"

### Phase 2: Temporary Tool Override (Task 20.4)

#### Recommendation 3: Temporary Tool Override from Move Tool
- **Behavior:** When Move tool active, Shift/Ctrl temporarily suspends Move and activates selection mode
- **Rationale:** Reduces tool switching friction, follows Photoshop/Illustrator pattern
- **UX:** Move tool selected → press Shift → box selection active → release Shift → Move tool resumes
- **Visual feedback:** Toolbar shows Move (dimmed) + current modifier mode

**Implementation note:** This is an exception to normal tool behavior. Requires "suspended tool" state management.

### Phase 3: Visual Feedback (Task 20.5)

#### Recommendation 4: Comprehensive Visual Feedback
- **Cursor changes:**
    - Shift: Crosshair or dotted box cursor
    - Ctrl: Plus (+) cursor
- **Status bar:** "Multi-select (Shift)" or "Add to selection (Ctrl)"
- **Toolbar:** Active tool highlighted, suspended tool dimmed with badge
- **Selection outline:** Pulsing animation (already implemented in Task 11.13)

---

## Implementation Priority

1. **High Priority (P1):** Shift+Drag multi-select (Task 20.2)
2. **High Priority (P1):** Ctrl+Click additive selection (Task 20.3)
3. **Medium Priority (P2):** Visual feedback (Task 20.5)
4. **Low Priority (P3):** Temporary tool override (Task 20.4)
5. **Future Enhancement (P4):** Ctrl+Shift intersection select, Alt modifiers

**Rationale for priority:**
- Tasks 20.2-20.3 provide immediate UX improvement with low implementation complexity
- Task 20.5 (visual feedback) should follow behavior implementation
- Task 20.4 (temporary override) requires significant state refactoring, defer until core patterns proven

---

## Design Decisions & Trade-offs

### Decision 1: Shift for Multi-Select (Not Additive Click)
**Options considered:**
- A) Shift+Drag = multi-select (box selection)
- B) Shift+Click = add individual objects to selection

**Decision:** Option A (Shift+Drag)
**Rationale:**
- Consistent with Tiled Map Editor (closest competitor)
- Ctrl+Click already provides additive click (Task 20.3)
- Box selection is faster for selecting many objects
- Shift = "expand/add area" is more intuitive than Shift = "add individual object"

### Decision 2: Replace vs Toggle in Multi-Select
**Options considered:**
- A) Shift+Drag replaces current selection (non-additive)
- B) Shift+Drag adds to current selection (additive)

**Decision:** Option A (replace selection)
**Rationale:**
- Consistent with Tiled: Shift expands, but initial drag creates new selection area
- Additive behavior available via Ctrl+Click (Task 20.3)
- Simpler mental model: "Shift+Drag = select these objects"
- Can be revisited in Task 20.6 if user feedback suggests additive is better

### Decision 3: Temporary Tool Override is Optional
**Decision:** Implement temporary tool override as low priority (Task 20.4)
**Rationale:**
- High implementation complexity (requires state machine refactoring)
- Core workflows (20.2-20.3) provide 80% of value with 20% of complexity
- Can be added later if user research shows friction with tool switching
- Better to validate core patterns first before committing to advanced patterns

---

## Keyboard Shortcut Summary

| Modifier | Action | Behavior | Priority |
|----------|--------|----------|----------|
| Shift+Drag | Multi-select | Box selection (replaces current selection) | P1 |
| Ctrl+Click | Additive select | Toggle object in selection | P1 |
| Ctrl+Shift+Click | Intersection select | Select overlap only | P4 |
| Shift (with Move) | Temporary override | Suspend Move, activate multi-select | P3 |
| Ctrl (with Move) | Temporary override | Suspend Move, activate additive select | P3 |
| ESC | Clear selection | Deselect all + clear tool | Existing |

---

## Next Steps

1. **Implement Task 20.2:** Shift+Drag multi-select
2. **Implement Task 20.3:** Ctrl+Click additive selection
3. **Implement Task 20.5:** Visual feedback (cursors, status bar)
4. **User testing:** Validate patterns with real users
5. **Evaluate Task 20.4:** Decide if temporary tool override is needed
6. **Evaluate Task 20.6:** Rethink toolbar buttons if needed

---

## References

- [Photoshop Default Keyboard Shortcuts](https://helpx.adobe.com/photoshop/using/default-keyboard-shortcuts.html)
- [Figma Keyboard Shortcuts](https://help.figma.com/hc/en-us/articles/360040328653-Use-Figma-products-with-a-keyboard)
- [Illustrator Default Keyboard Shortcuts](https://helpx.adobe.com/illustrator/using/default-keyboard-shortcuts.html)
- [Tiled Map Editor Keyboard Shortcuts](https://doc.mapeditor.org/en/stable/manual/keyboard-shortcuts/)

---

## Appendix: Alternative Patterns Not Recommended

### Alt Key Modifiers
**Research findings:**
- Photoshop: Alt = subtract from selection
- Illustrator: Alt = alternative tool behavior
- Tiled: Alt = 180° rotation, force move

**Decision:** Not recommended for initial implementation
**Rationale:**
- Less consistent across tools
- Adds complexity without clear UX benefit
- Can be added in future if user research shows need

### Ctrl+Shift Intersection Select
**Research findings:**
- Tiled: Ctrl+Shift selects intersection of areas
- Other tools: Less standardized

**Decision:** Low priority (P4)
**Rationale:**
- Niche use case
- Low user demand expected
- Can be added as enhancement if requested

---

**Document prepared by:** Claude (AI Assistant)
**Review status:** Pending user review
**Last updated:** 2025-10-06
