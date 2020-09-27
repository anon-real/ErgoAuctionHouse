import React, { Fragment } from 'react';

import PageTitle from '../../Layout/AppMain/PageTitle';
import Faq from 'react-faq-component';

const data = {
    rows: [
        {
            title: 'Lorem ipsum dolor sit amet,',
            content: 'Lorem ipsum dolor sit amet, consectetur ',
        },
        {
            title: 'Nunc maximus, magna at ultricies elementum',
            content:
                'Nunc maximus, magna at ultricies elementum, risus turpis vulputate quam.',
        },
        {
            title: 'Curabitur laoreet, mauris vel blandit fringilla',
            content:
                'Curabitur laoreet, mauris vel blandit fringilla, leo elit rhoncus nunc',
        },
    ],
};

export default class Faqs extends React.Component {
    render() {
        return (
            <Fragment>
                <PageTitle
                    heading="FAQ"
                    subheading=""
                    icon="pe-7s-attention icon-gradient bg-night-fade"
                />
                <Faq
                    data={data}
                    styles={{
                        bgColor: '#f1f4f6',
                        titleTextColor: '#48482a',
                        rowTitleColor: '#78789a',
                        rowTitleTextSize: 'large',
                        rowContentColor: '#48484a',
                        rowContentTextSize: '16px',
                        rowContentPaddingTop: '10px',
                        rowContentPaddingBottom: '10px',
                        rowContentPaddingLeft: '50px',
                        rowContentPaddingRight: '150px',
                        arrowColor: 'black',
                    }}
                />
            </Fragment>
        );
    }
}
