---
layout: note
---

[← Back to Home](../index.md)

# JavaScript Async/Await

## Table of Contents
1. [What is Async/Await?](#what-is-asyncawait)
2. [Why Async/Await?](#why-asyncawait)
3. [Basic Syntax](#basic-syntax)
4. [Converting Promises to Async/Await](#converting-promises-to-asyncawait)
5. [Error Handling](#error-handling)
6. [Advanced Patterns](#advanced-patterns)
7. [Common Pitfalls](#common-pitfalls)
8. [Interview Questions](#interview-questions)

## What is Async/Await?

Async/await is a syntax that makes asynchronous, promise-based behavior easier to write in a cleaner style, avoiding the need to explicitly configure promise chains.
It allows you to write asynchronous code that looks and behaves like synchronous code, making it easier to read and maintain.

**Key Points:**
- `async` functions **always return a Promise**
- `await` can only be used inside `async` functions
- `await` pauses function execution until the Promise resolves
- Makes asynchronous code look and behave more like synchronous code

## Why Async/Await?
Async/await simplifies the process of working with asynchronous code, making it more readable and easier to understand. It allows developers to write code that looks synchronous while still being non-blocking.


### Before Async/Await (Promise Chains)
```javascript
function fetchUserData() {
  return fetch('/api/user')
    .then(response => response.json())
    .then(user => {
      return fetch(`/api/posts/${user.id}`);
    })
    .then(response => response.json())
    .then(posts => {
      return fetch(`/api/comments/${posts[0].id}`);
    })
    .then(response => response.json())
    .then(comments => {
      console.log('User data with comments:', comments);
      return comments;
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}
```

### After Async/Await (Clean & Readable)
```javascript
async function fetchUserData() {
  try {
    const userResponse = await fetch('/api/user');
    const user = await userResponse.json();
    
    const postsResponse = await fetch(`/api/posts/${user.id}`);
    const posts = await postsResponse.json();
    
    const commentsResponse = await fetch(`/api/comments/${posts[0].id}`);
    const comments = await commentsResponse.json();
    
    console.log('User data with comments:', comments);
    return comments;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

## Basic Syntax

### Async Function Declaration
```javascript
// Function declaration
async function myFunction() {
  return 'Hello World';
}

// Function expression
const myFunction = async function() {
  return 'Hello World';
};

// Arrow function
const myFunction = async () => {
  return 'Hello World';
};

// Method in object
const obj = {
  async myMethod() {
    return 'Hello World';
  }
};

// Method in class
class MyClass {
  async myMethod() {
    return 'Hello World';
  }
}
```

### Basic Await Usage
```javascript
async function example() {
  // Await a Promise
  const result = await fetch('/api/data');
  
  // Await any thenable
  const data = await result.json();
  
  // Await a resolved value (gets wrapped in Promise.resolve())
  const immediate = await 'immediate value';
  
  return data;
}
```

## Converting Promises to Async/Await

### Example 1: Simple Promise Chain
```javascript
// Promise version
function getUser(id) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(user => {
      console.log('User:', user);
      return user;
    });
}

// Async/Await version
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  console.log('User:', user);
  return user;
}
```

### Example 2: Multiple Dependent Calls
```javascript
// Promise version
function getUserWithPosts(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(user => {
      return fetch(`/api/users/${userId}/posts`)
        .then(response => response.json())
        .then(posts => ({
          user,
          posts
        }));
    });
}

// Async/Await version
async function getUserWithPosts(userId) {
  const userResponse = await fetch(`/api/users/${userId}`);
  const user = await userResponse.json();
  
  const postsResponse = await fetch(`/api/users/${userId}/posts`);
  const posts = await postsResponse.json();
  
  return { user, posts };
}
```

## Error Handling

### Try/Catch with Async/Await
```javascript
async function handleErrors() {
  try {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error occurred:', error.message);
    
    // Handle different error types
    if (error instanceof TypeError) {
      console.error('Network error');
    } else if (error.message.includes('HTTP error')) {
      console.error('Server error');
    }
    
    // Re-throw or return default value
    throw error; // or return null;
  } finally {
    console.log('Cleanup operations');
  }
}
```

### Error Handling Patterns
```javascript
// Pattern 1: Handle errors individually
async function individualErrorHandling() {
  try {
    const user = await fetchUser();
  } catch (error) {
    console.error('User fetch failed:', error);
    return null;
  }
  
  try {
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (error) {
    console.error('Posts fetch failed:', error);
    return { user, posts: [] };
  }
}

// Pattern 2: Global error handling with helper
async function safeAsync(asyncFn, defaultValue = null) {
  try {
    return await asyncFn();
  } catch (error) {
    console.error('Async operation failed:', error);
    return defaultValue;
  }
}

// Usage
const user = await safeAsync(() => fetchUser(id), { name: 'Guest' });
```

## Advanced Patterns

### Parallel Execution with Promise.all()
```javascript
// Sequential (slow) - takes 6 seconds total
async function sequentialFetch() {
  const user = await fetchUser(); // 2 seconds
  const posts = await fetchPosts(); // 2 seconds  
  const comments = await fetchComments(); // 2 seconds
  return { user, posts, comments };
}

// Parallel (fast) - takes 2 seconds total
async function parallelFetch() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),    // All execute simultaneously
    fetchPosts(),
    fetchComments()
  ]);
  return { user, posts, comments };
}

// Mixed approach - parallel independent, sequential dependent
async function mixedFetch(userId) {
  // Fetch user first (required for other calls)
  const user = await fetchUser(userId);
  
  // Then fetch posts and profile in parallel
  const [posts, profile] = await Promise.all([
    fetchUserPosts(userId),
    fetchUserProfile(userId)
  ]);
  
  return { user, posts, profile };
}
```

### Async Iteration Patterns
```javascript
// Process array items sequentially
async function processSequentially(items) {
  const results = [];
  for (const item of items) {
    const result = await processItem(item);
    results.push(result);
  }
  return results;
}

// Process array items in parallel
async function processInParallel(items) {
  const promises = items.map(item => processItem(item));
  return await Promise.all(promises);
}

// Process with concurrency limit
async function processWithLimit(items, limit = 3) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const batchPromises = batch.map(item => processItem(item));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  return results;
}
```

### Timeout and Race Conditions
```javascript
// Add timeout to async operations
function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  );
  
  return Promise.race([promise, timeout]);
}

async function fetchWithTimeout() {
  try {
    const data = await withTimeout(fetch('/api/slow-endpoint'), 5000);
    return await data.json();
  } catch (error) {
    if (error.message === 'Operation timed out') {
      console.log('Request timed out');
      return null;
    }
    throw error;
  }
}

// Retry mechanism
async function retryAsync(asyncFn, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

**Interview follow-up: what does the timeout actually cover?**

In the example above, `Promise.race` can reject the wrapper without cancelling the underlying request. Also, `fetch()` resolves when response headers arrive, so the later `data.json()` body read is outside that race. What if headers arrive quickly but the body stalls?

For a network deadline that also covers reading the body, pass an `AbortController` signal to `fetch`, keep the timer active until `await response.json()` settles, and clear the timer and any external abort listener in `finally`. Forward caller cancellation to the same controller. Aborting the client request does not roll back work already performed by the server.

Optional coding practice: [Fetch JSON with Timeout + Abort](https://frontendatlas.com/javascript/coding/js-fetch-json-timeout) (free question and full solution), combining the timeout, caller cancellation, HTTP error handling, and cleanup.

## Common Pitfalls

### Pitfall 1: Forgetting await
```javascript
// ❌ Wrong - returns Promise, not the value
async function wrong() {
  const data = fetchData(); // Missing await!
  console.log(data); // Logs: Promise<pending>
  return data;
}

// ✅ Correct
async function correct() {
  const data = await fetchData();
  console.log(data); // Logs: actual data
  return data;
}
```

### Pitfall 2: Using await in loops incorrectly
```javascript
// ❌ Wrong - sequential processing (slow)
async function processItemsSequential(items) {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    results.push(await processItem(items[i])); // One by one
  }
  return results;
}

// ✅ Better - parallel processing (fast)
async function processItemsParallel(items) {
  const promises = items.map(item => processItem(item));
  return await Promise.all(promises); // All at once
}
```

### Pitfall 3: Not handling errors properly
```javascript
// ❌ Wrong - unhandled promise rejection
async function risky() {
  const data = await fetchData(); // If this fails, error propagates
  return data.value;
}

// ✅ Correct - proper error handling
async function safe() {
  try {
    const data = await fetchData();
    return data.value;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return null;
  }
}
```

### Pitfall 4: Mixing async/await with .then()
```javascript
// ❌ Confusing - mixing paradigms
async function mixed() {
  const data = await fetchData()
    .then(response => response.json()) // Don't mix!
    .catch(error => console.error(error));
  return data;
}

// ✅ Consistent - pure async/await
async function consistent() {
  try {
    const response = await fetchData();
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

## Interview Questions

### Q1: What does the `async` keyword do?
**Answer**: The async keyword transforms a regular JavaScript function into an asynchronous function, causing it to return a Promise. Even if you return a regular value, it gets wrapped in `Promise.resolve()`.

```javascript
async function example() {
  return 'Hello'; // Actually returns Promise.resolve('Hello')
}

example().then(console.log); // 'Hello'
```

### Q2: Can you use `await` without `async`?
**Answer**: No, `await` can only be used inside `async` functions (or at the top level in modules in modern environments). Using `await` outside an `async` function will cause a syntax error.

```javascript
// ❌ SyntaxError
function regular() {
  const data = await fetch('/api'); // Error!
}

// ✅ Correct
async function correct() {
  const data = await fetch('/api'); // Works!
}
```

### Q3: What happens if you don't await an async function?
**Answer**: You get a Promise back instead of the resolved value. This can lead to bugs if you expect the actual value.

```javascript
async function getValue() {
  return 42;
}

// Without await
const result1 = getValue(); // Promise<42>
console.log(result1); // Promise object

// With await
const result2 = await getValue(); // 42
console.log(result2); // 42
```

### Q4: How do you handle multiple async operations?
**Answer**: Depends on whether they're dependent or independent:

```javascript
// Sequential (dependent) - use await
async function sequential() {
  const user = await fetchUser();
  const posts = await fetchUserPosts(user.id); // Needs user.id
  return { user, posts };
}

// Parallel (independent) - use Promise.all
async function parallel() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);
  return { users, posts, comments };
}
```

### Q5: What's the difference between Promise.all() and using multiple await statements?
**Answer**: 
- **Multiple await**: Sequential execution (slower)
- **Promise.all()**: Parallel execution (faster)

```javascript
// Sequential - 6 seconds total
async function sequential() {
  const a = await delay(2000); // 2s
  const b = await delay(2000); // +2s = 4s total
  const c = await delay(2000); // +2s = 6s total
  return [a, b, c];
}

// Parallel - 2 seconds total
async function parallel() {
  const [a, b, c] = await Promise.all([
    delay(2000), // All start simultaneously
    delay(2000), // 2s total (longest operation)
    delay(2000)
  ]);
  return [a, b, c];
}
```

### Q6: How do you handle errors in async/await?
**Answer**: Use try/catch blocks, similar to synchronous error handling:

```javascript
async function handleErrors() {
  try {
    const data = await riskyOperation();
    return data;
  } catch (error) {
    // Handle specific error types
    if (error instanceof NetworkError) {
      return retryOperation();
    }
    
    console.error('Operation failed:', error);
    throw error; // Re-throw or return default
  } finally {
    // Cleanup code
    cleanup();
  }
}
```

### Q7: What's the execution order in this code?
```javascript
console.log('1');

async function asyncFunc() {
  console.log('2');
  await Promise.resolve();
  console.log('3');
}

console.log('4');
asyncFunc();
console.log('5');
```

**Answer**: 1, 4, 2, 5, 3

**Explanation**: Async/await doesn't make the entire code wait. The synchronous code continues executing while the async function waits for the Promise to resolve.

### Q8: Can you convert this Promise chain to async/await?
```javascript
// Original Promise chain
function fetchUserData(id) {
  return fetch(`/api/users/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('User not found');
      }
      return response.json();
    })
    .then(user => {
      return fetch(`/api/users/${id}/preferences`)
        .then(prefResponse => prefResponse.json())
        .then(preferences => ({
          ...user,
          preferences
        }));
    })
    .catch(error => {
      console.error('Error:', error);
      return null;
    });
}
```

**Answer**:
```javascript
async function fetchUserData(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error('User not found');
    }
    
    const user = await response.json();
    const prefResponse = await fetch(`/api/users/${id}/preferences`);
    const preferences = await prefResponse.json();
    
    return {
      ...user,
      preferences
    };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

### Q9: What are the benefits of async/await over Promises?
**Answer**: 
1. **Readability**: Code looks more like synchronous code
2. **Error Handling**: Single try/catch instead of multiple .catch()
3. **Debugging**: Better stack traces and easier to set breakpoints
4. **Conditional Logic**: Easier to write conditional async operations
5. **Variable Scope**: Variables stay in scope throughout the function

### Q10: How would you implement a retry mechanism with async/await?
**Answer**:
```javascript
async function retryAsync(asyncFn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
try {
  const data = await retryAsync(() => fetch('/api/unreliable'), 3, 2000);
  console.log('Success:', data);
} catch (error) {
  console.log('All retries failed:', error);
}
```

## Best Practices Summary

1. **Always use try/catch** for error handling
2. **Use Promise.all()** for parallel independent operations
3. **Use sequential await** for dependent operations
4. **Don't mix async/await with .then()** - pick one style
5. **Handle Promise rejections** to avoid unhandled rejection warnings
6. **Use meaningful variable names** and keep functions focused
7. **Consider using TypeScript** for better async code safety
8. **Test async code thoroughly** including error scenarios
