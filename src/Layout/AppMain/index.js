import { Redirect, Route } from 'react-router-dom';
import React, { Fragment, Suspense } from 'react';
import AuctionHistory from '../../AuctionPages/AuctionHistory';
import ActiveAuction from '../../AuctionPages/ActiveAuction';

import { ToastContainer } from 'react-toastify';
import Homepage from "../../Home";
import AboutPage from "../../About";

const AppMain = () => {
    return (
        <Fragment>
            {/* ActiveAuction */}
            <Suspense
                fallback={
                    <div className="loader-container">
                        <div className="loader-container-inner">
                            <h6 className="mt-5">
                                Please wait while we load all the Components
                                examples
                            </h6>
                        </div>
                    </div>
                }
            >
                <Route path="/auction/active" component={ActiveAuction} />
            </Suspense>

            {/* AuctionHistory */}
            <Suspense
                fallback={
                    <div className="loader-container">
                        <div className="loader-container-inner">
                            <h6 className="mt-5">
                                Please wait while we load all the Components
                                examples
                            </h6>
                        </div>
                    </div>
                }
            >
                <Route path="/auction/history" component={AuctionHistory} />
            </Suspense>

            {/* Homepage */}
            <Suspense
                fallback={
                    <div className="loader-container">
                        <div className="loader-container-inner">
                            <h6 className="mt-5">
                                Please wait while we load all the Components
                                examples
                            </h6>
                        </div>
                    </div>
                }
            >
                <Route path="/home" component={Homepage} />
            </Suspense>

            {/* Homepage */}
            <Suspense
                fallback={
                    <div className="loader-container">
                        <div className="loader-container-inner">
                            <h6 className="mt-5">
                                Please wait while we load all the Components
                                examples
                            </h6>
                        </div>
                    </div>
                }
            >
                <Route path="/about" component={AboutPage} />
            </Suspense>

            <Route
                exact
                path="/"
                render={() => <Redirect to="/auction/active" />}
            />
            <ToastContainer />
        </Fragment>
    );
};

export default AppMain;
