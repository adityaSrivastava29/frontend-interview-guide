---
layout: note
---

{% raw %}

[← Back to Home](../index.md)

# 💻 JS & React Coding Interview Questions — Famous, Tricky & Must-Know

> Every question includes code, detailed **comment-based explanations**, and the exact console output.

---

# PART 1: JavaScript Output-Based Questions

These questions test your understanding of **how the JS engine actually works** — hoisting, closures, event loop, type coercion, prototypes, and `this`.

---

## 🔥 1. Hoisting — `var` vs `let` vs `const`

### Q1.1: Variable Hoisting

```javascript
console.log(a); // ? 
console.log(b); // ?
console.log(c); // ?

var a = 10;
let b = 20;
const c = 30;

// ─── OUTPUT ───
// undefined          ← var is hoisted and initialized as undefined
// ReferenceError     ← let is hoisted but stays in "Temporal Dead Zone" (TDZ) until declaration
// (never reaches c)  ← const behaves the same as let (TDZ)

// ─── WHY? ───
// JavaScript "hoists" all declarations to the top of their scope BEFORE execution.
// var a;        ← declaration is hoisted, value is undefined
// let b;        ← declaration is hoisted BUT accessing it before the let line = ReferenceError
// const c;      ← same as let
```

### Q1.2: Function Hoisting

```javascript
greet();       // ?
hello();       // ?

function greet() {
  console.log("Hi!");
}

var hello = function() {
  console.log("Hello!");
};

// ─── OUTPUT ───
// "Hi!"              ← Function declarations are hoisted ENTIRELY (name + body)
// TypeError: hello is not a function  
//                    ← var hello is hoisted as undefined, so undefined() throws TypeError

// ─── KEY RULE ───
// Function DECLARATIONS → fully hoisted (can be called before definition)
// Function EXPRESSIONS  → only the variable is hoisted (as undefined)
// Arrow functions       → same as expressions (not hoisted as functions)
```

### Q1.3: Hoisting in Block Scope

```javascript
var x = 1;

if (true) {
  console.log(x); // ?
  let x = 2;
}

// ─── OUTPUT ───
// ReferenceError: Cannot access 'x' before initialization
//
// ─── WHY? ───
// Even though var x = 1 exists outside, the `let x` inside the block creates
// a NEW binding for that block. The let is hoisted to the top of the block
// but stays in the TDZ → accessing it before `let x = 2` throws ReferenceError.
// This is called "shadowing" — the inner x shadows the outer x.
```

---

## 🔥 2. Closures — The Most Tested Topic

### Q2.1: The Classic `var` in Loop

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// ─── OUTPUT ───
// 3
// 3
// 3

// ─── WHY? ───
// `var` is FUNCTION-scoped, NOT block-scoped.
// There is only ONE variable `i` shared across all iterations.
// setTimeout callbacks go into the callback queue and execute AFTER the loop finishes.
// By then, i = 3 (the loop exit condition).
// All 3 callbacks read the SAME `i`, which is now 3.
```

### Q2.2: Fix with `let`

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// ─── OUTPUT ───
// 0
// 1
// 2

// ─── WHY? ───
// `let` is BLOCK-scoped. Each iteration creates a NEW `i` binding.
// Each setTimeout callback captures its own copy of `i`.
```

### Q2.3: Fix with IIFE (Pre-ES6 approach)

```javascript
for (var i = 0; i < 3; i++) {
  (function(idx) {
    // IIFE creates a new scope for each iteration
    // `idx` is a LOCAL copy of `i` at this point in time
    setTimeout(() => console.log(idx), 100);
  })(i); // pass current value of i as argument
}

// ─── OUTPUT ───
// 0
// 1
// 2

// ─── WHY? ───
// The IIFE (Immediately Invoked Function Expression) creates a new function scope
// for each iteration. The parameter `idx` captures the VALUE of `i` at that moment.
// Each setTimeout callback has its own `idx` in its closure.
```

### Q2.4: Closure Counter

```javascript
function createCounter() {
  let count = 0; // Private variable — only accessible through returned functions
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter1 = createCounter();
const counter2 = createCounter(); // Completely separate closure

console.log(counter1.increment()); // 1
console.log(counter1.increment()); // 2
console.log(counter2.increment()); // 1  ← separate closure, separate count!
console.log(counter1.getCount());  // 2  ← counter1 is unaffected by counter2

// ─── KEY INSIGHT ───
// Each call to createCounter() creates a NEW execution context with its own `count`.
// The returned object's methods form a closure over that specific `count`.
// This is the MODULE PATTERN — creating private state in JavaScript.
```

### Q2.5: Tricky Closure — What's logged?

```javascript
function outer() {
  var x = 10;

  function inner() {
    console.log(x); // ?
  }

  x = 20; // Reassign BEFORE inner is called

  return inner;
}

outer()(); 

// ─── OUTPUT ───
// 20

// ─── WHY? ───
// Closures capture the REFERENCE to the variable, not the VALUE at creation time.
// When inner() finally executes, it looks up x in its closure and finds 20.
// x was reassigned to 20 before inner was called.
```

---

## 🔥 3. Event Loop — setTimeout vs Promise vs async/await

### Q3.1: The Classic Order Question

```javascript
console.log('1');                              // Sync

setTimeout(() => console.log('2'), 0);         // Macrotask (callback queue)

Promise.resolve().then(() => console.log('3')); // Microtask (microtask queue)

console.log('4');                              // Sync

// ─── OUTPUT ───
// 1
// 4
// 3
// 2

// ─── EXECUTION ORDER ───
// Step 1: Execute all synchronous code → logs 1, then 4
// Step 2: Drain the Microtask queue → Promise.then → logs 3
// Step 3: Pick next Macrotask → setTimeout → logs 2
//
// PRIORITY: Sync Code > Microtasks (Promises) > Macrotasks (setTimeout)
```

### Q3.2: Nested Promises and setTimeout

```javascript
console.log('start');

setTimeout(() => {
  console.log('timeout 1');
  Promise.resolve().then(() => console.log('promise inside timeout'));
}, 0);

Promise.resolve().then(() => {
  console.log('promise 1');
  setTimeout(() => console.log('timeout inside promise'), 0);
});

Promise.resolve().then(() => console.log('promise 2'));

console.log('end');

// ─── OUTPUT ───
// start
// end
// promise 1
// promise 2
// timeout 1
// promise inside timeout
// timeout inside promise

// ─── STEP BY STEP ───
// 1. Sync: "start", "end"
// 2. Microtasks: "promise 1" (this also queues a new setTimeout),
//                "promise 2"
// 3. Macrotask #1: "timeout 1" (this also queues a new microtask)
// 4. Microtask (from step 3): "promise inside timeout"
// 5. Macrotask #2: "timeout inside promise" (queued in step 2)
```

### Q3.3: async/await Execution Order

```javascript
async function foo() {
  console.log('foo start');       // Sync — runs immediately
  
  await bar();                    // Pause foo here; everything after goes to microtask queue
  
  console.log('foo end');         // Microtask — resumes after bar() resolves
}

async function bar() {
  console.log('bar');             // Sync — runs immediately when bar() is called
}

console.log('script start');
foo();
console.log('script end');

// ─── OUTPUT ───
// script start
// foo start
// bar
// script end
// foo end

// ─── WHY? ───
// "script start" → sync
// foo() is called → "foo start" (sync part of foo)
// await bar() → bar() runs sync ("bar"), then foo pauses
// Execution returns to the main script → "script end"
// Microtask queue: resume foo after await → "foo end"
```

### Q3.4: Complex async/await + Promise + setTimeout

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => console.log('setTimeout'), 0);

async1();

new Promise((resolve) => {
  console.log('promise1');  // Executor runs SYNCHRONOUSLY
  resolve();
}).then(() => {
  console.log('promise2');  // Microtask
});

console.log('script end');

// ─── OUTPUT ───
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout

// ─── BREAKDOWN ───
// Sync phase: script start → async1 start → async2 → promise1 → script end
// Microtask phase: async1 end (resume after await) → promise2 (then callback)
// Macrotask phase: setTimeout
```

### Q3.5: Async IIFE with `await null`, `queueMicrotask`, and Delayed Timers

```javascript
console.log("A");

setTimeout(() => {
  console.log("B");
}, 2000);

Promise.resolve().then(() => {
  console.log("C");
});

queueMicrotask(() => {
  console.log("D");
});

(async () => {
  console.log("E");
  await null; // wraps in Promise.resolve(null) & pauses IIFE
  console.log("F");
})();

setTimeout(() => {
  console.log("G");
  Promise.resolve().then(() => {
    console.log("H");
  });
}, 2000);

// ─── OUTPUT ───
// A
// E
// C
// D
// F
// (after ~2000ms delay)
// B
// G
// H

// ─── STEP BY STEP ───
// 1. Sync Phase (Call Stack):
//    - "A" logs immediately.
//    - setTimeout #1 registers a 2000ms timer (macrotask).
//    - Promise.resolve().then(...) queues "C" in Microtask Queue.
//    - queueMicrotask(...) queues "D" in Microtask Queue.
//    - (async () => { ... })() runs synchronously:
//      * "E" logs immediately.
//      * `await null` wraps null into Promise.resolve(null), pauses the IIFE,
//        and queues the continuation ("F") into the Microtask Queue.
//    - setTimeout #2 registers another 2000ms timer (macrotask).
//
// 2. Microtask Queue Phase (drained before any macrotask):
//    - Microtask 1: logs "C"
//    - Microtask 2: logs "D"
//    - Microtask 3: resumes async IIFE → logs "F"
//
// 3. Macrotask Phase (after ~2000ms):
//    - Timer #1 callback runs → logs "B"
//    - Timer #2 callback runs → logs "G", schedules "H" to Microtask Queue
//    - Microtask queue drained immediately before next macrotask → logs "H"
//
// ─── KEY INTERVIEW CONCEPTS ───
// - `await <expr>` always yields control back to the caller and places the rest of the function in the Microtask Queue.
// - Async functions execute SYNCHRONOUSLY until the first `await`.
// - `queueMicrotask()` and `Promise.resolve().then()` push into the same microtask queue (FIFO).
```

---

## 🔥 4. `this` Keyword — Dynamic vs Lexical Binding

### Q4.1: Lost `this` Context

```javascript
const obj = {
  name: 'Aditya',
  greet: function() {
    console.log(this.name);
  }
};

obj.greet();            // ?  → "Aditya"   (this = obj, method invocation)

const fn = obj.greet;   // Extracting the method — loses context
fn();                   // ?  → undefined   (this = global/window, standalone call)

// ─── WHY? ───
// In JavaScript, `this` is determined by HOW the function is CALLED, not where it's defined.
// obj.greet() → called on obj → this = obj
// fn()       → called standalone → this = global object (undefined in strict mode)
```

### Q4.2: Arrow Function `this`

```javascript
const obj = {
  name: 'Aditya',
  
  // Regular function — `this` is the object
  greet: function() {
    console.log('greet:', this.name);
  },
  
  // Arrow function — `this` is LEXICALLY inherited (from surrounding scope)
  greetArrow: () => {
    console.log('arrow:', this.name);
  },
  
  // Arrow inside a method — inherits `this` from the enclosing method
  delayedGreet: function() {
    setTimeout(() => {
      console.log('delayed:', this.name);
    }, 100);
  }
};

obj.greet();         // "greet: Aditya"    → regular function, this = obj
obj.greetArrow();    // "arrow: undefined" → arrow inherits from module/global scope
obj.delayedGreet();  // "delayed: Aditya"  → arrow inherits this from delayedGreet (which is obj)

// ─── KEY RULE ───
// Arrow functions do NOT have their own `this`.
// They capture `this` from the ENCLOSING LEXICAL SCOPE at the time they are DEFINED.
// This is why arrow functions are great for callbacks inside methods.
```

### Q4.3: `this` with `call`, `bind`, `apply`

```javascript
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: 'Aditya' };

// call — invokes immediately, arguments passed individually
introduce.call(person, 'Hello', '!');       // "Hello, I'm Aditya!"

// apply — invokes immediately, arguments passed as an array
introduce.apply(person, ['Hi', '!!']);      // "Hi, I'm Aditya!!"

// bind — returns a NEW function with `this` permanently bound (does NOT invoke)
const boundFn = introduce.bind(person, 'Hey');
boundFn('...');                             // "Hey, I'm Aditya..."

// ─── MNEMONIC ───
// call → C for Comma-separated args
// apply → A for Array of args
// bind → B for Bound (returns new function, doesn't call)
```

### Q4.4: `this` Inside a Class

```javascript
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Hi, ${this.name}`);
  }

  greetArrow = () => {
    console.log(`Hi, ${this.name}`);
  };
}

const user = new User('Aditya');
user.greet();              // "Hi, Aditya" ✅

const greetFn = user.greet;
greetFn();                 // TypeError: Cannot read properties of undefined 
                           // (strict mode in classes — `this` is undefined)

const greetArrowFn = user.greetArrow;
greetArrowFn();            // "Hi, Aditya" ✅ — arrow function captures `this` from constructor

// ─── INTERVIEW TIP ───
// Class field arrow functions (greetArrow = () => {}) are the safest way to
// pass class methods as callbacks without losing `this`.
// Used heavily in React class components: onClick={this.handleClick}
```

---

## 🔥 5. Type Coercion — JavaScript's Weird Parts

### Q5.1: The Classics

```javascript
console.log(1 + '2');        // "12"      ← number + string = string concatenation
console.log('5' - 3);        // 2         ← string - number = numeric subtraction
console.log('5' + 3);        // "53"      ← string + number = string concatenation
console.log('5' * '2');      // 10        ← both coerced to numbers for multiplication
console.log(true + true);    // 2         ← true is 1, so 1 + 1 = 2
console.log(true + false);   // 1         ← 1 + 0 = 1
console.log([] + []);        // ""        ← both arrays coerced to "" (empty string)
console.log([] + {});        // "[object Object]" ← "" + "[object Object]"
console.log({} + []);        // 0 or "[object Object]" 
                             //   ← depends on context! In console, {} is treated as empty block
console.log(null + 1);       // 1         ← null coerces to 0
console.log(undefined + 1);  // NaN       ← undefined coerces to NaN

// ─── THE RULE ───
// + with a string → concatenation
// -, *, /, % → always numeric conversion
// null → 0, undefined → NaN, true → 1, false → 0
```

### Q5.2: Equality Gotchas

```javascript
console.log(0 == false);     // true   ← false coerces to 0
console.log(0 == '');        // true   ← '' coerces to 0
console.log('' == false);    // true   ← both coerce to 0
console.log(null == undefined); // true ← special rule in the spec
console.log(null === undefined); // false ← different types
console.log(NaN == NaN);    // false  ← NaN is NOT equal to anything, including itself!
console.log(NaN === NaN);   // false  ← same reason

// ─── BEST PRACTICE ───
// ALWAYS use === (strict equality) to avoid implicit coercion surprises.
// The only exception: null == undefined is a useful check for "is this null or undefined?"
```

### Q5.3: typeof Surprises

```javascript
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object"  ← FAMOUS BUG! null is NOT an object
console.log(typeof NaN);         // "number"  ← NaN is technically a number type
console.log(typeof []);          // "object"  ← arrays are objects
console.log(typeof function(){}); // "function" ← functions get their own typeof
console.log(typeof typeof 1);   // "string"  ← typeof 1 = "number", typeof "number" = "string"

// ─── HOW TO PROPERLY CHECK ───
// Array:  Array.isArray([])     → true
// null:   value === null        → true
// NaN:    Number.isNaN(value)   → true (don't use isNaN() — it coerces!)
```

---

## 🔥 6. Scope Chain & Variable Shadowing

### Q6.1: Shadowing

```javascript
var x = 10;
let y = 20;

function test() {
  var x = 30;   // Shadows the outer x (both are var — function-scoped)
  let y = 40;   // Shadows the outer y (block-scoped to this function)
  console.log(x); // 30
  console.log(y); // 40
}

test();
console.log(x); // 10 ← outer x is unchanged
console.log(y); // 20 ← outer y is unchanged
```

### Q6.2: Block Scope vs Function Scope

```javascript
{
  var a = 1;    // var ignores blocks — goes to function/global scope
  let b = 2;   // let is block-scoped — stays inside { }
  const c = 3; // const is block-scoped — stays inside { }
}

console.log(a); // 1            ← var leaked out of the block
console.log(b); // ReferenceError ← let stays in the block
console.log(c); // ReferenceError ← const stays in the block
```

---

## 🔥 7. Prototype Chain

### Q7.1: Prototype Lookup

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

const john = new Person('John');

console.log(john.greet());          // "Hi, I'm John"
console.log(john.hasOwnProperty('name'));   // true  ← own property
console.log(john.hasOwnProperty('greet')); // false ← on prototype, not on john itself

// ─── PROTOTYPE CHAIN ───
// john → Person.prototype → Object.prototype → null
//
// When you access john.greet():
// 1. JS checks john itself — no greet property
// 2. JS checks john.__proto__ (Person.prototype) — found greet! Use it.
// 3. If not found, would check Object.prototype, then null (gives undefined)
```

### Q7.2: Modifying Prototype After Creation

```javascript
function Animal(type) {
  this.type = type;
}

const dog = new Animal('Dog');

// Add method to prototype AFTER creating the instance
Animal.prototype.speak = function() {
  return `${this.type} speaks!`;
};

console.log(dog.speak()); // "Dog speaks!" ← Works! Prototype is a live reference.

// ─── WHY? ───
// dog.__proto__ is a REFERENCE to Animal.prototype.
// When we add speak() to Animal.prototype, dog can find it through the chain.
// Prototypes are looked up at ACCESS TIME, not creation time.
```

---

## 🔥 8. Promises — Deep Dive

### Q8.1: Promise Execution Order

```javascript
const promise = new Promise((resolve) => {
  console.log('1');   // Executor runs SYNCHRONOUSLY
  resolve();
  console.log('2');   // This still runs! resolve() doesn't stop execution
});

promise.then(() => console.log('3'));  // Microtask
console.log('4');                       // Sync

// ─── OUTPUT ───
// 1
// 2
// 4
// 3

// ─── WHY? ───
// The Promise executor is sync → logs 1, then calls resolve(), then logs 2
// resolve() does NOT stop the executor — it just marks the promise as resolved
// .then callback goes to microtask queue → executed after all sync code
// Sync "4" runs, then microtask "3" runs
```

### Q8.2: Promise Chaining — Return Values

```javascript
Promise.resolve(1)
  .then(val => {
    console.log(val);      // 1
    return val + 1;        // Return value becomes the next .then's argument
  })
  .then(val => {
    console.log(val);      // 2
    // No return → next .then receives undefined
  })
  .then(val => {
    console.log(val);      // undefined
    return Promise.resolve(10); // Can return a Promise too
  })
  .then(val => {
    console.log(val);      // 10 ← Promise is unwrapped automatically
  });

// ─── OUTPUT ───
// 1
// 2
// undefined
// 10
```

### Q8.3: Promise.all vs Promise.allSettled vs Promise.race

```javascript
const p1 = Promise.resolve('A');
const p2 = Promise.reject('Error!');
const p3 = Promise.resolve('C');

// Promise.all — rejects if ANY promise rejects
Promise.all([p1, p2, p3])
  .then(values => console.log(values))
  .catch(err => console.log('all:', err));
// Output: "all: Error!"

// Promise.allSettled — waits for ALL, never rejects
Promise.allSettled([p1, p2, p3])
  .then(results => console.log(results));
// Output: [
//   { status: 'fulfilled', value: 'A' },
//   { status: 'rejected', reason: 'Error!' },
//   { status: 'fulfilled', value: 'C' }
// ]

// Promise.race — resolves/rejects with the FIRST settled promise
Promise.race([p1, p2, p3])
  .then(val => console.log('race:', val))
  .catch(err => console.log('race error:', err));
// Output: "race: A" (p1 resolves first since they're all instant)
```

---

## 🔥 9. Destructuring, Spread, Rest — Tricky Cases

### Q9.1: Swap Without Temp Variable

```javascript
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2 1

// ─── HOW? ───
// Array destructuring: the right side creates [2, 1]
// The left side destructures it into a = 2, b = 1
```

### Q9.2: Default Values with Destructuring

```javascript
const { name = 'Guest', age = 0, role = 'user' } = { name: 'Aditya', age: 25 };
console.log(name); // "Aditya"  ← value exists, default ignored
console.log(age);  // 25        ← value exists, default ignored
console.log(role); // "user"    ← value missing, default used

// ─── GOTCHA: undefined vs null ───
const { x = 10 } = { x: undefined }; // x = 10 (default is used for undefined)
const { y = 10 } = { y: null };      // y = null (default is NOT used for null)
```

### Q9.3: Rest and Spread

```javascript
// Spread — expands elements
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// Rest — collects remaining elements
const [first, ...rest] = [1, 2, 3, 4];
console.log(first); // 1
console.log(rest);  // [2, 3, 4]

const { a, ...others } = { a: 1, b: 2, c: 3 };
console.log(a);      // 1
console.log(others); // { b: 2, c: 3 }

// ─── GOTCHA: Spread creates SHALLOW copies ───
const original = { x: 1, nested: { y: 2 } };
const copy = { ...original };
copy.nested.y = 99;
console.log(original.nested.y); // 99 ← MUTATED! Shallow copy shares nested references.
```

---

## 🔥 10. Miscellaneous Tricky Questions

### Q10.1: `++` Operator — Pre vs Post

```javascript
let x = 1;
console.log(x++);  // 1  ← returns CURRENT value, THEN increments
console.log(x);    // 2  ← now x is 2

let y = 1;
console.log(++y);  // 2  ← increments FIRST, THEN returns
console.log(y);    // 2
```

### Q10.2: Short-circuit Evaluation

```javascript
console.log(0 || 'hello');     // "hello"  ← 0 is falsy, returns second operand
console.log(1 || 'hello');     // 1        ← 1 is truthy, returns first operand
console.log(0 && 'hello');     // 0        ← 0 is falsy, short-circuits
console.log(1 && 'hello');     // "hello"  ← 1 is truthy, returns second operand
console.log(null ?? 'default'); // "default" ← ?? (nullish coalescing) only checks null/undefined
console.log(0 ?? 'default');   // 0        ← 0 is NOT null/undefined, so returns 0
console.log('' ?? 'default');  // ""       ← '' is NOT null/undefined

// ─── KEY DIFFERENCE ───
// || returns the first TRUTHY value (treats 0, '', false as falsy)
// ?? returns the first NON-NULLISH value (only null/undefined are nullish)
```

### Q10.3: delete Operator

```javascript
var a = 1;        // Variables declared with var can't be deleted
let b = 2;        // let/const also can't be deleted
window.c = 3;     // Properties added directly to window CAN be deleted

console.log(delete a); // false (var can't be deleted)
console.log(delete b); // false (let can't be deleted)  
console.log(delete c); // true  (property deleted)

// ─── INTERVIEW TIP ───
// `delete` only works on object properties, not on variables.
```

### Q10.4: Comma Operator

```javascript
const result = (1, 2, 3, 4, 5);
console.log(result); // 5

// ─── WHY? ───
// The comma operator evaluates each operand left to right
// and returns the value of the LAST operand.
```

### Q10.5: Tagged Template Literals

```javascript
function tag(strings, ...values) {
  console.log(strings); // ['Hello ', ' you are ', '']
  console.log(values);  // ['Aditya', 25]
}

const name = 'Aditya';
const age = 25;
tag`Hello ${name} you are ${age}`;

// ─── HOW? ───
// Tagged templates pass the template parts as an array of strings
// and the interpolated values as additional arguments.
// Used in libraries like styled-components and GraphQL (gql`...`)
```

---

# PART 2: JavaScript Coding Challenges (Write the Code)

---

## 💡 1. Polyfill for `Array.prototype.map`

```javascript
// map() creates a new array by calling a function on every element
// Signature: array.map(callback(element, index, array), thisArg)

Array.prototype.myMap = function(callback, thisArg) {
  // 'this' refers to the array on which myMap is called
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const result = [];
  for (let i = 0; i < this.length; i++) {
    // Only call callback for existing elements (handle sparse arrays)
    if (i in this) {
      result[i] = callback.call(thisArg, this[i], i, this);
    }
  }
  return result;
};

// Test
console.log([1, 2, 3].myMap(x => x * 2)); // [2, 4, 6]
```

## 💡 2. Polyfill for `Array.prototype.filter`

```javascript
Array.prototype.myFilter = function(callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      // Only push elements where callback returns truthy
      if (callback.call(thisArg, this[i], i, this)) {
        result.push(this[i]);
      }
    }
  }
  return result;
};

// Test
console.log([1, 2, 3, 4, 5].myFilter(x => x % 2 === 0)); // [2, 4]
```

## 💡 3. Polyfill for `Array.prototype.reduce`

```javascript
Array.prototype.myReduce = function(callback, initialValue) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  let accumulator;
  let startIndex;

  if (initialValue !== undefined) {
    // If initialValue provided, start from index 0
    accumulator = initialValue;
    startIndex = 0;
  } else {
    // If no initialValue, use first element as accumulator, start from index 1
    if (this.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }

  return accumulator;
};

// Test
console.log([1, 2, 3, 4].myReduce((acc, curr) => acc + curr, 0)); // 10
console.log([1, 2, 3, 4].myReduce((acc, curr) => acc + curr));    // 10
```

## 💡 4. Debounce Implementation

```javascript
// Debounce: delays execution until user STOPS triggering for `delay` ms
// Use case: search input — wait until user stops typing before making API call

function debounce(fn, delay) {
  let timerId;

  return function(...args) {
    // Clear any existing timer (resets the delay)
    clearTimeout(timerId);

    // Set a new timer
    timerId = setTimeout(() => {
      fn.apply(this, args); // Preserve `this` context and arguments
    }, delay);
  };
}

// Usage
const search = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

// If called rapidly, only the LAST call executes (after 300ms of silence)
search('r');
search('re');
search('rea');
search('reac');
search('react'); // Only this one fires → "Searching for: react"
```

## 💡 5. Throttle Implementation

```javascript
// Throttle: ensures function runs at most ONCE per `limit` ms
// Use case: scroll events — don't fire handler on every pixel scrolled

function throttle(fn, limit) {
  let inThrottle = false;

  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);   // Execute the function
      inThrottle = true;       // Lock the gate

      setTimeout(() => {
        inThrottle = false;    // Unlock after `limit` ms
      }, limit);
    }
  };
}

// Usage
const handleScroll = throttle(() => {
  console.log('Scroll event handled at:', Date.now());
}, 1000);

// Even if scroll fires 100 times per second, handleScroll runs at most once per second
```

## 💡 6. Currying

```javascript
// Currying: transforms f(a, b, c) into f(a)(b)(c)
// Each call returns a new function until all arguments are collected

function curry(fn) {
  return function curried(...args) {
    // If we have enough arguments, call the original function
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // Otherwise, return a new function that collects more arguments
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

// Test
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3));    // 6
console.log(curriedAdd(1, 2)(3));    // 6
console.log(curriedAdd(1)(2, 3));    // 6
console.log(curriedAdd(1, 2, 3));    // 6  ← all forms work!
```

## 💡 7. Deep Flatten Array

```javascript
// Flatten: [[1, [2]], [3, [4, [5]]]] → [1, 2, 3, 4, 5]

// Method 1: Recursive
function flatten(arr) {
  return arr.reduce((acc, item) => {
    // If item is an array, recursively flatten it
    // If not, just add it to the accumulator
    return acc.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

// Method 2: Iterative with stack (no recursion limit)
function flattenIterative(arr) {
  const stack = [...arr]; // Copy to avoid mutating original
  const result = [];

  while (stack.length) {
    const item = stack.pop();
    if (Array.isArray(item)) {
      stack.push(...item); // Spread array items back onto stack
    } else {
      result.unshift(item); // Add to front (since we're popping from end)
    }
  }

  return result;
}

// Method 3: Built-in (ES2019)
console.log([1, [2, [3, [4]]]].flat(Infinity)); // [1, 2, 3, 4]

// Tests
console.log(flatten([1, [2, [3, [4, [5]]]]]));           // [1, 2, 3, 4, 5]
console.log(flattenIterative([1, [2, [3, [4, [5]]]]]));  // [1, 2, 3, 4, 5]
```

## 💡 8. Polyfill for `Promise.all`

```javascript
// Promise.all: takes an array of promises, resolves when ALL resolve, rejects if ANY rejects

function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;

    // Handle empty array
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    promises.forEach((promise, index) => {
      // Promise.resolve() wraps non-promise values
      Promise.resolve(promise)
        .then(value => {
          results[index] = value; // Maintain order (don't use push!)
          completed++;

          // When ALL promises have resolved
          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject); // If ANY promise rejects, reject the whole thing
    });
  });
}

// Test
myPromiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(console.log); // [1, 2, 3]

myPromiseAll([
  Promise.resolve(1),
  Promise.reject('Error!'),
  Promise.resolve(3)
]).catch(console.log); // "Error!"
```

## 💡 9. Deep Clone

```javascript
// Deep clone: creates a completely independent copy (no shared references)

function deepClone(obj) {
  // Handle null, undefined, and primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // Handle RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }

  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  // Handle Object
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]); // Recursively clone each property
    }
  }
  return cloned;
}

// Test
const original = {
  name: 'Aditya',
  scores: [1, 2, 3],
  address: { city: 'Delhi', pin: { code: '110001' } }
};

const clone = deepClone(original);
clone.address.pin.code = '400001';
console.log(original.address.pin.code); // "110001" ← original unchanged!

// ─── QUICK ALTERNATIVE (with limitations) ───
// structuredClone(obj)  — built-in, handles most types (not functions/DOM)
// JSON.parse(JSON.stringify(obj)) — doesn't handle Date, RegExp, undefined, functions
```

## 💡 10. Memoize Function

```javascript
// Memoize: caches function results so repeated calls with same args skip computation

function memoize(fn) {
  const cache = new Map(); // Map supports any key type

  return function(...args) {
    const key = JSON.stringify(args); // Serialize args as cache key

    if (cache.has(key)) {
      console.log('Cache hit for:', key);
      return cache.get(key);
    }

    console.log('Computing for:', key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Test
const factorial = memoize(function(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
});

console.log(factorial(5)); // Computing... → 120
console.log(factorial(5)); // Cache hit! → 120
console.log(factorial(3)); // Cache hit! → 6 (computed during factorial(5))
```

## 💡 11. Compose & Pipe

```javascript
// compose: right-to-left function composition
// pipe: left-to-right function composition

// compose(f, g, h)(x) = f(g(h(x)))
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

// pipe(f, g, h)(x) = h(g(f(x)))
function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

// Test
const add10 = x => x + 10;
const multiply2 = x => x * 2;
const subtract5 = x => x - 5;

const composed = compose(subtract5, multiply2, add10);
console.log(composed(5)); // add10(5)=15 → multiply2(15)=30 → subtract5(30)=25

const piped = pipe(add10, multiply2, subtract5);
console.log(piped(5));    // add10(5)=15 → multiply2(15)=30 → subtract5(30)=25
// Same result here, but the ORDER of functions is reversed!
```

## 💡 12. Event Emitter (Pub/Sub Pattern)

```javascript
class EventEmitter {
  constructor() {
    this.events = {}; // { eventName: [callback1, callback2, ...] }
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this; // Enable chaining
  }

  // Subscribe once — auto-removes after first call
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper); // Remove after first execution
    };
    this.on(event, wrapper);
    return this;
  }

  // Emit an event — calls all subscribers
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(...args));
    }
    return this;
  }

  // Unsubscribe
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    return this;
  }
}

// Test
const emitter = new EventEmitter();

emitter.on('greet', (name) => console.log(`Hello, ${name}!`));
emitter.once('greet', (name) => console.log(`Welcome, ${name}! (once)`));

emitter.emit('greet', 'Aditya');
// "Hello, Aditya!"
// "Welcome, Aditya! (once)"

emitter.emit('greet', 'Aditya');
// "Hello, Aditya!"
// (once listener is already removed)
```

---

# PART 3: React Coding Challenges

---

## ⚛️ 1. Todo App (The #1 Interview Question)

```jsx
import { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);        // Array of todo objects
  const [input, setInput] = useState('');          // Current input text

  // Add a new todo
  const addTodo = () => {
    if (!input.trim()) return;                     // Guard: don't add empty todos
    setTodos(prev => [
      ...prev,                                     // Spread existing todos
      { id: Date.now(), text: input, done: false } // New todo with unique id
    ]);
    setInput('');                                   // Clear input after adding
  };

  // Toggle completion status
  const toggleTodo = (id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, done: !todo.done }           // Flip the done flag
          : todo                                     // Leave others unchanged
      )
    );
  };

  // Delete a todo
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    // filter returns NEW array without the matching todo
  };

  return (
    <div>
      <h1>Todo App</h1>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addTodo()} // Add on Enter key
        placeholder="Add a task..."
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map(todo => (
          <li key={todo.id} style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            {todo.text}
            <button onClick={() => deleteTodo(todo.id)}>❌</button>
          </li>
        ))}
      </ul>

      {/* Stats */}
      <p>Total: {todos.length} | Done: {todos.filter(t => t.done).length}</p>
    </div>
  );
}
```

---

## ⚛️ 2. Search with Debouncing (Autocomplete)

```jsx
import { useState, useEffect, useCallback } from 'react';

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);  // Cleanup: cancel timer if value changes again
  }, [value, delay]);

  return debouncedValue;
}

function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300); // Wait 300ms after user stops typing

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const controller = new AbortController(); // Cancel previous request on new search
    setLoading(true);

    fetch(`https://api.example.com/search?q=${debouncedQuery}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') setLoading(false);
      });

    return () => controller.abort(); // Cleanup: cancel fetch on new query
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {loading && <p>Loading...</p>}
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## ⚛️ 3. Star Rating Component

```jsx
import { useState } from 'react';

function StarRating({ maxStars = 5, onChange }) {
  const [rating, setRating] = useState(0);     // Selected rating
  const [hover, setHover] = useState(0);       // Hovered star (for preview)

  const handleClick = (starIndex) => {
    setRating(starIndex);
    onChange?.(starIndex); // Call parent callback if provided
  };

  return (
    <div style={{ display: 'flex', cursor: 'pointer', fontSize: '2rem' }}>
      {/* Create an array of length maxStars and map over it */}
      {Array.from({ length: maxStars }, (_, i) => i + 1).map(star => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            // Fill star if it's <= the hovered value (or rating if not hovering)
            color: star <= (hover || rating) ? '#ffc107' : '#e0e0e0',
            transition: 'color 0.2s'
          }}
        >
          ★
        </span>
      ))}
      <span style={{ marginLeft: '8px', fontSize: '1rem' }}>
        {rating}/{maxStars}
      </span>
    </div>
  );
}

// Usage: <StarRating maxStars={5} onChange={(val) => console.log(val)} />
```

---

## ⚛️ 4. Accordion Component

```jsx
import { useState } from 'react';

function AccordionItem({ title, content, isOpen, onToggle }) {
  return (
    <div style={{ border: '1px solid #ddd', marginBottom: '4px', borderRadius: '4px' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '12px', textAlign: 'left',
          background: isOpen ? '#f0f0f0' : 'white', cursor: 'pointer',
          border: 'none', fontWeight: 'bold', fontSize: '16px'
        }}
      >
        {title} {isOpen ? '▲' : '▼'}
      </button>
      {/* Conditionally render content — this is the accordion magic */}
      {isOpen && (
        <div style={{ padding: '12px', borderTop: '1px solid #ddd' }}>
          {content}
        </div>
      )}
    </div>
  );
}

function Accordion({ items, allowMultiple = false }) {
  // If allowMultiple, track a Set of open indices; otherwise, track a single index
  const [openIndices, setOpenIndices] = useState(new Set());

  const toggleItem = (index) => {
    setOpenIndices(prev => {
      const next = new Set(allowMultiple ? prev : []); // Reset if single-mode
      if (next.has(index)) {
        next.delete(index);  // Close if already open
      } else {
        next.add(index);     // Open if closed
      }
      return next;
    });
  };

  return (
    <div>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          content={item.content}
          isOpen={openIndices.has(index)}
          onToggle={() => toggleItem(index)}
        />
      ))}
    </div>
  );
}

// Usage
const faqData = [
  { title: 'What is React?', content: 'A JavaScript library for building UIs.' },
  { title: 'What is JSX?', content: 'A syntax extension for JavaScript.' },
  { title: 'What are Hooks?', content: 'Functions to use state in functional components.' },
];

// <Accordion items={faqData} allowMultiple={false} />
```

---

## ⚛️ 5. Infinite Scroll

```jsx
import { useState, useEffect, useRef, useCallback } from 'react';

function InfiniteScroll() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Intersection Observer ref — attaches to the last element
  const observer = useRef();

  // This ref callback is assigned to the LAST item in the list
  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;                    // Don't observe while loading
      if (observer.current) observer.current.disconnect(); // Cleanup previous observer

      observer.current = new IntersectionObserver((entries) => {
        // When the last item becomes visible AND there's more data
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);          // Trigger next page load
        }
      });

      if (node) observer.current.observe(node); // Start observing the new last element
    },
    [loading, hasMore]
  );

  // Fetch data whenever page changes
  useEffect(() => {
    setLoading(true);

    fetch(`https://api.example.com/items?page=${page}&limit=20`)
      .then(res => res.json())
      .then(data => {
        setItems(prev => [...prev, ...data.items]); // Append new items
        setHasMore(data.items.length > 0);           // No more items? Stop loading
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  return (
    <div>
      {items.map((item, index) => {
        // Attach ref to the LAST item only
        const isLast = index === items.length - 1;
        return (
          <div
            key={item.id}
            ref={isLast ? lastItemRef : null}
            style={{ padding: '16px', borderBottom: '1px solid #eee' }}
          >
            {item.name}
          </div>
        );
      })}

      {loading && <p>Loading more...</p>}
      {!hasMore && <p>No more items</p>}
    </div>
  );
}
```

---

## ⚛️ 6. Theme Switcher (Dark/Light Mode with Context)

```jsx
import { createContext, useContext, useState, useCallback } from 'react';

// 1. Create Theme Context
const ThemeContext = createContext();

// 2. Theme Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Custom hook for consuming theme
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 4. Component that uses the theme
function ThemedApp() {
  const { theme, toggleTheme } = useTheme();

  const styles = {
    background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    padding: '20px', minHeight: '100vh', transition: 'all 0.3s ease'
  };

  return (
    <div style={styles}>
      <h1>{theme === 'dark' ? '🌙' : '☀️'} Theme: {theme}</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

// 5. App wrapper
function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
```

---

## ⚛️ 7. Counter with `useReducer` (Complex State)

```jsx
import { useReducer } from 'react';

// Define all possible actions
const ACTIONS = {
  INCREMENT: 'increment',
  DECREMENT: 'decrement',
  RESET: 'reset',
  SET: 'set'
};

// Reducer: pure function that takes state + action → returns new state
function counterReducer(state, action) {
  switch (action.type) {
    case ACTIONS.INCREMENT:
      return { ...state, count: state.count + (action.payload || 1) };
    case ACTIONS.DECREMENT:
      return { ...state, count: state.count - (action.payload || 1) };
    case ACTIONS.RESET:
      return { ...state, count: 0, history: [] };
    case ACTIONS.SET:
      return { ...state, count: action.payload, history: [...state.history, state.count] };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function AdvancedCounter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0, history: [] });

  return (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={() => dispatch({ type: ACTIONS.INCREMENT })}>+1</button>
      <button onClick={() => dispatch({ type: ACTIONS.INCREMENT, payload: 5 })}>+5</button>
      <button onClick={() => dispatch({ type: ACTIONS.DECREMENT })}>-1</button>
      <button onClick={() => dispatch({ type: ACTIONS.RESET })}>Reset</button>
      <button onClick={() => dispatch({ type: ACTIONS.SET, payload: 100 })}>Set to 100</button>

      <h3>History:</h3>
      <ul>
        {state.history.map((val, i) => <li key={i}>{val}</li>)}
      </ul>
    </div>
  );
}
```

---

## ⚛️ 8. File Explorer (Recursive Component)

```jsx
import { useState } from 'react';

// Sample file system data
const fileSystemData = {
  name: 'root',
  type: 'folder',
  children: [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'App.jsx', type: 'file' },
        { name: 'index.js', type: 'file' },
        {
          name: 'components',
          type: 'folder',
          children: [
            { name: 'Header.jsx', type: 'file' },
            { name: 'Footer.jsx', type: 'file' }
          ]
        }
      ]
    },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' }
  ]
};

function FileExplorerItem({ item, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(false);

  const isFolder = item.type === 'folder';

  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      <div
        onClick={() => isFolder && setIsOpen(prev => !prev)}
        style={{
          cursor: isFolder ? 'pointer' : 'default',
          padding: '4px 8px',
          userSelect: 'none'
        }}
      >
        {/* Icon based on type and open/closed state */}
        {isFolder ? (isOpen ? '📂' : '📁') : '📄'} {item.name}
      </div>

      {/* Recursively render children if folder is open */}
      {isFolder && isOpen && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileExplorerItem
              key={`${child.name}-${index}`}
              item={child}
              depth={depth + 1}  // Increase indentation for nested items
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileExplorer() {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
      <h3>📁 File Explorer</h3>
      <FileExplorerItem item={fileSystemData} />
    </div>
  );
}
```

---

## ⚛️ 9. OTP Input Component

```jsx
import { useState, useRef } from 'react';

function OTPInput({ length = 6, onComplete }) {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]); // Array of refs for each input

  const handleChange = (index, value) => {
    // Only allow single digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input after typing a digit
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Check if OTP is complete
    const otpString = newOtp.join('');
    if (otpString.length === length && !newOtp.includes('')) {
      onComplete?.(otpString);
    }
  };

  const handleKeyDown = (index, e) => {
    // On Backspace, clear current and move focus to previous input
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus(); // Move to previous
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return; // Only allow digits

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus the next empty input or the last input
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex].focus();
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined} // Only first input handles paste
          style={{
            width: '40px', height: '48px', textAlign: 'center',
            fontSize: '20px', border: '2px solid #ccc', borderRadius: '8px'
          }}
        />
      ))}
    </div>
  );
}

// Usage: <OTPInput length={6} onComplete={(otp) => console.log('OTP:', otp)} />
```

---

## ⚛️ 10. Shopping Cart with Context

```jsx
import { createContext, useContext, useReducer } from 'react';

// ─── Cart Context ───
const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        // If item exists, increment quantity
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        };
      }
      // If new item, add with quantity 1
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: Math.max(0, action.payload.quantity) }
            : i
        ).filter(i => i.quantity > 0) // Remove items with 0 quantity
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Computed values
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = {
    items: state.items,
    totalItems,
    totalPrice,
    addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
    removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
    updateQuantity: (id, quantity) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

// ─── Product List ───
function ProductList() {
  const { addItem } = useCart();

  const products = [
    { id: 1, name: 'React Book', price: 29.99 },
    { id: 2, name: 'JS Course', price: 49.99 },
    { id: 3, name: 'Node Guide', price: 19.99 },
  ];

  return (
    <div>
      <h2>Products</h2>
      {products.map(product => (
        <div key={product.id} style={{ padding: '8px', border: '1px solid #ddd', margin: '4px' }}>
          <span>{product.name} — ${product.price}</span>
          <button onClick={() => addItem(product)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}

// ─── Cart Display ───
function Cart() {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <div>
      <h2>Cart ({totalItems} items)</h2>
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>{item.name}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
          <span>${(item.price * item.quantity).toFixed(2)}</span>
          <button onClick={() => removeItem(item.id)}>🗑️</button>
        </div>
      ))}
      <h3>Total: ${totalPrice.toFixed(2)}</h3>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}

// ─── App ───
function App() {
  return (
    <CartProvider>
      <ProductList />
      <Cart />
    </CartProvider>
  );
}
```

---

# PART 4: Tricky Console Output Puzzles (Rapid Fire)

> Try to answer BEFORE looking at the output. These are the ones that trip people up in interviews.

---

### Puzzle 1

```javascript
console.log(typeof typeof 1);
// Output: "string"
// typeof 1 = "number" (a string), typeof "number" = "string"
```

### Puzzle 2

```javascript
console.log(0.1 + 0.2 === 0.3);
// Output: false
// 0.1 + 0.2 = 0.30000000000000004 (floating point precision issue)
// Fix: Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON
```

### Puzzle 3

```javascript
let a = { x: 1 };
let b = a;        // b points to the SAME object as a
b.x = 2;          // Mutates the shared object
console.log(a.x); // 2 — a and b reference the same object
```

### Puzzle 4

```javascript
console.log([] == false);  // true  — both coerce to 0
console.log([] == ![]);    // true  — ![] is false, [] == false → 0 == 0 → true
console.log(!![] == true); // true  — !![] → !false → true
```

### Puzzle 5

```javascript
const arr = [1, 2, 3];
arr[10] = 11;
console.log(arr.length);  // 11 — JS creates "holes" (empty slots) for indices 3-9
console.log(arr[5]);       // undefined — empty slot returns undefined
```

### Puzzle 6

```javascript
function foo() {
  return
  {
    bar: 'hello'
  };
}
console.log(foo());
// Output: undefined
// JavaScript's ASI (Automatic Semicolon Insertion) adds a semicolon after `return`
// It becomes: return; { bar: 'hello' };
// Fix: put the opening { on the same line as return
```

### Puzzle 7

```javascript
let x = 1;
switch(x) {
  case 1:
    console.log('one');
  case 2:
    console.log('two');
  case 3:
    console.log('three');
}
// Output:
// "one"
// "two"
// "three"
// Without `break`, execution FALLS THROUGH to all subsequent cases!
```

### Puzzle 8

```javascript
console.log('5' - - '3');
// Output: 8
// The double negative: - '3' converts '3' to number and negates → -3
// Then '5' - (-3) → 5 + 3 → 8
```

### Puzzle 9

```javascript
const a = {};
const b = { key: 'b' };
const c = { key: 'c' };

a[b] = 123;  // Object keys are strings → a["[object Object]"] = 123
a[c] = 456;  // Same key! → a["[object Object]"] = 456 (overwrites!)

console.log(a[b]); // 456
// Both b and c get converted to the same string "[object Object]"
```

### Puzzle 10

```javascript
var x = 10;
(function() {
  console.log(x); // ?
  var x = 20;
})();
// Output: undefined
// The inner `var x` is hoisted to the top of the IIFE
// So it becomes: var x; console.log(x); x = 20;
// The inner x shadows the outer x = 10
```

### Puzzle 11

```javascript
console.log(1 < 2 < 3);  // true  — (1 < 2) = true, (true < 3) = (1 < 3) = true
console.log(3 > 2 > 1);  // false — (3 > 2) = true, (true > 1) = (1 > 1) = false ⚠️
```

### Puzzle 12

```javascript
const person = { name: 'Aditya' };
Object.freeze(person);    // Prevents modifications

person.name = 'Modified'; // Silently fails (or throws in strict mode)
person.age = 25;           // Silently fails

console.log(person);       // { name: 'Aditya' } — unchanged!

// ⚠️ GOTCHA: freeze is SHALLOW
const obj = { nested: { x: 1 } };
Object.freeze(obj);
obj.nested.x = 99;        // This WORKS! Nested objects are NOT frozen.
console.log(obj.nested.x); // 99
```

### Puzzle 13

```javascript
const nums = [1, 2, 3];
const [a, , c] = nums;  // Skip element at index 1
console.log(a, c);       // 1 3
```

### Puzzle 14

```javascript
console.log(+'');        // 0     — empty string coerces to 0
console.log(+' ');       // 0     — whitespace string coerces to 0
console.log(+'hello');   // NaN   — non-numeric string
console.log(+true);      // 1
console.log(+false);     // 0
console.log(+null);      // 0
console.log(+undefined); // NaN
console.log(+[]);        // 0     — [] → '' → 0
console.log(+[1]);       // 1     — [1] → '1' → 1
console.log(+[1,2]);     // NaN   — [1,2] → '1,2' → NaN
```

### Puzzle 15

```javascript
async function getData() {
  return 'Hello';
}

console.log(getData());        // Promise { 'Hello' } — async always returns a Promise
console.log(await getData());  // "Hello" (only works at top-level in modules or inside async fn)
```

{% endraw %}
