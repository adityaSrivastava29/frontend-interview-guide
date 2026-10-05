---
layout: note
---

[← Back to Home](../index.md)

Arrays are one of the most fundamental data structures in JavaScript. They are used to store collections of values, and provide a variety of methods for manipulating and working with those values.

declaring an array:
```javascript
let arr = [1, 2, 3];
```

accessing an array:
```javascript
let arr = [1, 2, 3];
console.log(arr[0]); // 1
```

modifying an array:
```javascript
let arr = [1, 2, 3];
arr[0] = 4;
console.log(arr); // [4, 2, 3]
```

----------------------

JavaScript array methods can be categorized into two groups:
- Mutating methods: These are the methods that directly modify the original array.
- Non-mutating methods: These methods return a new array without altering the
original one.

There are 9 methods in total that mutate the arrays, 

1. `push`: Adds one or more elements to array.
```javascript
let arr1 = [1, 2, 3];
// Syntax: array.push(element1, element2, ..., elementN)
let newLength1 = arr1.push(4, 5); // arr1 is now [1, 2, 3, 4, 5], newLength1 is 5
```
the end of the array and returns the new length. 

2. `pop`: Removes the last element from the
array and returns that element. 
```javascript
let arr2 = [1, 2, 3];
let lastElement = arr2.pop(); // arr2 is [1, 2], lastElement is 3
```

3. `unshift`: Adds one or more elements to the beginning of
the array and returns the new length.
```javascript
let arr3 = [2, 3];
let newLength3 = arr3.unshift(1); // arr3 is [1, 2, 3], newLength3 is 3
```
4. `shift`: Removes the first element from the array
and returns that element. 
```javascript
let arr4 = [1, 2, 3];
let firstElement = arr4.shift(); // arr4 is [2, 3], firstElement is 1
```
5. `splice`: Changes the contents of an array in place by removing, replacing, or adding elements. It modifies the original array and returns a new array containing the deleted elements.

   **Syntax:**
   ```javascript
   array.splice(start, deleteCount, item1, item2, ..., itemN)
   ```

   **Parameters:**
   - `start`: The zero-based index at which to start changing the array. If negative, it counts backward from the end of the array (e.g., `-1` is the last element).
   - `deleteCount` *(Optional)*: An integer indicating the number of elements to remove from `start`. If omitted, all elements from `start` to the end of the array are removed. If `0` or negative, no elements are removed.
   - `item1, item2, ...` *(Optional)*: The elements to add to the array, beginning at the `start` index. If omitted, `splice()` will only remove elements.

   **Common Use Cases:**
   - **1. Removing Elements:** Provide the `start` index and the number of items to delete.
     ```javascript
     const fruits = ['Apple', 'Banana', 'Cherry', 'Date'];
     // Remove 2 elements starting at index 1 ('Banana' and 'Cherry')
     const deleted = fruits.splice(1, 2);
     console.log(fruits);  // Output: ['Apple', 'Date'] (Modified original array)
     console.log(deleted); // Output: ['Banana', 'Cherry'] (Returned deleted elements)
     ```
   - **2. Adding Elements (Without Deleting):** Set `deleteCount` to `0` to insert new elements at a specific index without removing existing ones.
     ```javascript
     const fruits = ['Apple', 'Date'];
     // Insert 'Banana' and 'Cherry' at index 1, deleting 0 elements
     fruits.splice(1, 0, 'Banana', 'Cherry');
     console.log(fruits); // Output: ['Apple', 'Banana', 'Cherry', 'Date']
     ```
   - **3. Replacing Elements:** Provide a `deleteCount` greater than `0` along with the new items to swap out elements.
     ```javascript
     const fruits = ['Apple', 'Banana', 'Cherry', 'Date'];
     // Replace 2 elements starting at index 1 with 'Kiwi'
     fruits.splice(1, 2, 'Kiwi');
     console.log(fruits); // Output: ['Apple', 'Kiwi', 'Date']
     ```

   #### `splice()` vs `slice()`
   A common point of confusion is mixing up `splice()` with `slice()`:

   | Feature | `splice()` | `slice()` |
   | :--- | :--- | :--- |
   | **Mutation** | Mutates the original array in place. | Does not mutate; returns a shallow copy. |
   | **Primary Use** | Adding, removing, or replacing elements. | Extracting a subsection of an array. |
   | **Return Value** | An array containing the deleted elements. | A new array containing the extracted elements. |
6. `sort`: Sorts the elements of the array in-place based on a given sorting
criteria. 
```javascript
let arr6 = [3, 1, 4, 2];
arr6.sort(); // arr6 is [1, 2, 3, 4] (default string sort)
arr6.sort((a, b) => b - a); // arr6 is [4, 3, 2, 1] (numeric sort)
```
7. `reverse`: Reverses the order of elements in the given array. 
```javascript
let arr7 = [1, 2, 3];
arr7.reverse(); // arr7 is [3, 2, 1]
```
8. `fill`: Fills all
elements of the array with a specific value. 
```javascript
let arr8 = [1, 2, 3];
arr8.fill(0); // arr8 is [0, 0, 0]
// Fill with 5 from index 1 to 3 (exclusive)
let arr8b = [1, 2, 3, 4];
arr8b.fill(5, 1, 3); // arr8b is [1, 5, 5, 4]
```
9. `copyWithin`: Copies a sequence of elements
within the array to a specified target index in the same array
```javascript
let arr9 = [1, 2, 3, 4, 5];
// Copy elements at index 3 to index 0
arr9.copyWithin(0, 3, 4); // arr9 is [4, 2, 3, 4, 5]
```


Non-mutating methods: These methods return a new array without altering the
original one.
There are many non-mutating methods, including:
1.  `concat`: Merges two or more arrays and returns a new array.
```javascript
let arrA = [1, 2];
let arrB = [3, 4];
let merged = arrA.concat(arrB); // merged is [1, 2, 3, 4]
```
2.  `slice`: Returns a shallow copy of a portion of an array into a new array object without modifying the original array.
```javascript
let arrC = [1, 2, 3, 4, 5];
let sliced = arrC.slice(1, 3); // sliced is [2, 3]
```
> **Note:** Unlike `splice()`, `slice()` does not modify the original array. (See [`splice()` vs `slice()` comparison](#splice-vs-slice) under mutating methods).
3.  `map`: Creates a new array populated with the results of calling a provided function on every element in the calling array.
```javascript
let arrD = [1, 2, 3];
let doubled = arrD.map(x => x * 2); // doubled is [2, 4, 6]
```
4.  `filter`: Creates a new array with all elements that pass the test implemented by the provided function.
```javascript
let arrE = [1, 2, 3, 4];
let evens = arrE.filter(x => x % 2 === 0); // evens is [2, 4]
```
5.  `reduce`: Executes a user-supplied "reducer" callback function on each element of the array, in order, passing in the return value from the calculation on the preceding element. The final result of running the reducer across all elements of the array is a single value.
```javascript
let arrF = [1, 2, 3, 4];
let sum = arrF.reduce((acc, curr) => acc + curr, 0); // sum is 10
```
6.  `forEach`: Executes a provided function once for each array element. It does not return a new array; its return value is `undefined`.
```javascript
let arrG = [1, 2, 3];
arrG.forEach(x => console.log(x)); // Logs 1, 2, 3
```
7.  `join`: Creates and returns a new string by concatenating all of the elements in an array.
```javascript
let arrH = ['a', 'b', 'c'];
let str = arrH.join('-'); // str is "a-b-c"
```
8.  `indexOf`/`lastIndexOf`: Returns the first/last index at which a given element can be found in the array, or -1 if it is not present.
```javascript
let arrI = [1, 2, 3, 2, 1];
let firstIndex = arrI.indexOf(2); // 1
let lastIndex = arrI.lastIndexOf(2); // 3
```
9.  `includes`: Determines whether an array includes a certain value among its entries, returning `true` or `false`.
```javascript
let arrJ = [1, 2, 3];
let hasTwo = arrJ.includes(2); // true
let hasFour = arrJ.includes(4); // false
```
10. `find`: Returns the value of the first element in the provided array that satisfies the provided testing function.
```javascript
let arrK = [5, 12, 8, 130, 44];
let found = arrK.find(element => element > 10); // found is 12
```
11. `findIndex`: Returns the index of the first element in the array that satisfies the provided testing function. Otherwise, it returns -1.
```javascript
let arrL = [5, 12, 8, 130, 44];
let foundIndex = arrL.findIndex(element => element > 13); // foundIndex is 3
```
12. `some`: Tests whether at least one element in the array passes the test implemented by the provided function.
```javascript
let arrM = [1, 2, 3, 4, 5];
let even = arrM.some(element => element % 2 === 0); // true
```
13. `every`: Tests whether all elements in the array pass the test implemented by the provided function.
```javascript
let arrN = [1, 30, 39, 29, 10, 13];
let allBelow40 = arrN.every(element => element < 40); // true
```
14. `flat`: Creates a new array with all sub-array elements concatenated into it recursively up to the specified depth.
```javascript
let arrO = [0, 1, 2, [3, 4]];
let flattened = arrO.flat(); // flattened is [0, 1, 2, 3, 4]
```
15. `flatMap`: Returns a new array formed by applying a given callback function to each element of the array, and then flattening the result by one level.
```javascript
let arrP = [1, 2, 3, 4];
let flatMapped = arrP.flatMap(x => [x, x * 2]); // flatMapped is [1, 2, 2, 4, 3, 6, 4, 8]
```
16. `at`: Takes an integer value and returns the item at that index, allowing for positive and negative integers.
```javascript
let arrQ = [5, 12, 8, 130, 44];
let index2 = arrQ.at(2); // 8
let lastItem = arrQ.at(-1); // 44
```
17. `reduceRight`: Applies a function against an accumulator and each value of the array (from right-to-left) to reduce it to a single value.
```javascript
let arrR = ['1', '2', '3', '4', '5'];
let rightReduced = arrR.reduceRight((acc, curr) => acc + curr); // "54321"
```

| Mutating method	| Non-mutating alternative
| copyWithin()	|No one-method alternative
fill()	No one-method alternative
pop()	slice(0, -1)
push(v1, v2)	concat([v1, v2])
reverse()	toReversed()
shift()	slice(1)
sort()	toSorted()
splice()	toSpliced()
unshift(v1, v2)	toSpliced(0, 0, v1, v2)


### Static Methods

1. `Array.from`: Creates a new, shallow-copied Array instance from an iterable or array-like object.
```javascript
let fromString = Array.from('foo'); // ["f", "o", "o"]
```
2. `Array.of`: Creates a new Array instance from a variable number of arguments, regardless of number or type of the arguments.
```javascript
let ofArray = Array.of(7); // [7]
let ofArray2 = Array.of(1, 2, 3); // [1, 2, 3]
```
3. `Array.isArray`: Determines whether the passed value is an Array.
```javascript
let isArr = Array.isArray([1, 2, 3]); // true
let isNotArr = Array.isArray({foo: 123}); // false
```
