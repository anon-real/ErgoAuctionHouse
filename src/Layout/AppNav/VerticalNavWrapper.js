import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';

import MetisMenu from 'react-metismenu';

import {About, ActiveNav, HistoryNav} from './NavItems';

class Nav extends Component {

    state = {};

    render() {
        return (
            <Fragment>
                <div className="divider text-muted opacity-2" />
                <MetisMenu content={ActiveNav} activeLinkFromLocation className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/>
                <MetisMenu content={HistoryNav} activeLinkFromLocation className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/>
                <div className="divider text-muted opacity-2" />
                <MetisMenu content={About} activeLinkFromLocation className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/>
            </Fragment>
        );
    }

    isPathActive(path) {
        return this.props.location.pathname.startsWith(path);
    }
}

export default withRouter(Nav);