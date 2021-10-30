import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';

import AppHeader from '../../../Layout/AppHeader';
import AppSidebar from '../../../Layout/AppSidebar';
import AppFooter from '../../../Layout/AppFooter';

const Avatar = ({ match }) => (
    <div className="d-flex justify-content-center">
        <img
            width={130}
            height={130}
            style={{ borderRadius: '100%', marginTop: -70 }}
            src="https://lh3.googleusercontent.com/x18rNFBg9leLL9TtHkhhiC8cwIurh1UhMKU6TL_JMbGyUsY8MTMhyPiz8Nz7VRJHShEgIQlCP070UB9gGWvJ05ST7IclovIWnwAUww=s130"
            alt="avatar"
        />
    </div>
);

export default Avatar;
