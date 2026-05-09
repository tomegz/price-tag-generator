import React, { Component } from "react";
import PropTypes from "prop-types";

class Tabs extends Component {
  constructor() {
    super();
    this.changeTab = this.changeTab.bind(this);
    this.renderTitles = this.renderTitles.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.state = { selected: 0 };
  }
  changeTab(e, index) {
    e.preventDefault();
    this.setState({
      selected: index
    });
  }
  renderTitles() {
    function renderLabel(child, index) {
      let activeClass = this.state.selected === index ? "active" : "";
      return (
        <li key={index}>
          <button className={activeClass}
            onClick={(e) => this.changeTab(e, index)}>
            {child.props.label}
          </button>
        </li>
      );
    }
    return (
      <ul className="tabs__labels">
        {this.props.children.map(renderLabel.bind(this))}
      </ul>
    );
  }
  renderContent() {
    return (
      <div className="tabs__content">
        {this.props.children[this.state.selected]}
      </div>
    );
  }
  render() {
    return (
      <div className="tabs">
        {this.renderTitles()}
        {this.renderContent()}
      </div>
    );
  }
}

Tabs.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element
  ]).isRequired
}

export default Tabs;