import React, {Component, Fragment} from "react";

import {Slide, toast} from "react-toastify";

export default class TitleComponent2 extends Component {
  toggle(name) {
    this.setState({
      [name]: !this.state[name],
      progress: 0.5,
    });
  }

  notify22 = () =>
    (this.toastId = toast("Another toastify example!!!", {
      transition: Slide,
      closeButton: true,
      autoClose: 5000,
      position: "bottom-center",
      type: "success",
    }));

  render() {
    return <Fragment></Fragment>;
  }
}
