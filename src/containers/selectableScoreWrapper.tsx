import React, { Component } from "react";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import ReduxPromise from "redux-promise";

import { reducers } from "meld-clients-core/lib/reducers";
import SolidWrapper from "./solidWrapper";

type WrapperProps = {
  MEI_URI: string;
  store: any;
};

type WrapperState = {
  MEI_URI: string;
};

const createStoreWithMiddleware = applyMiddleware(
  thunk,
  ReduxPromise
)(createStore);

export default class SelectableScoreWrapper extends Component<
  WrapperProps,
  WrapperState
> {
  constructor(props: any) {
    super(props);
    // MEI_URI: Can be a full URI, e.g. obtained from the TROMPA Contributor Environment
    this.state = {
      MEI_URI: "Mahler.mei",
    };
    this.store = createStore(reducers);
  }

  render() {
    return (
      <Provider store={createStoreWithMiddleware(reducers)}>
        <SolidWrapper
          uri={this.state.MEI_URI}
          //vrvOptions={this.props.vrvOptions}
          //handleMEIInput={this.handleMEIInput}
          //onChange={this.onChange}
          //value={this.state.value}
          // zoomIn={this.props.zoomIn}
          // zoomOut={this.props.zoomOut}
        />
      </Provider>
    );
  }
}
