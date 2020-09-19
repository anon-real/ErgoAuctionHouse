import React, {Fragment} from 'react';

import PageTitle from '../../../Layout/AppMain/PageTitle';

export default class ActiveAuctions extends React.Component {

    render() {

        return (
            <Fragment>
                <PageTitle
                    heading="Active Actions"
                    subheading="Here you can see current active auctions. You can bid on any of them if there is still time."
                    icon="pe-7s-volume2 icon-gradient bg-night-fade"
                />
                <h5>Active</h5>
            </Fragment>
        );
    }
}