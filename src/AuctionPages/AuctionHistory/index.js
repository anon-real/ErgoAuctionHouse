import React, {Fragment} from 'react';
import {Route} from 'react-router-dom';


import AppHeader from '../../Layout/AppHeader/';
import AppSidebar from '../../Layout/AppSidebar/';
import AppFooter from '../../Layout/AppFooter/';
import AuctionsHistory from "./History";

const AuctionHistory = ({match}) => (
    <Fragment>
        <AppHeader/>
        <div className="app-main">
            <AppSidebar/>
            <div className="app-main__outer">
                <div className="app-main__inner">
                    <Route path={`${match.url}`} component={AuctionsHistory}/>
                </div>
                <AppFooter/>
            </div>
        </div>
    </Fragment>
);

export default AuctionHistory;
