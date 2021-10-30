import React, { Fragment } from 'react';

import AppHeader from '../../Layout/AppHeader/';
import Banner from './components/Banner';
import Avatar from './components/Avatar';
import ArtistInfo from './components/ArtistInfo';
import AppFooter from '../../Layout/AppFooter/';

const Artist = ({ match }) => (
    <Fragment>
        <AppHeader />
        <div className="app-main">
            <Banner />
            <Avatar />
            <ArtistInfo />
            <AppFooter />
        </div>
    </Fragment>
);

export default Artist;
