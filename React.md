
## 2. React Basics (react.md)

### Introduction

React is a JavaScript library for building user interfaces. It's all about **components** - reusable pieces of UI.

###  Setting Up React

The easiest way to start with React is using Create React App:

```bash
npx create-react-app my-app  # Creates a new React project
cd my-app
npm start                    # Starts the development server
```

This creates a basic project structure and starts a local development server (usually at `http://localhost:3000`).

### Components

Components are the heart of React.  They can be:

*   **Functional Components:**  (Recommended) Simple JavaScript functions.
    ```javascript
    // src/components/Welcome.js
    import React from 'react'; // Import React

    function Welcome(props) {
        return <h1>Hello, {props.name}!</h1>;
    }

    export default Welcome; // Make the component available for import
    ```

*   **Class Components:** (Older style, but still useful to know)
    ```javascript
    // src/components/Counter.js
    import React, { Component } from 'react';

    class Counter extends Component {
        constructor(props) {
            super(props);
            this.state = { count: 0 };
        }

        render() {
            return (
                <div>
                    <p>Count: {this.state.count}</p>
                    <button onClick={() => this.setState({ count: this.state.count + 1 })}>
                        Increment
                    </button>
                </div>
            );
        }
    }

    export default Counter;
    ```

### JSX

JSX looks like HTML, but it's actually JavaScript.  It's how we describe the UI.

```javascript
// Inside a component's return statement (or render method)
const element = (
    <div>
        <h1>Welcome to my app!</h1>
        <p>This is a paragraph.</p>
        <button>Click Me</button>
    </div>
);
```

*   **Expressions in JSX:** Use curly braces `{}` to embed JavaScript expressions within JSX.
    ```javascript
    const name = "Alice";
    const element = <p>Hello, {name}!</p>; // Output: <p>Hello, Alice!</p>
    ```

*   **Attributes:** Use camelCase for attributes (e.g., `className` instead of `class`).
    ```javascript
    const element = <img src="image.jpg" alt="My Image" className="my-image" />;
    ```

### Props

Props (short for "properties") are how we pass data *down* from a parent component to a child component.  Props are *read-only* in the child.

```javascript
// src/App.js
import React from 'react';
import Welcome from './components/Welcome'; //Import the Welcome component

function App() {
  return (
    <div>
      <Welcome name="Alice" />
      <Welcome name="Bob" />
      <Welcome name="Charlie" />
    </div>
  );
}

export default App;
```

In `Welcome.js` (shown above), the `name` prop is accessed as `props.name`.

### State

State is data that a component manages *itself*.  It can change over time (e.g., in response to user input).

*   **Functional Components (using Hooks):**  Use the `useState` Hook.
    ```javascript
    // src/components/Counter.js
    import React, { useState } from 'react';

    function Counter() {
        const [count, setCount] = useState(0); // [stateVariable, setStateFunction] = useState(initialValue)

        return (
            <div>
                <p>Count: {count}</p>
                <button onClick={() => setCount(count + 1)}>Increment</button>
                <button onClick={() => setCount(count - 1)}>Decrement</button>
                <button onClick={() => setCount(0)}>Reset</button>
            </div>
        );
    }

    export default Counter;
    ```

*   `useState(initialValue)`: Returns an array with two elements:
    *   The current state value.
    *   A function to update the state.

*   Calling the update function (e.g., `setCount`) triggers a re-render of the component.

### Hooks

Hooks are functions that let you "hook into" React state and lifecycle features from functional components.

*   **`useState`:**  (Explained above)

*   **`useEffect`:**  For performing side effects (e.g., fetching data, setting up subscriptions).
    ```javascript
    import React, { useState, useEffect } from 'react';

    function DataFetcher() {
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      useEffect(() => {
        async function fetchData() {
          try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            setData(jsonData);
          } catch (e) {
            setError(e);
          } finally {
            setLoading(false);
          }
        }

        fetchData();
      }, []); // Empty dependency array: runs only once (like componentDidMount)

      if (loading) {
        return <div>Loading...</div>;
      }

      if (error) {
        return <div>Error: {error.message}</div>;
      }

      return (
        <div>
          <h1>Data:</h1>
          <p>Title: {data.title}</p>
          <p>Completed: {data.completed ? 'Yes' : 'No'}</p>
        </div>
      );
    }
    export default DataFetcher
    ```
    *   `useEffect` takes two arguments:
        *   A function to run (the "effect").
        *   An optional array of dependencies.
    *   **Dependencies:**  If the dependency array is empty (`[]`), the effect runs only *once* after the initial render (like `componentDidMount` in class components). If you provide dependencies, the effect runs whenever any of those dependencies change.  If you *omit* the dependency array, the effect runs after *every* render.

###  Conditional Rendering

Show different content based on conditions.

```javascript
function Greeting(props) {
  if (props.isLoggedIn) {
    return <h1>Welcome back!</h1>;
  } else {
    return <h1>Please log in.</h1>;
  }
}
```

### Lists and Keys

When rendering lists, use the `key` prop to help React identify which items have changed.  Keys should be unique among siblings.

```javascript
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    <li key={number.toString()}>{number}</li>
  );
  return <ul>{listItems}</ul>;
}

const numbers = [1, 2, 3, 4, 5];
//... in your render method or return statement:
<NumberList numbers={numbers} />

```
*   **Don't use array indexes as keys if the order of items might change.** This can lead to bugs. Use a unique ID from your data if possible.

### Forms
* **Controlled Components:** In HTML, form elements like `<input>`, `<textarea>`, and `<select>` typically maintain their own state. In React, mutable state is typically kept in the state property of components, and only updated with `setState()`.
```jsx
class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```
*   **Uncontrolled Components:**  To write an uncontrolled component, instead of writing an event handler for every state update, you can use a ref to get form values from the DOM.
```jsx
class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.input = React.createRef();
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.input.current.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" ref={this.input} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```
---
