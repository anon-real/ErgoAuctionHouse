import React, {Fragment} from "react";
import {Route} from "react-router-dom";

import ActiveAuctions from "./Active";

import AppHeader from "../../Layout/AppHeader/";
import AppSidebar from "../../Layout/AppSidebar/";
import AppFooter from "../../Layout/AppFooter/";

const ActiveAuction = ({ match }) => (
  <Fragment>
    <AppHeader />
    <div className="app-main">
      <AppSidebar />
      <div className="app-main__outer">
        <div className="app-main__inner">
          <Route path={`${match.url}`} component={ActiveAuctions} />
        </div>
        <AppFooter />
      </div>
    </div>
  </Fragment>
);

export default ActiveAuction;
