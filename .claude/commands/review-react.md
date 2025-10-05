# /review-react

Review React code quality against modern best practices and patterns.

## Usage

```
/review-react [scope]
```

**Arguments:**
- `scope` (optional) - Specific scope to review (e.g., "LevelEditor", "hooks", "components/level-editor")
  - If not provided, reviews React files based on git changes (modified/added .tsx/.jsx files)

## Examples

```
/review-react LevelEditor
/review-react hooks
/review-react components
/review-react
```

## Instructions

When this command is invoked:

1. **Determine scope and find React files:**
   - If scope provided:
     - Use that scope as the review scope
     - Search for React files: Use Glob to find `**/*{scope}*.tsx` and `**/*{scope}*.jsx`
   - If no scope:
     - Run `git diff --name-only` and `git status --short` to find changed React files (*.tsx, *.jsx)
     - Extract the component/feature being reviewed from those files as the scope
   - Build a list of React file paths to review

2. **Launch general-purpose agent with this prompt:**

```
You are a senior React developer performing a code review.

**Context:**
- Project: CanvasBlox - Level editor for young game designers
- Review scope: [INSERT SCOPE HERE]
- React files to review: [INSERT FILE PATHS HERE - comma separated list]

**Your task:**
1. Read React best practices: docs/REACT_BEST_PRACTICES.md
2. Read the specific React files provided above:
   - [List each file path provided]
   - Use Read tool to examine each file
3. Evaluate each file against:
   - **Component Design**: Functional components, composition, separation of concerns
   - **Hooks Usage**: Rules of hooks, custom hooks, dependency arrays, avoiding derived state
   - **TypeScript**: Explicit types, no `any`, proper event handlers, utility types
   - **Performance**: useMemo/useCallback usage, stable references, list keys
   - **Anti-Patterns**: Components in components, state as variables, mutations, unstable dependencies
   - **Code Quality**: Naming, readability, error handling, accessibility

**Provide feedback in this format:**
```
## React Code Review: [SCOPE]

### Excellent Practices ✅
[List code that follows best practices]
- **Component/Pattern** (file:line)
  - What's good: [explanation]
  - Why it matters: [impact]

### Issues to Fix 🔴
[List critical problems that must be addressed]
- **Issue** (file:line)
  - Problem: [what's wrong]
  - Impact: [why it's critical]
  - Fix: [specific solution with code example]
  - Priority: Critical/High/Medium

### Suggestions for Improvement 🟡
[List non-critical improvements]
- **Suggestion** (file:line)
  - Current approach: [what it does now]
  - Better approach: [recommended alternative]
  - Benefit: [why this is better]
  - Priority: Low/Nice-to-have

### Anti-Patterns Detected ❌
[List React anti-patterns found]
- **Anti-pattern** (file:line)
  - Pattern: [name of anti-pattern]
  - Why it's bad: [explanation]
  - Refactor to: [correct pattern with example]

### Performance Concerns ⚡
[List potential performance issues]
- **Performance issue** (file:line)
  - Issue: [description]
  - Impact: [re-renders, memory, etc.]
  - Optimization: [specific fix]

### TypeScript Issues 📘
[List TypeScript-related problems]
- **Type issue** (file:line)
  - Problem: [missing types, `any` usage, etc.]
  - Fix: [correct typing]

### Accessibility Issues ♿
[List accessibility problems]
- **A11y issue** (file:line)
  - Problem: [description]
  - Fix: [ARIA attributes, semantic HTML, etc.]

### Overall Assessment
[Brief summary of code quality]
- Code quality score: [1-10]
- Main strengths: [list]
- Main weaknesses: [list]
- Adherence to React best practices: [High/Medium/Low]

### Action Items
[Prioritized list of specific actions to take]
1. [CRITICAL] [Most important action]
2. [HIGH] [Next priority]
3. [MEDIUM] [Important but not urgent]
4. [LOW] [Nice to have improvements]
...
```

**Key principles to check:**

**Component Design:**
- Functional components (not class-based)
- Single responsibility principle
- Component composition over complexity
- Container/Presentational separation

**Hooks:**
- Hooks called at top level only
- All dependencies in useEffect arrays
- No derived state in useEffect
- Custom hooks follow naming (`use*`)
- Appropriate use of useMemo/useCallback

**TypeScript:**
- Explicit prop types with interfaces
- No `any` usage (use specific types or `unknown`)
- Proper event handler types
- Utility types leveraged

**Performance:**
- No inline object/array creation
- Stable keys for list items
- Memoization used appropriately
- No unnecessary re-renders

**Anti-Patterns:**
- ❌ Components defined inside components
- ❌ State stored as variables
- ❌ Direct state mutation
- ❌ Missing effect dependencies
- ❌ Conditional hooks
- ❌ Index as key in lists

**Code Quality:**
- Clear naming conventions
- Proper error handling
- No console.log in production
- Accessibility considerations

Be direct, specific, and actionable. Provide code examples for fixes. Prioritize issues by severity.
```

3. **After agent completes:**
   - Present the review to the user
   - Ask: "Would you like me to refactor the code based on this review?"
   - If yes, implement the recommended changes starting with Critical/High priority items
   - Run linter and tests to verify refactoring

## Notes

- This command helps maintain high React code quality across the codebase
- Use it after implementing new components or when refactoring
- The agent will use Glob and Read to find relevant React files automatically
- Review focuses on modern React patterns (hooks, functional components, TypeScript)
- When no scope provided, uses git changes to determine what to review
- Prioritizes actionable feedback with specific code examples
