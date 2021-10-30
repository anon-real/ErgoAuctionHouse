import {Redirect, Route} from 'react-router-dom';
import React, {Fragment, Suspense} from 'react';
import AuctionHistory from '../../AuctionPages/AuctionHistory';
import ActiveAuction from '../../AuctionPages/ActiveAuction';
import Artist from '../../AuctionPages/Artist';

import {ToastContainer} from 'react-toastify';
import FaqPage from "../../Faq";
import OwnedArtworks from "../../AuctionPages/Owned/ownedArtworks";
import Owned from "../../AuctionPages/Owned";

const AppMain = () => {
    return (
        <Fragment>
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
                <Route path="/auction/specific" component={ActiveAuction}/>
            </Suspense>

            {/* Artowork Visual */}
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
                <Route path="/artwork/" component={ActiveAuction}/>
            </Suspense>

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
                <Route path="/auction/active" component={ActiveAuction}/>
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
                <Route path="/auction/history" component={AuctionHistory}/>
            </Suspense>

            {/* َArtist Page */}
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
                <Route path="/artist" component={Artist}/>
            </Suspense>

            {/* My artworks */}
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
                <Route path="/owned" component={Owned}/>
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
                <Route path="/faq" component={FaqPage}/>
            </Suspense>

            <Route
                exact
                path="/"
                render={() => <Redirect to="/auction/active?type=all"/>}
            />
            {/*<Route*/}
            {/*    exact*/}
            {/*    path="/auction/active"*/}
            {/*    render={() => <Redirect to="/auction/active?type=picture" />}*/}
            {/*/>*/}
            <ToastContainer/>
        </Fragment>
    );
};

export default AppMain;
