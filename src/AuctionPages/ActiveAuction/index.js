import React, {Fragment} from "react";
import {Route} from "react-router-dom";

import ActiveAuctions from "./Active";

import AppHeader from "../../Layout/AppHeader/";
import AppSidebar from "../../Layout/AppSidebar/";
import AppFooter from "../../Layout/AppFooter/";
import SpecificAuctions from "./Active/specificAuction";

const ActiveAuction = ({match}) => (
    <Fragment>
        <AppHeader/>
        <div className="app-main">
            {/*<AppSidebar/>*/}
            <div className="app-main__outer">
                <div className="app-main__inner">
                    <Route path='/auction/active' component={ActiveAuctions}/>
                    <Route path='/auction/specific/' component={SpecificAuctions}/>
                </div>
                <AppFooter/>
            </div>
        </div>
    </Fragment>
);

export default ActiveAuction;
