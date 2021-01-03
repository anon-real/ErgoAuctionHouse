import React, {Fragment} from 'react';

import PageTitle from '../../../Layout/AppMain/PageTitle';
import {
    allAuctionTrees,
    boxById,
    getAuctionHistory, getCompleteAuctionHistory,
} from '../../../auction/explorer';
import HistoryBox from './historyBox';
import PropagateLoader from 'react-spinners/PropagateLoader';
import {css} from '@emotion/core';
import {showMsg} from '../../../auction/helpers';
import {decodeBox} from '../../../auction/serializer';
import {Row} from 'react-bootstrap';
import {Button} from 'reactstrap';
import {ResponsiveContainer} from 'recharts';

export default class ShowHistories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boxes: props.boxes,
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({boxes: nextProps.boxes})
    }

    render() {
        return (
            <Fragment>
                <Row>
                    {this.state.boxes.map((box) => {
                        return <HistoryBox box={box}/>;
                    })}
                </Row>
            </Fragment>
        );
    }
}
