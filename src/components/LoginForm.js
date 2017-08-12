import React from "react";
import PropTypes from "prop-types";

class LoginForm extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault();
    const store = this.storeInput.value;
    this.context.router.history.push(`/${store}`);
  }
  render() {
    return (
      <form className="login-form" onSubmit={this.handleSubmit}>
        <input type="text" defaultValue="profi-bike" ref={(input) => { this.storeInput = input }} />
        <input type="password" />
        <button type="submit">Login</button>
      </form>
    );
  }
}

LoginForm.contextTypes = {
  router: PropTypes.object
}

export default LoginForm;