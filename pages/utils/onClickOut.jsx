import React, { Component } from "react";

/**
 * Component that alerts if you click outside of it
 */
export default class OutsideClick extends Component {
  constructor(props) {
    super(props);

    this.wrapperRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  /**
   * Alert if clicked on outside of element
   */
  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      // alert("You clicked outside of me!");
      this.props.onClickOut?.(event)
    }
  }

  render() {
    return <div ref={this.wrapperRef} className="flex w-full">{this.props.children}</div>;
  }
}