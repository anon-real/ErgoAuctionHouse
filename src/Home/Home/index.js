import React, {Fragment} from 'react';

import PageTitle from '../../Layout/AppMain/PageTitle';

export default class Home extends React.Component {
    render() {
        return (
            <Fragment>
                <PageTitle
                    heading="Homepage"
                    subheading=""
                    icon="pe-7s-home icon-gradient bg-night-fade"
                />
                <h5>Homepage</h5>
            </Fragment>
        );
    }
}
