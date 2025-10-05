# React Best Practices & Code Review Guidelines

This document provides comprehensive guidelines for React code quality and serves as the foundation for automated React code reviews in this project.

## Table of Contents
- [Component Design](#component-design)
- [Hooks Best Practices](#hooks-best-practices)
- [TypeScript Integration](#typescript-integration)
- [Performance Optimization](#performance-optimization)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
- [Code Review Checklist](#code-review-checklist)

---

## Component Design

### ✅ Functional Components (Modern Standard)
**DO:** Use functional components with hooks as the default
```tsx
// ✅ Good
function UserProfile({ userId }: { userId: string }) {
    const [user, setUser] = useState<User | null>(null);
    // ...
}
```

**DON'T:** Use class components unless absolutely necessary
```tsx
// ❌ Avoid
class UserProfile extends React.Component {
    // Class components are legacy
}
```

### ✅ Component Composition
**DO:** Break down complex components into smaller, reusable pieces
```tsx
// ✅ Good - Composable components
function UserCard({ user }: { user: User }) {
    return (
        <Card>
            <UserAvatar src={user.avatar} />
            <UserInfo name={user.name} email={user.email} />
            <UserActions userId={user.id} />
        </Card>
    );
}
```

**DON'T:** Create monolithic components
```tsx
// ❌ Avoid - Too much responsibility in one component
function UserCard({ user }: { user: User }) {
    // 300 lines of mixed concerns...
}
```

### ✅ Container/Presentational Pattern
**DO:** Separate business logic from presentation
```tsx
// ✅ Good - Container (logic)
function UserProfileContainer({ userId }: { userId: string }) {
    const { data, loading } = useUserData(userId);
    return <UserProfile user={data} loading={loading} />;
}

// ✅ Good - Presentational (UI)
function UserProfile({ user, loading }: { user: User | null; loading: boolean }) {
    if (loading) return <Spinner />;
    return <div>{user?.name}</div>;
}
```

---

## Hooks Best Practices

### ✅ Rules of Hooks
**MUST FOLLOW:**
1. Only call hooks at the top level (never in loops, conditions, or nested functions)
2. Only call hooks from React function components or custom hooks
3. Hooks must run in the same order on every render

```tsx
// ✅ Good
function Component() {
    const [count, setCount] = useState(0);
    const theme = useContext(ThemeContext);

    useEffect(() => {
        // Effect logic
    }, []);

    // Rest of component
}

// ❌ Bad - Conditional hook
function Component({ showCount }: { showCount: boolean }) {
    if (showCount) {
        const [count, setCount] = useState(0); // ❌ NEVER
    }
}
```

### ✅ Custom Hooks
**DO:** Extract reusable logic into custom hooks
```tsx
// ✅ Good - Custom hook
function useLevelEditor() {
    const [levels, setLevels] = useState<LevelData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const createNewLevel = useCallback(() => {
        // Logic
    }, []);

    return { levels, currentIndex, createNewLevel };
}

// Usage
function Editor() {
    const { levels, createNewLevel } = useLevelEditor();
}
```

### ✅ useEffect Dependencies
**DO:** Always include all dependencies in the dependency array
```tsx
// ✅ Good
useEffect(() => {
    fetchUserData(userId);
}, [userId]); // All dependencies included

// ❌ Bad
useEffect(() => {
    fetchUserData(userId);
}, []); // Missing dependency - causes stale data bugs
```

### ✅ Avoid Derived State in useEffect
**DO:** Calculate derived values during render
```tsx
// ✅ Good - Computed during render
function TodoList({ todos }: { todos: Todo[] }) {
    const completedCount = todos.filter(t => t.completed).length;
    return <div>Completed: {completedCount}</div>;
}

// ❌ Bad - Unnecessary state + effect
function TodoList({ todos }: { todos: Todo[] }) {
    const [completedCount, setCompletedCount] = useState(0);

    useEffect(() => {
        setCompletedCount(todos.filter(t => t.completed).length);
    }, [todos]); // Unnecessary!
}
```

---

## TypeScript Integration

### ✅ Type Everything Explicitly
**DO:** Provide explicit types for props, state, and function returns
```tsx
// ✅ Good - Explicit types
interface UserProfileProps {
    userId: string;
    onUpdate?: (user: User) => void;
}

function UserProfile({ userId, onUpdate }: UserProfileProps): JSX.Element {
    const [user, setUser] = useState<User | null>(null);
    // ...
}
```

**DON'T:** Rely on implicit `any`
```tsx
// ❌ Bad - No types
function UserProfile({ userId, onUpdate }) {
    const [user, setUser] = useState(null);
    // ...
}
```

### ✅ Avoid `any` - Use `unknown` or Proper Types
**DO:** Use specific types or `unknown` for truly dynamic values
```tsx
// ✅ Good
function parseJSON<T>(json: string): T | null {
    try {
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}

// ❌ Bad
function parseJSON(json: string): any {
    return JSON.parse(json);
}
```

### ✅ Use TypeScript Utility Types
**DO:** Leverage built-in utility types for transformations
```tsx
// ✅ Good - Utility types
type PartialUser = Partial<User>;
type ReadonlyUser = Readonly<User>;
type UserKeys = Pick<User, 'id' | 'name'>;
type UserWithoutId = Omit<User, 'id'>;
```

### ✅ Type Event Handlers Correctly
**DO:** Use proper React event types
```tsx
// ✅ Good
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
}

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
}
```

---

## Performance Optimization

### ✅ useMemo for Expensive Calculations
**DO:** Memoize expensive computations
```tsx
// ✅ Good
const expensiveValue = useMemo(() => {
    return computeExpensiveValue(data);
}, [data]);
```

**DON'T:** Overuse useMemo for simple operations
```tsx
// ❌ Bad - Unnecessary for simple operations
const doubled = useMemo(() => count * 2, [count]); // Overkill
```

### ✅ useCallback for Stable Function References
**DO:** Use useCallback for functions passed to memoized children
```tsx
// ✅ Good
const MemoizedChild = React.memo(Child);

function Parent() {
    const handleClick = useCallback(() => {
        // Handler logic
    }, []);

    return <MemoizedChild onClick={handleClick} />;
}
```

### ✅ React.memo for Component Memoization
**DO:** Memoize components that receive the same props often
```tsx
// ✅ Good
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }: Props) {
    // Complex rendering
});
```

### ✅ Avoid Inline Object/Array Creation
**DO:** Define stable references outside render or use useMemo
```tsx
// ✅ Good
const EMPTY_ARRAY: string[] = [];
const DEFAULT_STYLE = { padding: '10px' };

function Component() {
    return <Child items={EMPTY_ARRAY} style={DEFAULT_STYLE} />;
}

// ❌ Bad - Creates new reference every render
function Component() {
    return <Child items={[]} style={{ padding: '10px' }} />;
}
```

---

## Anti-Patterns to Avoid

### ❌ Components Defined Inside Components
**NEVER:** Define components inside other components
```tsx
// ❌ BAD - Re-creates component on every render
function Parent() {
    function Child() {
        return <div>Child</div>;
    }
    return <Child />;
}

// ✅ Good - Define outside
function Child() {
    return <div>Child</div>;
}

function Parent() {
    return <Child />;
}
```

### ❌ Storing State as Variables
**NEVER:** Use regular variables for component state
```tsx
// ❌ BAD - Resets on every render
function Counter() {
    let count = 0; // Lost on re-render
    return <button onClick={() => count++}>{count}</button>;
}

// ✅ Good
function Counter() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### ❌ Mutating State Directly
**NEVER:** Mutate state objects/arrays directly
```tsx
// ❌ BAD
function addItem(item: Item) {
    items.push(item); // Mutation!
    setItems(items);
}

// ✅ Good
function addItem(item: Item) {
    setItems(prev => [...prev, item]);
}
```

### ❌ Missing Keys in Lists
**ALWAYS:** Provide stable keys for list items
```tsx
// ❌ Bad - Using index as key
{items.map((item, index) => <Item key={index} {...item} />)}

// ✅ Good - Using stable ID
{items.map(item => <Item key={item.id} {...item} />)}
```

### ❌ Unstable useEffect Dependencies
**AVOID:** Object/function dependencies that change every render
```tsx
// ❌ Bad - Object recreated every render
useEffect(() => {
    fetchData({ userId, filter });
}, [{ userId, filter }]); // New object every time

// ✅ Good - Primitive dependencies
useEffect(() => {
    fetchData({ userId, filter });
}, [userId, filter]);
```

---

## Code Review Checklist

### Component Structure
- [ ] Components are functional (not class-based)
- [ ] Components follow single responsibility principle
- [ ] Complex components are broken into smaller pieces
- [ ] Business logic separated from presentation

### Hooks
- [ ] Hooks called at top level (no conditionals/loops)
- [ ] All useEffect dependencies included
- [ ] No derived state in useEffect (use direct calculation)
- [ ] Custom hooks follow naming convention (`use*`)
- [ ] useCallback/useMemo used appropriately (not overused)

### TypeScript
- [ ] All props have explicit interface/type definitions
- [ ] No usage of `any` (use specific types or `unknown`)
- [ ] Event handlers have correct React event types
- [ ] Generic types used where appropriate
- [ ] Utility types leveraged for transformations

### Performance
- [ ] No inline object/array creation in JSX
- [ ] Expensive calculations wrapped in useMemo
- [ ] Stable function references for memoized children (useCallback)
- [ ] List items have stable keys (not index)
- [ ] No unnecessary re-renders (check with React DevTools)

### Anti-Patterns
- [ ] No components defined inside components
- [ ] No state stored as variables
- [ ] No direct state mutation
- [ ] No missing effect dependencies
- [ ] No conditional hooks

### Accessibility
- [ ] Semantic HTML elements used
- [ ] Interactive elements have proper ARIA attributes
- [ ] Forms have proper labels
- [ ] Keyboard navigation supported

### Code Quality
- [ ] Consistent naming conventions
- [ ] Clear, descriptive variable/function names
- [ ] Proper error handling
- [ ] Comments for complex logic (not obvious code)
- [ ] No console.log statements in production code

---

## References

- [Official React Documentation](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [Patterns.dev - React Patterns](https://www.patterns.dev/react/)
