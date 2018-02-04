import React from 'react';

class Test extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    global['constructorME'] = this;
  }

  componentDidMount() {
    this.myVariable = "super";
    global['didMountME'] = this;
  }

  handleClick() {
    console.log(this.myVariable); // will log undefined
    console.log('this equal?',
      global['constructorME'] === global['didMountME']
    ); // => false
  }

  render() {
    return(
      <div onClick={this.handleClick}>Click Me</div>
    );
  }
}