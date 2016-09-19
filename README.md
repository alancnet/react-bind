# React-Bind
Functional reactive 2-way binding.

## TL;DR:

```jsx
import React, { Component } from 'react';
import { Binder } from 'react-bind';

class TextBox extends Component {
  render() {
    return <input type="text" value={this.props.model.state || ""} 
      onChange={ev => this.props.model.set(ev.target.value)} />
  }
}

class Address extends Component {
  constructor() {
    super();
    this.bind = new Binder(this).bind;
  }
  render() {
    return <div>
      <div>Address 1: <TextBox model={this.bind('address1')} /></div>
      <div>Address 2: <TextBox model={this.bind('address2')} /></div>
      <div>City: <TextBox model={this.bind('city')} /></div>
      <div>State: <TextBox model={this.bind('state')} /></div>
      <div>Postal: <TextBox model={this.bind('postal')} /></div>
    </div>
  }
}

class App extends Component {
  constructor() {
    super();
    this.binder = new Binder(this);
    this.bind = this.binder.bind;
    this.state = {
      model: {
        billingAddress: {
          address1: "123 React Blvd",
          address2: "Unit A",
          city: "San Reacto",
          state: "PO",
          postal: "00123"
        }
      }
    };
    this.binder.setModel(this.state.model);
  }

  render() {
    return (
      <div>
        <div>
          Billing Address:<br />
          <Address model={this.bind('billingAddress')} />
        </div>
        <div>
          Shipping Address:<br />
          <Address model={this.bind('shippingAddress')} />
        </div>
      </div>
    );
  }
}
```

## How does it work?
A component carries a model in state. Child components are bound to the model using a binder. The binder carries a portion of the model and allows for getting and setting of properties. When a property is set on the model, the changes are made on a copy, and delivered to the root component to handle. By default, the behavior is to write the new model to state, overriding the previous state. This way, the root component has full control of the model, and there is no data flowing backwards.

## Why two-way binding?
React does many things well, but one thing I've found it does not do well is large forms such as registration forms. One key example is creating a reusable street address control for a form that has two or more addresses such as billing vs. shipping. Traditionally, with the many text fields, you have to write individual handlers for each, and set state on a component that doesn't own the data, or provide events to the parent component so it can set the appropriate state per address. With react-bind, as shown in the example above, you only need to create this function once when rendering a native component. You'll notice the example achieves collecting information about both addresses without any more single-use functions.

