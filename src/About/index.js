import React, {Fragment} from 'react';
import {Route} from 'react-router-dom';


import AppHeader from '../Layout/AppHeader/';
import AppSidebar from '../Layout/AppSidebar/';
import AppFooter from '../Layout/AppFooter/';
import About from "./About";

const AboutPage = ({match}) => (
    <Fragment>
        <AppHeader/>
        <div className="app-main">
            <AppSidebar/>
            <div className="app-main__outer">
                <div className="app-main__inner">
                    <Route path={`${match.url}`} component={About}/>
                </div>
                <AppFooter/>
            </div>
        </div>
    </Fragment>
);

export default AboutPage;
