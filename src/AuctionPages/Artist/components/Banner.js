import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';

import AppHeader from '../../../Layout/AppHeader';
import AppSidebar from '../../../Layout/AppSidebar';
import AppFooter from '../../../Layout/AppFooter';

const Banner = ({ match }) => (
    <div style={{ height: 220, overflow: 'hidden', width: '100%' }}>
        <img
            width="100%"
            src="https://lh3.googleusercontent.com/kFteQAedgJ8_oPl1BFmyjhKqE8H5BNALndhWXf9cjLjTz_9mtzo9qLAfN8r_cSW_7Jkt6sRg970W7EeM2kS4oyYT9iUa6tWqs1K_Cg=h600"
            alt="banner"
        />
    </div>
);

export default Banner;
