import React, {Fragment} from 'react';

import PageTitle from '../../../Layout/AppMain/PageTitle';

export default class AuctionsHistory extends React.Component {

    render() {

        return (
            <Fragment>
                <PageTitle
                    heading="Action History"
                    subheading="Here you can see the list of completed auctions."
                    icon="pe-7s-wristwatch icon-gradient bg-night-fade"
                />
                <h5>History</h5>
            </Fragment>
        );
    }
}