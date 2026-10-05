---
layout: note
---

{% raw %}

[← Back to Home](../index.md)

# ⚛️ React Basics — Complete Interview Notes & Tricky Questions

---

# 1. Hooks

React Hooks let you use state and other React features **without writing a class**. Introduced in React 16.8.

> **Rule of Hooks:**
> 1. Only call Hooks at the **top level** — never inside loops, conditions, or nested functions.
> 2. Only call Hooks from **React function components** or **custom Hooks**.

---

## 1.1 `useState`

Manages state in functional components. Returns an array: `[currentState, setterFunction]`.

### Basic Usage

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Functional Update (when new state depends on old state)

```jsx
// ✅ Correct — uses the previous state value
setCount(prev => prev + 1);

// ❌ Risky — may use stale state in async/batched scenarios
setCount(count + 1);
```

> **Why functional update?** React batches state updates. If you call `setCount(count + 1)` three times in the same event handler, `count` still references the same stale value — so you get only +1, not +3.

### Mutating Reference Types (Objects & Arrays)

React uses **Object.is()** comparison to decide if state has changed. If you mutate the same reference, React won't re-render.

```jsx
// ❌ WRONG — mutating existing reference, React won't re-render
const [user, setUser] = useState({ name: 'Aditya', age: 25 });
user.age = 26;
setUser(user); // Same reference! No re-render.

// ✅ CORRECT — create a new object (spread operator)
setUser(prev => ({ ...prev, age: 26 }));
```

#### Updating Arrays

```jsx
const [items, setItems] = useState([1, 2, 3]);

// ✅ Adding an item
setItems(prev => [...prev, 4]);

// ✅ Removing an item (filter returns new array)
setItems(prev => prev.filter(item => item !== 2));

// ✅ Updating an item at index
setItems(prev => prev.map((item, i) => i === 1 ? 99 : item));
```

#### Updating Nested Objects

```jsx
const [state, setState] = useState({
  user: {
    name: 'Aditya',
    address: { city: 'Delhi', pin: '110001' }
  }
});

// ✅ Updating nested property — spread at every level
setState(prev => ({
  ...prev,
  user: {
    ...prev.user,
    address: { ...prev.user.address, city: 'Mumbai' }
  }
}));
```

### Lazy Initialization

If the initial state is expensive to compute, pass a **function** instead of a value:

```jsx
// ❌ Runs on every render
const [data, setData] = useState(expensiveCalculation());

// ✅ Runs only on first render
const [data, setData] = useState(() => expensiveCalculation());
```

---

## 1.2 `useEffect`

Handles **side effects** — things that happen "outside" the React render cycle: API calls, subscriptions, timers, DOM manipulation.

### Syntax & Dependency Array

```jsx
useEffect(() => {
  // Side effect code here

  return () => {
    // Cleanup function (optional) — runs before next effect or on unmount
  };
}, [dependencies]);
```

| Dependency Array | When it runs |
| :--- | :--- |
| Not provided | After **every** render |
| `[]` (empty) | Only on **mount** (once) |
| `[a, b]` | On mount + whenever `a` or `b` change |

### Example: Fetching Data

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchUser() {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (!isCancelled) setUser(data);
    }

    fetchUser();

    return () => { isCancelled = true; }; // cleanup to prevent state update on unmounted component
  }, [userId]);

  if (!user) return <p>Loading...</p>;
  return <h1>{user.name}</h1>;
}
```

### Cleanup Example: Event Listener

```jsx
useEffect(() => {
  function handleResize() {
    console.log(window.innerWidth);
  }
  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize); // cleanup
}, []);
```

> ⚠️ **Gotcha:** In React 18 Strict Mode (dev only), `useEffect` runs **twice** on mount to help find bugs. Don't panic — this doesn't happen in production.

---

## 1.3 `useContext`

Accesses context values without wrapping components in `Consumer` components. Avoids prop drilling.

### Creating and Using Context

```jsx
// 1. Create context
const ThemeContext = React.createContext('light');

// 2. Provide context value
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 3. Consume context
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>I am {theme} themed</button>;
}
```

> ⚠️ **Performance caveat:** When the context value changes, **all** consumers re-render — even if they only use a slice of the value. Solutions: split contexts, memoize values, or use state management libraries.

---

## 1.4 `useReducer`

Alternative to `useState` for **complex state logic** — especially when the next state depends on the previous one and there are multiple sub-values.

### Syntax

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

### Example: Todo App

```jsx
const initialState = { todos: [], count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        todos: [...state.todos, action.payload],
        count: state.count + 1
      };
    case 'REMOVE_TODO':
      return {
        todos: state.todos.filter(t => t.id !== action.payload),
        count: state.count - 1
      };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addTodo = (text) => {
    dispatch({ type: 'ADD_TODO', payload: { id: Date.now(), text } });
  };

  return (
    <div>
      <p>Total: {state.count}</p>
      {state.todos.map(todo => <p key={todo.id}>{todo.text}</p>)}
      <button onClick={() => addTodo('New Task')}>Add</button>
    </div>
  );
}
```

> **When `useReducer` > `useState`:**
> - State has many sub-values
> - Next state depends on previous state
> - You want to centralize state transition logic
> - You want to pass `dispatch` down instead of multiple setter functions

---

## 1.5 `useMemo`

**Memoizes a computed value** — recalculates only when dependencies change. Prevents expensive re-computations on every render.

```jsx
const expensiveValue = useMemo(() => {
  return heavyComputation(a, b);
}, [a, b]); // Recomputes only when a or b change
```

### When to Use

```jsx
function FilteredList({ items, query }) {
  // ✅ Without useMemo, this filters on EVERY render (even unrelated state changes)
  const filtered = useMemo(
    () => items.filter(item => item.name.includes(query)),
    [items, query]
  );

  return <ul>{filtered.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}
```

> ⚠️ Don't overuse `useMemo`. Memoization itself has a cost (memory + comparison). Only use it when the computation is **actually expensive**.

---

## 1.6 `useCallback`

**Memoizes a function reference** — returns the same function instance unless dependencies change. Useful when passing callbacks to optimized child components (`React.memo`).

```jsx
const handleClick = useCallback(() => {
  console.log('Clicked!', count);
}, [count]); // New function only when count changes
```

### Why It Matters with `React.memo`

```jsx
const Child = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click me</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // ❌ Without useCallback — Child re-renders every time Parent renders
  // const handleClick = () => console.log('clicked');

  // ✅ With useCallback — Child only re-renders when dependencies change
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <Child onClick={handleClick} />
    </div>
  );
}
```

> **`useMemo` vs `useCallback`:**
> - `useMemo(() => fn, deps)` — memoizes the **return value** of `fn`
> - `useCallback(fn, deps)` — memoizes the **function `fn` itself**
> - `useCallback(fn, deps)` === `useMemo(() => fn, deps)`

---

## 1.7 `useRef`

Creates a **mutable ref object** whose `.current` property persists across renders — but **changing it does NOT cause a re-render**.

### Accessing DOM Elements

```jsx
function TextInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus(); // Direct DOM access
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}
```

### Storing Previous Values

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef();

  useEffect(() => {
    prevCountRef.current = count; // Updates after render, no re-render triggered
  });

  return (
    <p>Current: {count}, Previous: {prevCountRef.current}</p>
  );
}
```

### Storing Mutable Values (e.g., interval IDs)

```jsx
function Timer() {
  const intervalRef = useRef(null);
  const [seconds, setSeconds] = useState(0);

  const start = () => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

> **`useRef` vs `useState`:**
>
> | Feature | `useRef` | `useState` |
> | :--- | :--- | :--- |
> | Triggers re-render? | ❌ No | ✅ Yes |
> | Mutable? | ✅ Yes (`.current`) | ❌ No (use setter) |
> | Persists across renders? | ✅ Yes | ✅ Yes |
> | Best for | DOM refs, timers, previous values | UI state |

---

# 2. Higher Order Components (HOC)

---

## What?

A Higher Order Component is a **function** that takes a component and returns a **new enhanced component**. It's a pattern derived from React's compositional nature.

```
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

## Why?

- **Reusability** — share common logic across components
- **Separation of concerns** — keep components focused on UI
- **Cross-cutting concerns** — logging, auth, theming, analytics

## How?

```jsx
// HOC that adds loading state
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) return <p>Loading...</p>;
    return <WrappedComponent {...props} />;
  };
}

// Usage
const UserListWithLoading = withLoading(UserList);

// In parent
<UserListWithLoading isLoading={true} users={[]} />
```

### Real-World Example: Auth HOC

```jsx
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { user } = useContext(AuthContext);

    if (!user) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...props} user={user} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
```

### HOC Conventions

1. Don't mutate the original component — use composition
2. Pass unrelated props through to the wrapped component
3. Name the HOC for debugging: `WithAuth(Dashboard)` using `displayName`
4. Don't use HOCs inside render — creates a new component each render

> **Modern Alternative:** Custom Hooks often replace HOCs for sharing logic. HOCs still shine for wrapping components with UI (like loaders, error boundaries).

---

# 3. Life Cycle Methods of Components

---

React class components have lifecycle methods that run at specific phases. Understanding these is essential because **Hooks (`useEffect`) map to these phases**.

## Mounting (Component is born)

| Method | Purpose |
| :--- | :--- |
| `constructor()` | Initialize state, bind methods |
| `static getDerivedStateFromProps()` | Sync state with props (rarely used) |
| `render()` | Return JSX (required, must be pure) |
| `componentDidMount()` | API calls, subscriptions, DOM access |

## Updating (Component re-renders)

| Method | Purpose |
| :--- | :--- |
| `static getDerivedStateFromProps()` | Sync state with new props |
| `shouldComponentUpdate()` | Optimization — return `false` to skip re-render |
| `render()` | Re-render JSX |
| `getSnapshotBeforeUpdate()` | Capture info (e.g., scroll position) before DOM changes |
| `componentDidUpdate()` | Respond to prop/state changes, fetch new data |

## Unmounting (Component is removed)

| Method | Purpose |
| :--- | :--- |
| `componentWillUnmount()` | Cleanup: cancel timers, subscriptions, API calls |

## Error Handling

| Method | Purpose |
| :--- | :--- |
| `static getDerivedStateFromError()` | Update state to show fallback UI |
| `componentDidCatch()` | Log error information |

### Mapping Lifecycle Methods to Hooks

```jsx
// componentDidMount
useEffect(() => { /* mount logic */ }, []);

// componentDidUpdate (specific dependency)
useEffect(() => { /* update logic */ }, [someValue]);

// componentWillUnmount
useEffect(() => {
  return () => { /* cleanup logic */ };
}, []);

// shouldComponentUpdate → React.memo()
const MemoizedComp = React.memo(MyComponent);
```

---

# 4. State Management

---

## State vs Props

| Feature | State | Props |
| :--- | :--- | :--- |
| Owned by | The component itself | Parent component |
| Mutable? | Yes (via `setState` / setter) | No (read-only) |
| Triggers re-render? | Yes | Yes (when parent sends new props) |
| Scope | Internal to the component | Passed down from parent |

```jsx
// Props — passed from parent
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// State — managed internally
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Props Drilling — The Problem

```
         App (has user data)
          │
        Layout
          │
        Sidebar
          │
       UserInfo  ← needs user data, but Layout & Sidebar don't
```

Every intermediate component must receive and forward the `user` prop, even though they don't use it. This makes code **fragile** and **hard to maintain**.

## Context API — The Solution

```jsx
// 1. Create
const UserContext = React.createContext(null);

// 2. Provide
function App() {
  const [user, setUser] = useState({ name: 'Aditya' });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Layout />
    </UserContext.Provider>
  );
}

// 3. Consume — skip all intermediate components!
function UserInfo() {
  const { user } = useContext(UserContext);
  return <p>{user.name}</p>;
}
```

> **When to use Context:**
> - Theme (dark/light mode)
> - Authenticated user
> - Locale/language
> - Any global-ish data that changes infrequently
>
> **When NOT to use Context:**
> - Frequently changing data (causes mass re-renders)
> - Complex state with many actions → use Redux or Zustand

---

# 5. Redux

---

## How Redux Works

Redux follows a **unidirectional data flow**:

```
    User Action
        │
        ▼
  dispatch(action)  ──→  Reducer(state, action)  ──→  New State
        │                                                 │
        │                                                 ▼
        └──────────────  Store  ←─────────────────────────┘
                          │
                          ▼
                      Components (re-render with new state)
```

### Core Concepts

| Concept | Description |
| :--- | :--- |
| **Store** | Single JavaScript object that holds the entire application state |
| **Action** | Plain object with a `type` field describing what happened |
| **Reducer** | Pure function `(state, action) => newState` |
| **Dispatch** | Method to send actions to the store |
| **Selector** | Function to extract specific data from the store |

### Plain Redux Example

```jsx
// Action Types
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

// Action Creators
const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });

// Reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 };
    case DECREMENT:
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}

// Store
import { createStore } from 'redux';
const store = createStore(counterReducer);
```

## Why Redux?

- **Single source of truth** — one store for the entire app
- **Predictable state** — state changes only through dispatched actions
- **Debuggable** — Redux DevTools, time-travel debugging
- **Middleware** — intercept actions for logging, async operations, etc.

## When to use Redux?

- Large applications with shared state across many components
- Complex state transitions
- When you need predictable state debugging
- Team projects where explicit state management helps coordination

## Redux Toolkit (RTK) — The Modern Way

RTK is the **official, recommended** way to write Redux logic. It reduces boilerplate dramatically.

```jsx
import { createSlice, configureStore } from '@reduxjs/toolkit';

// createSlice = reducer + actions in one
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // "Mutating" is OK here — Immer handles immutability
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Configure store
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

// In components
import { useSelector, useDispatch } from 'react-redux';

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  );
}
```

### RTK Query (Data Fetching)

```jsx
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
    }),
    addUser: builder.mutation({
      query: (newUser) => ({
        url: '/users',
        method: 'POST',
        body: newUser,
      }),
    }),
  }),
});

export const { useGetUsersQuery, useAddUserMutation } = api;

// In component
function UserList() {
  const { data: users, isLoading, error } = useGetUsersQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

# 6. Custom Hooks

---

## What?

Custom Hooks are **JavaScript functions whose name starts with `use`** that can call other Hooks. They let you extract and reuse stateful logic between components.

## When to Use?

- When two or more components share the **same logic** (e.g., form handling, fetching, toggling)
- When a component's logic is complex and can be **extracted for clarity**

## Examples

### `useToggle`

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}

// Usage
function Modal() {
  const [isOpen, toggleModal] = useToggle(false);
  return (
    <div>
      <button onClick={toggleModal}>Toggle</button>
      {isOpen && <div className="modal">Modal Content</div>}
    </div>
  );
}
```

### `useFetch`

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!isCancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isCancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <h1>{user.name}</h1>;
}
```

### `useLocalStorage`

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  return <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>{theme}</button>;
}
```

### `useDebounce`

```jsx
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage — search input
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      // fetch search results
      fetch(`/api/search?q=${debouncedQuery}`);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

---

# 7. Lazy Loading

---

## Code Splitting

By default, bundlers (Webpack, Vite) bundle your **entire app** into one large file. Code splitting breaks it into **smaller chunks** loaded on demand.

## `React.lazy()` + `Suspense`

```jsx
import React, { Suspense, lazy } from 'react';

// Lazy load component — creates a separate chunk
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### How It Works

1. `React.lazy()` takes a function that calls `import()` (dynamic import)
2. This creates a **separate bundle chunk** for that component
3. The chunk is loaded **only when the component is rendered**
4. `Suspense` shows a fallback UI while the chunk loads

### Route-Based Splitting (Most Common)

```jsx
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </Suspense>
  );
}
```

### Named Exports with Lazy

```jsx
// React.lazy only supports default exports. For named exports, create an intermediate module:
// MathUtils.js exports { add }
// addWrapper.js:
export { add as default } from './MathUtils';

// Then:
const Add = lazy(() => import('./addWrapper'));
```

> **Benefits:**
> - Faster initial page load
> - Load only what the user needs
> - Better caching (unchanged chunks stay cached)

---

# 8. Virtual DOM

---

## What is the Virtual DOM?

The Virtual DOM (VDOM) is a **lightweight JavaScript representation** of the actual DOM. It's a plain JS object tree that mirrors the structure of the real DOM.

```
Real DOM (slow to manipulate)
    │
    ▼
Virtual DOM (fast JS objects)
    │
    ▼
React updates VDOM first → diffs with previous VDOM → patches real DOM minimally
```

## Reconciliation Algorithm

React's process of syncing the Virtual DOM with the real DOM:

1. **State changes** → React creates a **new Virtual DOM tree**
2. **Diffing** → React compares new VDOM with previous VDOM
3. **Patching** → React updates **only the changed parts** of the real DOM

### Diff Algorithm Rules

| Rule | Optimization |
| :--- | :--- |
| Different element types | Tear down old tree, build new tree |
| Same element type | Keep node, update changed attributes |
| Lists with keys | Reorder nodes instead of re-creating them |

### Why Keys Matter

```jsx
// ❌ Without keys — React can't track items, re-creates all nodes
{items.map(item => <li>{item.name}</li>)}

// ❌ Using index as key — breaks when items are reordered/deleted
{items.map((item, index) => <li key={index}>{item.name}</li>)}

// ✅ Using unique stable ID
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

## React Fiber

**Fiber** is the reimplementation of React's core reconciliation algorithm (React 16+). It replaces the old "stack reconciler."

### Key Features

| Feature | Description |
| :--- | :--- |
| **Incremental rendering** | Splits rendering work into chunks; can pause and resume |
| **Priority-based updates** | User interactions > animations > data fetching |
| **Concurrent rendering** | Multiple renders can be in progress simultaneously |
| **Better error handling** | Error boundaries became possible |

### How Fiber Works

```
Old (Stack): Component A → B → C → D (must finish in one go, blocks main thread)

Fiber:       Component A → B → [pause for user input] → C → D
             (can interrupt and resume, keeping UI responsive)
```

## Renders — How They Work

1. **Trigger** — state or prop change
2. **Render Phase** (can be paused/aborted) — React calls your components, computes the VDOM diff
3. **Commit Phase** (cannot be interrupted) — React applies changes to the real DOM

> **Key insight:** "Rendering" in React doesn't mean "updating the screen." It means React is **calling your component function** to figure out what should change.

---

# 9. SSR vs CSR

---

## Client-Side Rendering (CSR)

```
Browser receives empty HTML → Downloads JS bundle → JS renders the UI

Timeline:
[Empty page] ────────── [JS downloads] ────────── [App renders] → Interactive
```

### How CSR Works

1. Server sends a minimal HTML file with a `<div id="root"></div>`
2. Browser downloads the JavaScript bundle
3. JavaScript renders the entire UI
4. Page becomes interactive

### Pros & Cons

| Pros | Cons |
| :--- | :--- |
| Rich, app-like interactions | Slow initial load (large JS bundle) |
| Fast navigation after first load | Bad SEO (crawlers see empty HTML) |
| Less server load | Blank screen until JS loads (poor FCP) |
| Great for dashboards, admin panels | Requires JS enabled |

## Server-Side Rendering (SSR)

```
Browser receives fully rendered HTML → Page is visible → JS hydrates → Interactive

Timeline:
[Full HTML visible] ────── [JS downloads + hydrates] → Interactive
```

### How SSR Works

1. Server runs React, generates full HTML for the page
2. Browser receives complete HTML — user **sees content immediately**
3. Browser downloads JS and **hydrates** (attaches event listeners to existing HTML)
4. Page becomes interactive

### Pros & Cons

| Pros | Cons |
| :--- | :--- |
| Better SEO (crawlers see full HTML) | Higher server load |
| Faster First Contentful Paint (FCP) | Slower Time to Interactive (TTI) |
| Works without JavaScript | More complex setup |
| Better for content-heavy sites | Potential hydration mismatch bugs |

## SSR vs CSR — Comparison

| Aspect | CSR | SSR |
| :--- | :--- | :--- |
| Initial Load | Slow (downloads JS first) | Fast (HTML is ready) |
| SEO | Poor | Excellent |
| Server Cost | Low | Higher |
| Interactivity | Immediate after JS loads | Delayed (needs hydration) |
| Best For | SPAs, dashboards, logged-in apps | Blogs, e-commerce, marketing pages |

## Static Site Generation (SSG) — Bonus

Pages are pre-rendered at **build time**, not at request time.

```
Build time: Generate HTML → Deploy static files → CDN serves them instantly
```

> **Frameworks:**
> - **Next.js** — SSR, SSG, ISR (Incremental Static Regeneration)
> - **Gatsby** — SSG focused
> - **Remix** — SSR with nested routing and data loading

---

# 10. Routing

---

## React Router

React Router is the standard library for handling routing in React SPAs.

### Basic Setup

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users">Users</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />
        <Route path="*" element={<NotFound />} /> {/* Catch-all 404 */}
      </Routes>
    </BrowserRouter>
  );
}
```

### Dynamic Routing

```jsx
// Route definition
<Route path="/users/:userId" element={<UserProfile />} />

// Access the parameter
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams();
  return <h1>User ID: {userId}</h1>;
}
```

### Query Parameters

```jsx
import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q'); // ?q=react

  return (
    <div>
      <p>Searching for: {query}</p>
      <button onClick={() => setSearchParams({ q: 'hooks' })}>
        Search Hooks
      </button>
    </div>
  );
}
```

### Nested Routes

```jsx
function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

// DashboardLayout renders child routes via <Outlet />
import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div>
      <Sidebar />
      <main>
        <Outlet /> {/* Child route renders here */}
      </main>
    </div>
  );
}
```

## Protected Routes (Role-Based Access Control — RBAC)

```jsx
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Usage
<Routes>
  <Route path="/login" element={<Login />} />

  {/* Only authenticated users */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />

  {/* Only admins */}
  <Route path="/admin" element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  } />
</Routes>
```

### Programmatic Navigation

```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials);
    navigate('/dashboard', { replace: true }); // replace removes login from history
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

# 11. Testing

---

## React Testing Library (RTL)

RTL encourages testing **behavior** (what the user sees/does) rather than **implementation details** (internal state, methods).

### Guiding Principles

> "The more your tests resemble the way your software is used, the more confidence they can give you."

### Basic Test

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('increments count on button click', () => {
  // Arrange
  render(<Counter />);

  // Act
  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);

  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Testing Async Code

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from './UserProfile';

// Mock the fetch call
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ name: 'Aditya', email: 'aditya@test.com' }),
  })
);

test('displays user data after loading', async () => {
  render(<UserProfile userId="1" />);

  // Initially shows loading
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Aditya')).toBeInTheDocument();
  });
});
```

### Common Query Methods

| Priority | Method | When to Use |
| :--- | :--- | :--- |
| 1 | `getByRole` | Accessible elements (buttons, inputs) |
| 2 | `getByLabelText` | Form fields |
| 3 | `getByPlaceholderText` | Input placeholders |
| 4 | `getByText` | Non-interactive text |
| 5 | `getByTestId` | Last resort — use `data-testid` |

### Testing Custom Hooks

```jsx
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

test('should increment counter', () => {
  const { result } = renderHook(() => useCounter());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

> **Interview Tip:** Always mention that you write tests focusing on user behavior, not implementation details. Mention the testing trophy: Integration tests > Unit tests > E2E tests.

---

# 12. Async Tasks

---

## API Calls in React

### Using `useEffect` + `fetch`

```jsx
function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController(); // cancel on unmount

    async function fetchUsers() {
      try {
        const res = await fetch('/api/users', { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();

    return () => controller.abort(); // cleanup
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### Using Axios

```jsx
import axios from 'axios';

useEffect(() => {
  const source = axios.CancelToken.source();

  axios.get('/api/users', { cancelToken: source.token })
    .then(res => setUsers(res.data))
    .catch(err => {
      if (!axios.isCancel(err)) setError(err.message);
    });

  return () => source.cancel();
}, []);
```

## Event Handling — Synthetic Events

React wraps native browser events in `SyntheticEvent` objects for cross-browser compatibility.

```jsx
function Form() {
  const handleSubmit = (e) => {
    e.preventDefault(); // SyntheticEvent method
    console.log('Form submitted');
  };

  const handleInput = (e) => {
    console.log(e.target.value); // Access native event properties
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleInput} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Promises in React

```jsx
// Promise chaining vs async/await
// Promise chaining
fetch('/api/data')
  .then(res => res.json())
  .then(data => setData(data))
  .catch(err => setError(err));

// async/await (cleaner, preferred)
async function loadData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    setData(data);
  } catch (err) {
    setError(err);
  }
}
```

## setTimeout / setInterval in React

```jsx
function DelayedMessage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer); // cleanup!
  }, []);

  return show ? <p>Hello after 3 seconds!</p> : <p>Waiting...</p>;
}
```

> ⚠️ **Common bug:** Using `setTimeout` with stale state. The callback captures the state value at creation time. Use `useRef` or functional updates to get the latest value.
>
> ```jsx
> // ❌ Bug — count is stale inside setTimeout
> setTimeout(() => console.log(count), 3000);
>
> // ✅ Fix — use ref for latest value
> const countRef = useRef(count);
> countRef.current = count;
> setTimeout(() => console.log(countRef.current), 3000);
> ```

---

# 13. Coding Practices — Reusability, Readability, Modularity, Testability

---

## Key Principles

### 1. Single Responsibility Principle

Each component/function should do **one thing well**.

```jsx
// ❌ God component
function UserDashboard() {
  // fetches data, handles auth, renders sidebar, renders main content, handles form...
}

// ✅ Split into focused components
function UserDashboard() {
  return (
    <DashboardLayout>
      <UserProfile />
      <ActivityFeed />
      <SettingsPanel />
    </DashboardLayout>
  );
}
```

### 2. DRY (Don't Repeat Yourself)

Extract repeated logic into **custom hooks** or **utility functions**.

```jsx
// ❌ Duplicated in multiple components
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [data, setData] = useState(null);
useEffect(() => { /* same fetch logic */ }, []);

// ✅ Extract into a custom hook
const { data, loading, error } = useFetch('/api/users');
```

### 3. Composition Over Inheritance

React favors **composition** (combining components) over class inheritance.

```jsx
// ✅ Composition pattern — flexible, reusable
function Card({ children, header, footer }) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// Usage
<Card header={<h2>Title</h2>} footer={<Button>Save</Button>}>
  <p>Card content here</p>
</Card>
```

### 4. Keep Components Pure

Components should be **pure functions** of their props — same input → same output.

```jsx
// ✅ Pure — output depends only on props
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// ❌ Impure — reads external mutable state
let globalName = 'World';
function Greeting() {
  return <h1>Hello, {globalName}!</h1>;
}
```

### 5. File & Folder Structure

```
src/
├── components/         # Reusable UI components
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.module.css
│   │   └── Button.test.jsx
│   └── Modal/
├── hooks/              # Custom hooks
│   ├── useFetch.js
│   └── useDebounce.js
├── pages/              # Route-level components
│   ├── Home.jsx
│   └── Dashboard.jsx
├── context/            # Context providers
├── services/           # API calls
├── utils/              # Utility functions
└── constants/          # Constants, enums
```

---

# 14. Performance

---

## 1. Lazy Loading & Code Splitting

(See [Section 7](#7-lazy-loading) for details)

## 2. `React.memo` — Prevent Unnecessary Re-renders

```jsx
const ExpensiveChild = React.memo(function ExpensiveChild({ data }) {
  console.log('Child rendered');
  return <div>{data.name}</div>;
});

// ExpensiveChild only re-renders if `data` prop changes (shallow comparison)
```

## 3. `useMemo` & `useCallback`

(See [Section 1.5](#15-usememo) and [Section 1.6](#16-usecallback) for details)

## 4. Virtualization (Windowing)

Render only the **visible items** in long lists.

```jsx
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

## 5. Debouncing & Throttling

```jsx
// Debounce search input — wait until user stops typing
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

## 6. Avoid Inline Functions and Objects in JSX

```jsx
// ❌ Creates a new object reference every render → child always re-renders
<Child style={{ color: 'red' }} />

// ✅ Stable reference
const style = useMemo(() => ({ color: 'red' }), []);
<Child style={style} />

// ❌ Creates a new function every render
<Child onClick={() => handleClick(id)} />

// ✅ Memoized callback
const handleItemClick = useCallback(() => handleClick(id), [id]);
<Child onClick={handleItemClick} />
```

## 7. Image & Asset Optimization

- Use **WebP/AVIF** formats for images
- Implement **lazy loading** for images: `<img loading="lazy" />`
- Use **CDNs** for static assets
- **Compress** JS/CSS with bundler plugins (TerserPlugin, CSSMinimizerPlugin)

## 8. Bundle Analysis

```bash
# With Webpack
npx webpack-bundle-analyzer stats.json

# With Vite
npx vite-bundle-visualizer
```

## 9. React Profiler

```jsx
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} ${phase}: ${actualDuration}ms`);
}

<Profiler id="Navigation" onRender={onRenderCallback}>
  <Navigation />
</Profiler>
```

---

# 15. Styling

---

| Approach | Type | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **CSS / SCSS** | External stylesheets | Full control, familiar | Global scope, name clashes |
| **CSS Modules** | Scoped CSS files | Local scope, no conflicts | Extra config |
| **Tailwind CSS** | Utility-first | Rapid development, consistent | Verbose JSX, learning curve |
| **Styled Components** | CSS-in-JS | Dynamic styling, scoped | Runtime cost, bundle size |
| **Material UI** | Component library | Ready-to-use, accessible | Large bundle, opinionated |
| **Ant Design** | Component library | Enterprise-grade, feature-rich | Large bundle, complex theming |
| **Bootstrap** | CSS framework | Quick prototyping | Generic look |
| **StyleX** (Meta) | Atomic CSS-in-JS | Zero runtime, optimized | New, smaller community |

### CSS Modules Example

```jsx
// Button.module.css
.primary {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}

// Button.jsx
import styles from './Button.module.css';

function Button({ children }) {
  return <button className={styles.primary}>{children}</button>;
}
```

### Styled Components Example

```jsx
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: ${props => props.variant === 'primary' ? '#007bff' : '#6c757d'};
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

function App() {
  return <StyledButton variant="primary">Click Me</StyledButton>;
}
```

---

# 🔥 Bonus Topics

---

## Error Boundaries

Error boundaries are React components that **catch JavaScript errors** in their child component tree, log those errors, and display a fallback UI.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

> ⚠️ Error boundaries do **NOT** catch errors in:
> - Event handlers (use try/catch)
> - Async code (promises, setTimeout)
> - Server-side rendering
> - Errors thrown in the error boundary itself

---

## React Portals

Render children into a **DOM node outside** the parent component's DOM hierarchy.

```jsx
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>,
    document.getElementById('modal-root') // renders here, NOT in parent's DOM
  );
}
```

> **Use cases:** Modals, tooltips, dropdowns, notifications — anything that needs to visually "break out" of its parent's overflow/z-index.

---

## Controlled vs Uncontrolled Components

| Feature | Controlled | Uncontrolled |
| :--- | :--- | :--- |
| State managed by | React (via `useState`) | The DOM itself |
| Value access | `value` prop + `onChange` | `useRef` to read DOM value |
| Validation | Easy, on every change | Harder, usually on submit |
| Best for | Most forms | File inputs, simple forms |

```jsx
// Controlled
function ControlledInput() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}

// Uncontrolled
function UncontrolledInput() {
  const inputRef = useRef();
  const handleSubmit = () => console.log(inputRef.current.value);
  return <input ref={inputRef} defaultValue="Hello" />;
}
```

---

## `forwardRef` and `useImperativeHandle`

`forwardRef` lets parent components pass a `ref` to a child component.

```jsx
const FancyInput = React.forwardRef((props, ref) => {
  return <input ref={ref} className="fancy-input" {...props} />;
});

// Parent can now access the input DOM node
function Parent() {
  const inputRef = useRef();
  return (
    <div>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </div>
  );
}
```

`useImperativeHandle` customizes the ref value exposed to parent:

```jsx
const FancyInput = React.forwardRef((props, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
    // Parent ONLY gets focus() and clear(), NOT the full DOM node
  }));

  return <input ref={inputRef} {...props} />;
});
```

---

## React.memo Deep Dive

```jsx
// Default: shallow comparison of props
const MemoizedComp = React.memo(MyComponent);

// Custom comparison function
const MemoizedComp = React.memo(MyComponent, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  // Return false if props changed (re-render)
  return prevProps.id === nextProps.id;
});
```

---

# 🧩 Tricky Interview Questions & Answers

---

## Q1: What will this output?

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

**Answer:** Clicking the button sets count to **1**, not 3.

> **Why?** All three `setCount(count + 1)` calls use the same stale `count` value (0) from the closure. React batches them but `count + 1` is always `0 + 1 = 1`.
>
> **Fix:** Use functional updates: `setCount(prev => prev + 1)` — this correctly increments to 3.

---

## Q2: What's the difference between these two?

```jsx
// Version A
useEffect(() => {
  console.log('Effect');
});

// Version B
useEffect(() => {
  console.log('Effect');
}, []);
```

**Answer:**
- **A** runs after **every** render (mount + every update)
- **B** runs only **once** after the initial mount (equivalent to `componentDidMount`)

---

## Q3: Will this component re-render when the button is clicked?

```jsx
function App() {
  const ref = useRef(0);

  const handleClick = () => {
    ref.current += 1;
    console.log(ref.current);
  };

  return <button onClick={handleClick}>{ref.current}</button>;
}
```

**Answer:** The component will **NOT re-render**. The console will log the updated value, but the UI will still show `0`.

> **Why?** `useRef` changes don't trigger re-renders. The `.current` value updates, but React doesn't know about it.

---

## Q4: What happens when you call `setState` inside `useEffect` without cleanup?

```jsx
function Leaky() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  }, []);

  return <p>{count}</p>;
}
```

**Answer:** In development with React 18 Strict Mode, the effect runs **twice**, creating **two intervals**. The counter increments by 2 every second instead of 1.

> **Fix:** Add cleanup:
> ```jsx
> useEffect(() => {
>   const id = setInterval(() => setCount(c => c + 1), 1000);
>   return () => clearInterval(id);
> }, []);
> ```

---

## Q5: What's wrong with this code?

```jsx
function App() {
  const [items, setItems] = useState([1, 2, 3]);

  const addItem = () => {
    items.push(4);
    setItems(items);
  };

  return (
    <div>
      {items.map(item => <p key={item}>{item}</p>)}
      <button onClick={addItem}>Add</button>
    </div>
  );
}
```

**Answer:** The UI won't update.

> **Why?** `items.push(4)` mutates the existing array. `setItems(items)` passes the **same reference**. React sees `Object.is(oldState, newState) === true` and skips the re-render.
>
> **Fix:** `setItems(prev => [...prev, 4])` — creates a new array reference.

---

## Q6: Explain the output.

```jsx
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`Count is: ${count}`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [count]);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

If you click the button 5 times quickly (within 3 seconds), **what gets logged?**

**Answer:** Only `"Count is: 5"` gets logged.

> **Why?** Each click triggers a new render, which runs the cleanup (`clearTimeout`) of the previous effect before setting a new timeout. The rapid clicks keep clearing and resetting the timer. Only the last timer (with count=5) survives the 3-second wait.

---

## Q7: Can you call Hooks conditionally?

```jsx
function App({ isLoggedIn }) {
  if (isLoggedIn) {
    const [user, setUser] = useState(null); // ❌ VIOLATION
  }
  // ...
}
```

**Answer:** **No!** This breaks the **Rules of Hooks**. React relies on the **order** of Hook calls being the same on every render. Conditional Hook calls corrupt React's internal tracking.

> **Fix:** Always call hooks at the top level, conditionally use the value:
> ```jsx
> const [user, setUser] = useState(null);
> // Use `user` conditionally in your JSX
> ```

---

## Q8: What's the difference between `key` and `ref`?

**Answer:**

| Feature | `key` | `ref` |
| :--- | :--- | :--- |
| Purpose | Helps React identify list items for diffing | Access DOM nodes or persist values |
| Accessible in child? | ❌ No (`props.key` is undefined) | ✅ Yes (via `forwardRef`) |
| Changes trigger re-render? | Yes (new key = remount) | No |

> **Trick with `key`:** Setting a new `key` on a component **forces it to unmount and remount**:
> ```jsx
> <UserForm key={userId} /> {/* Changing userId resets form state */}
> ```

---

## Q9: What are React Fragments and why use them?

```jsx
// ❌ Adds an unnecessary <div> to the DOM
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// ✅ Fragment — no extra DOM node
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);

// ✅ Fragment with key (in lists)
return items.map(item => (
  <React.Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.description}</dd>
  </React.Fragment>
));
```

---

## Q10: Closure trap in event handlers

```jsx
function App() {
  const [count, setCount] = useState(0);

  const logCount = () => {
    setTimeout(() => {
      alert(`Count: ${count}`); // captures count at the time of click
    }, 3000);
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={logCount}>Log Count</button>
    </div>
  );
}
```

If you click increment 3 times, then click "Log Count", then increment 2 more times — **what does the alert show after 3 seconds?**

**Answer:** The alert shows `Count: 3` (not 5).

> **Why?** `logCount` closes over the `count` value at the time it was called (3). The subsequent increments happen after the closure was captured.
>
> **Fix:** Use a ref to always access the latest value:
> ```jsx
> const countRef = useRef(count);
> countRef.current = count;
> const logCount = () => {
>   setTimeout(() => alert(`Count: ${countRef.current}`), 3000);
> };
> ```

---

## Q11: What's the difference between `useEffect`, `useLayoutEffect`, and `useInsertionEffect`?

**Answer:**

| Hook | When it runs | Blocks paint? | Use for |
| :--- | :--- | :--- | :--- |
| `useEffect` | After paint (async) | ❌ | Data fetching, subscriptions |
| `useLayoutEffect` | Before paint (sync) | ✅ | DOM measurements, scroll position |
| `useInsertionEffect` | Before DOM mutations | ✅ | CSS-in-JS libraries injecting styles |

```jsx
// useLayoutEffect — measure DOM before user sees it
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setHeight(height); // Updates before the browser paints
}, []);
```

---

## Q12: What does `StrictMode` do?

```jsx
<React.StrictMode>
  <App />
</React.StrictMode>
```

**Answer:** In development mode only:
1. **Double-invokes** component functions, effects, and reducers to detect impure rendering
2. Warns about **deprecated lifecycle methods**
3. Warns about **legacy string refs**
4. Detects **unexpected side effects**
5. Checks for **deprecated `findDOMNode` usage**

> ⚠️ Strict Mode has **no effect in production** — it's purely a development tool.

---

## Q13: What is reconciliation and how does React decide what to update?

**Answer:** Reconciliation is the algorithm React uses to diff two Virtual DOM trees and determine the minimum number of operations to update the real DOM.

**Two key assumptions:**
1. Two elements of **different types** produce **different trees** → React tears down the old tree and builds a new one
2. The `key` prop hints at which child elements may be **stable across renders**

```jsx
// Different types → full remount
<div><Counter /></div>   →   <span><Counter /></span>
// Counter is unmounted and remounted (state lost!)

// Same type → update attributes
<div className="before" />   →   <div className="after" />
// React only updates the className
```

---

## Q14: What is the component render cycle in React 18?

```
State Update
    │
    ▼
Render Phase (Pure, can be paused/aborted — Fiber)
├── Call component function
├── Generate new Virtual DOM (React Elements)
├── Diff with previous VDOM
│
    ▼
Commit Phase (Cannot be interrupted)
├── Apply DOM changes
├── Run useLayoutEffect (sync, before paint)
│
    ▼
Browser Paint
    │
    ▼
Run useEffect (async, after paint)
```

---

## Q15: How does automatic batching work in React 18?

```jsx
// React 17 — batching ONLY in React event handlers
function handleClick() {
  setCount(c => c + 1);   // batched
  setFlag(f => !f);        // batched
  // → ONE re-render
}

setTimeout(() => {
  setCount(c => c + 1);   // NOT batched in React 17
  setFlag(f => !f);        // NOT batched in React 17
  // → TWO re-renders in React 17
}, 1000);

// React 18 — batching EVERYWHERE (event handlers, timeouts, promises, native events)
setTimeout(() => {
  setCount(c => c + 1);   // batched in React 18
  setFlag(f => !f);        // batched in React 18
  // → ONE re-render 🎉
}, 1000);

// Opt out of batching (rare):
import { flushSync } from 'react-dom';
flushSync(() => setCount(c => c + 1)); // immediate re-render
flushSync(() => setFlag(f => !f));      // another immediate re-render
```

{% endraw %}
