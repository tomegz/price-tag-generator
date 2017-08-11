import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";

import './index.css';
import App from './App';
import LoginForm from "./components/LoginForm";
import NotFound from "./components/NotFound";
import registerServiceWorker from './registerServiceWorker';

const Root = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={LoginForm} />
        { /* Exact pattern because of only one store so far */ }
        <Route path="/profi-bike" component={App} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

render(<Root />, document.getElementById('root'));
registerServiceWorker();
