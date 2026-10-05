//Promise.resolve(1)
//   .then((x) => x + 1)
//   .then((x) => {
//     x + 1;
//   })
//   .then((x) => console.log(x));

//   Promise.resolve(1)
//     .then((x) => x + 1)
//     .then((x) => 
//       x + 1
//     )
//     .then((x) => console.log(x));

function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound.`;
};

const dog = new Animal("Rex");
console.log(dog.speak()); // "Rex makes a sound." — found on prototype
console.log(dog.hasOwnProperty("speak")); // false — lives on prototype, not dog
console.log(Animal.hasOwnProperty("speak")); // false — lives on prototype, not Animal
console.log(Animal.prototype.hasOwnProperty("speak")); // true — speak is a property of Animal.prototype