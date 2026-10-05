// Function to calculate the sum of elements in an array using recursion.
var array_sum = function(my_array) {
  // Base case: if the array has only one element, return that element.
  if (my_array.length === 1) {
    return my_array[0];
  }
  else {
    // Recursive case: pop the last element and add it to the sum of the remaining elements.
    return my_array.pop() + array_sum(my_array);
  }
};

// Example usage: Calculate and print the sum of elements in the array [1, 2, 3, 4, 5, 6].
console.log(array_sum([1, 2, 3, 4, 5, 6])); 
