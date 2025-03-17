## 1. JavaScript Fundamentals (javascript.md)

### Introduction

JavaScript is the language of the web! It makes websites interactive. This guide will walk you through the basics, step-by-step.

### Variables and Data Types

Variables are like containers for storing information.  We use `let`, `const`, and (less commonly now) `var` to declare them.

*   `let`: For variables that might change.
*   `const`: For variables that should *never* change (constants).
*   `var`: The older way (avoid if possible, due to scoping issues).

```javascript
let message = "Hello, world!"; // message can be changed
const pi = 3.14159;          // pi should never change
// pi = 3.14;  // This would cause an error!

console.log(message); // Output: Hello, world!
```

**Data Types:**

*   **String:** Text.  Use single or double quotes.
    ```javascript
    let name = "Alice";
    let greeting = 'Hello, ' + name + '!'; // String concatenation
    console.log(greeting) // Output: Hello, Alice!
    ```

*   **Number:** Integers (whole numbers) and floating-point numbers (decimals).
    ```javascript
    let age = 30;
    let price = 19.99;
    ```

*   **Boolean:** `true` or `false`. Used for logic.
    ```javascript
    let isLoggedIn = true;
    let isRaining = false;
    ```

*   **Null:** Represents the *intentional* absence of a value.
    ```javascript
    let selectedItem = null; // Nothing selected yet
    ```

*   **Undefined:**  A variable that has been declared but hasn't been given a value.
    ```javascript
    let myVariable;
    console.log(myVariable); // Output: undefined
    ```

*   **Object:** A collection of key-value pairs.  Think of it like a real-world object with properties.
    ```javascript
    let person = {
        firstName: "Bob",
        lastName: "Smith",
        age: 25,
        hobbies: ["reading", "gaming"] // An array inside an object
    };

    console.log(person.firstName); // Output: Bob (Accessing properties with dot notation)
    console.log(person["lastName"]); // Output: Smith (Accessing properties with bracket notation)
    ```

*   **Array:** An ordered list of values (can be any data type).
    ```javascript
    let colors = ["red", "green", "blue"];
    console.log(colors[0]); // Output: red (Arrays are zero-indexed)
    colors.push("yellow"); // Add an element to the end
    console.log(colors); // Output: ["red", "green", "blue", "yellow"]
    ```

### Operators

Operators perform actions on values.

*   **Arithmetic:**  `+`, `-`, `*`, `/`, `%` (modulo - remainder).
    ```javascript
    let sum = 10 + 5; // 15
    let difference = 10 - 5; // 5
    let product = 10 * 5; // 50
    let quotient = 10 / 5; // 2
    let remainder = 10 % 3; // 1 (10 divided by 3 has a remainder of 1)
    ```

*   **Comparison:**  `==` (loose equality - checks value), `===` (strict equality - checks value *and* type), `!=`, `!==`, `>`, `<`, `>=`, `<=`.
    ```javascript
    console.log(5 == "5");   // Output: true  (Loose equality - ignores type)
    console.log(5 === "5");  // Output: false (Strict equality - different types)
    console.log(10 > 5);     // Output: true
    ```

*   **Logical:**  `&&` (AND), `||` (OR), `!` (NOT).
    ```javascript
    let x = 10;
    let y = 5;

    console.log(x > 5 && y < 10); // Output: true (Both conditions are true)
    console.log(x > 10 || y < 10); // Output: true (At least one condition is true)
    console.log(!(x > 5));        // Output: false (Negates the true condition)
    ```

### Control Flow

Control flow statements determine which code gets executed, and when.

*   **`if`/`else if`/`else`:**
    ```javascript
    let temperature = 25;

    if (temperature > 30) {
        console.log("It's hot!");
    } else if (temperature > 20) {
        console.log("It's warm.");
    } else {
        console.log("It's cool.");
    }
    // Output: It's warm.
    ```

*   **`for` loop:**
    ```javascript
    for (let i = 0; i < 5; i++) {
        console.log("Loop iteration:", i);
    }
    // Output:
    // Loop iteration: 0
    // Loop iteration: 1
    // Loop iteration: 2
    // Loop iteration: 3
    // Loop iteration: 4
    ```

*   **`while` loop:**
    ```javascript
    let count = 0;
    while (count < 3) {
        console.log("Count:", count);
        count++;
    }
    // Output:
    // Count: 0
    // Count: 1
    // Count: 2
    ```

### Functions

Functions are reusable blocks of code.

```javascript
// Function declaration
function greet(name) {
    console.log("Hello, " + name + "!");
}

greet("Alice"); // Output: Hello, Alice!
greet("Bob");   // Output: Hello, Bob!

// Function expression
const add = function(a, b) {
    return a + b;
};

let result = add(5, 3);
console.log(result); // Output: 8

// Arrow function (ES6)
const multiply = (a, b) => a * b;  // Implicit return
console.log(multiply(4,6)) //Output 24

const square = (x) => {
    return x * x;
}; //Explicit return
console.log(square(5)) //Output: 25
```
* **Parameters:** Are the variables listed in the function's definition
* **Arguments:** Are the values passed to the function when it is called

### Scope

Scope determines where variables are accessible.

*   **Global Scope:**  Variables declared outside any function are global (accessible everywhere).
*   **Function Scope:** Variables declared *inside* a function are only accessible within that function.
*   **Block Scope:**  `let` and `const` create block-scoped variables (accessible only within the `{}` block they are defined in - like an `if` statement or `for` loop).

```javascript
let globalVar = "I'm global";

function myFunction() {
    let functionVar = "I'm local to myFunction";
    console.log(globalVar);   // Output: I'm global (globalVar is accessible)
    console.log(functionVar); // Output: I'm local to myFunction

    if (true) {
      let blockVar = "I am block-scoped";
      console.log(blockVar) //Output: I am block-scoped
    }
    //console.log(blockVar) //ReferenceError: blockVar is not defined
}
myFunction();
// console.log(functionVar); // Error! functionVar is not accessible here
```

### Asynchronous JavaScript

JavaScript is single-threaded, but it can handle asynchronous operations (like fetching data from a server) without blocking the main thread.

*   **Callbacks:**  Functions passed as arguments to be executed later.
    ```javascript
    function fetchData(callback) {
        setTimeout(() => { // Simulate a delay (like a network request)
            const data = "Some data from the server";
            callback(data); // Call the callback with the data
        }, 1000); // 1000 milliseconds (1 second)
    }

    fetchData(function(data) {
        console.log("Received data:", data); // This runs *after* the delay
    });

    console.log("This will run before the data is received!"); //This line doesn't wait
    ```

*   **Promises:**  A better way to handle asynchronous operations.  A Promise represents a value that might not be available yet.
    ```javascript
    function fetchData() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const success = true; // Simulate success or failure
          if (success) {
            const data = "Data from the server (Promise)";
            resolve(data); // Resolve the Promise with the data
          } else {
            reject("Error fetching data!"); // Reject the Promise with an error
          }
        }, 1000);
      });
    }

    fetchData()
      .then(data => {
        console.log("Success:", data); // This runs if the Promise is resolved
      })
      .catch(error => {
        console.error("Error:", error); // This runs if the Promise is rejected
      });
    ```

*   **`async`/`await`:**  Makes asynchronous code look more like synchronous code.  `async` functions always return a Promise.  `await` pauses execution until a Promise is resolved or rejected.
    ```javascript
    async function getData() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos/1'); // Example API
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    getData();
    ```

###  ES6+ Features

*   **Template Literals:**  Easier string formatting with backticks (``).
    ```javascript
    let name2 = "Alice";
    let greeting2 = `Hello, ${name2}!  The sum of 2 + 2 is ${2 + 2}.`;
    console.log(greeting2); // Output: Hello, Alice!  The sum of 2 + 2 is 4.
    ```

*   **Destructuring:**  Unpack values from arrays or objects.
    ```javascript
    // Array destructuring
    let numbers2 = [1, 2, 3];
    let [first, second, third] = numbers2;
    console.log(first, second, third); // Output: 1 2 3

    // Object destructuring
    let person2 = { firstName2: "Bob", age2: 30 };
    let { firstName2, age2 } = person2;let { firstName2, age2 } = person2;
    console.log(firstName2, age2); // Output: Bob 30
    ```

*   **Spread/Rest Operators (`...`):**
    *   **Spread:**  Expands an array or object.
        ```javascript
        let arr1 = [1, 2, 3];
        let arr2 = [...arr1, 4, 5]; // Create a new array with elements from arr1
        console.log(arr2) // Output: [1, 2, 3, 4, 5]

        let obj1 = { a: 1, b: 2 };
        let obj2 = { ...obj1, c: 3 }; // Create a new object with properties from obj1
        console.log(obj2) // Output: { a: 1, b: 2, c: 3 }
        ```
    *   **Rest:**  Collects remaining arguments into an array.
        ```javascript
        function sum(...numbers) { // numbers is an array of all arguments
            let total = 0;
            for (let num of numbers) {
                total += num;
            }
            return total;
        }

        console.log(sum(1, 2, 3, 4)); // Output: 10
        ```

*   **Classes:**
    ```javascript
    class Animal {
        constructor(name) {
            this.name = name;
        }

        speak() {
            console.log(`${this.name} makes a sound.`);
        }
    }

    class Dog extends Animal { // Inheritance
        speak() {
            console.log(`${this.name} barks.`);
        }
    }

    let myDog = new Dog("Buddy");
    myDog.speak(); // Output: Buddy barks.
    ```

* **Modules:**  Organize code into separate files.
  * **`math.js`**
    ```js
    // math.js
    export function add(a, b) {
      return a + b;
    }

    export const PI = 3.14159;
    ```
  * **`main.js`**
    ```js
    // main.js
    import { add, PI } from './math.js';

    console.log(add(2, 3)); // Output: 5
    console.log(PI);        // Output: 3.14159
    ```
---

