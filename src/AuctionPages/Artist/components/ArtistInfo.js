import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';

import AppHeader from '../../../Layout/AppHeader';
import AppSidebar from '../../../Layout/AppSidebar';
import AppFooter from '../../../Layout/AppFooter';

const ArtistInfo = ({ match }) => (
    <div className="d-flex flex-column align-items-center">
        <h2 className="font-weight-bolder mt-3">Rumble Kong League</h2>
        <div className="d-flex">
            <div>
                <div className="d-flex">
                    <div>
                        <h5>100</h5>
                        <span>items</span>
                    </div>
                    <div>
                        <h5>100</h5>
                        <span>items</span>
                    </div>
                    <div>
                        <h5>100</h5>
                        <span>items</span>
                    </div>
                </div>
            </div>
        </div>
        <div style={{ maxWidth: 800 }} className="mt-3">
            <p style={{ textAlign: 'center', fontSize: 16 }}>
                Rumble Kong League is a competitive 3 vs 3 basketball
                experience, combining play-to-earn functionality with NFT
                Collection mechanics, enabling users to compete in engaging ways
                through NFTs.
            </p>
        </div>
    </div>
);

export default ArtistInfo;
