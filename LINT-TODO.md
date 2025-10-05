# Linting Status & TODO

## Current Status (as of commit e137a5c)

**Linting Summary:**
- **15 errors, 2 warnings** remaining
- **Custom code: 100% clean** ✅
- All remaining issues are in shadcn/ui components and framework files

### Test Status
- ✅ Unit tests: 75/75 passing
- ✅ E2E tests: 39/39 passing (1 skipped)

## Files with Remaining Lint Issues

### Shadcn/UI Components (Generated, Now Our Code)

These components were installed via `npx shadcn add <component>` and are now part of our codebase:

1. **client/src/components/ui/breadcrumb.tsx**
   - `lint/a11y/useFocusableInteractive` - span with role="link" not focusable
   - `lint/a11y/useSemanticElements` - should use `<a>` instead of span with role="link"

2. **client/src/components/ui/calendar.tsx**
   - `lint/correctness/noNestedComponentDefinitions` - IconLeft/IconRight components defined inside Calendar
   - These are intentionally nested for the icon props pattern

3. **client/src/components/ui/carousel.tsx**
   - `lint/a11y/useSemanticElements` - div with role="region" should use `<section>`
   - div with role="group" should use `<fieldset>`

4. **client/src/components/ui/chart.tsx**
   - `lint/complexity/noExcessiveCognitiveComplexity` - complexity 19 vs max 15 in payload.map function
   - `lint/security/noDangerouslySetInnerHtml` - uses dangerouslySetInnerHTML (intentional for tooltip content)

5. **client/src/components/ui/input-otp.tsx**
   - `lint/a11y/useFocusableInteractive` - div with role="separator" not focusable
   - `lint/a11y/useSemanticElements` - should use `<hr>` instead
   - `lint/a11y/useAriaPropsForRole` - missing aria-valuenow

6. **client/src/components/ui/sidebar.tsx**
   - `lint/suspicious/noDocumentCookie` - direct document.cookie assignment (suggests Cookie Store API)

### Framework Files (Expected/Acceptable)

7. **client/src/index.css**
   - `lint/suspicious/noUnknownAtRules` - Tailwind CSS directives (@tailwind, @apply)
   - These are standard Tailwind syntax, not actual errors

## Shadcn Components Management

### Can They Be Regenerated?
**Yes, but with caveats:**

```bash
# Check for updates
npx shadcn diff <component>

# Regenerate (WARNING: overwrites customizations)
npx shadcn add <component>
```

### Important Notes:
- Shadcn/ui copies components into your project (not a dependency)
- Once installed, these become **our code** to maintain
- Regenerating will **overwrite any customizations** we made
- The lint issues are mostly **intentional design patterns** from shadcn

### Decision: Keep As-Is
**Recommendation: DO NOT regenerate** unless:
1. Critical bug in upstream component
2. Need new feature from updated version
3. Haven't made customizations to that specific component

**Why keep current issues:**
- Not breaking functionality
- Follow shadcn's established patterns
- Mostly pedantic warnings (accessibility edge cases, nested components for icons)
- Our custom level-editor code is 100% clean

## What We Fixed (Summary)

### Custom Code - All Clean ✅
- ✅ Fixed nested component (ToolButton in Toolbar)
- ✅ Fixed array index keys (LevelTabs, TilePalette)
- ✅ Fixed duplicate IDs with useId() hook
- ✅ Added button types throughout
- ✅ Fixed accessibility attributes (aria-pressed vs aria-selected)
- ✅ Converted LevelSerializer class to named exports
- ✅ Fixed unused variables
- ✅ Added SVG accessibility (aria-hidden)
- ✅ Removed rotation functionality
- ✅ Improved zoom UI clarity

### UI Improvements Made
- Removed "Zoom" label (magnifying glass icons are self-explanatory)
- Added proper zoom icons (search-plus, search-minus, expand-arrows-alt)
- Fixed cursor consistency (palette uses cursor-default like toolbar)
- Removed rotation controls from toolbar

## Development Server
Running on: http://localhost:3000
PID: Background bash 122cea

## For Next Session

If you need to address shadcn component linting issues:

1. **Review specific component** to understand the warning
2. **Check if it's functional** - if working correctly, might be acceptable
3. **Consider accessibility impact** - some warnings are important for a11y
4. **Fix manually if needed** - don't regenerate unless necessary
5. **Test thoroughly** after any changes to shadcn components

The current state is production-ready with all custom code clean.
