import React, { Fragment } from 'react';

import PageTitle from '../../Layout/AppMain/PageTitle';

export default class About extends React.Component {
    render() {
        return (
            <Fragment>
                <PageTitle
                    heading="About"
                    subheading=""
                    icon="pe-7s-attention icon-gradient bg-night-fade"
                />
                <h5>About</h5>
            </Fragment>
        );
    }
}
