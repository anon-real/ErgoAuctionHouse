import React, { Fragment } from 'react';

import PageTitle from '../../../Layout/AppMain/PageTitle';
import {
    auctionTree,
    boxById,
    getAuctionHistory,
} from '../../../auction/explorer';
import HistoryBox from './historyBox';
import PropagateLoader from 'react-spinners/PropagateLoader';
import { css } from '@emotion/core';
import { showMsg } from '../../../auction/helpers';
import { Serializer } from '@coinbarn/ergo-ts/dist/serializer';
import { decodeString } from '../../../auction/serializer';
import { Address } from '@coinbarn/ergo-ts/dist/models/address';
import { Row } from 'react-bootstrap';
import { Button } from 'reactstrap';
import { ResponsiveContainer } from 'recharts';

const pagination = 100;

const override = css`
    display: block;
    margin: 0 auto;
`;

export default class AuctionsHistory extends React.Component {
    constructor() {
        super();
        this.state = {
            offset: 0,
            still: true,
            loading: true,
            boxes: [],
        };
        this.loadMore = this.loadMore.bind(this);
        this.loadMore();
    }

    loadMore(show = false) {
        if (this.state.still) {
            this.setState({ loading: true });
            getAuctionHistory(pagination, this.state.offset)
                .then((res) => {
                    if (res.length < pagination) {
                        this.setState({ still: false });
                        if (show)
                            showMsg('Complete auction history is loaded.');
                    }
                    let boxes = res
                        .filter((tx) => tx.outputs[0].ergoTree !== auctionTree)
                        .map((tx) => boxById(tx.inputs[0].id));
                    Promise.all(boxes)
                        .then((res) => {
                            res.forEach((box) => {
                                box.finalTx = box.spentTransactionId;
                                let info = Serializer.stringFromHex(
                                    decodeString(box.additionalRegisters.R9)
                                );
                                info = info
                                    .split(',')
                                    .map((num) => parseInt(num));
                                box.description = Serializer.stringFromHex(
                                    decodeString(box.additionalRegisters.R7)
                                );
                                box.increase = (
                                    ((box.value - info[0]) / info[0]) * 100
                                ).toFixed(1);
                                box.minStep = info[1];
                                box.seller = Address.fromErgoTree(
                                    decodeString(box.additionalRegisters.R4)
                                ).address;
                                box.bidder = Address.fromErgoTree(
                                    decodeString(box.additionalRegisters.R8)
                                ).address;
                                box.loader = false;
                            });
                            return res;
                        })
                        .then((res) =>
                            this.setState({
                                boxes: this.state.boxes.concat(res),
                                offset: this.state.offset + pagination,
                            })
                        )
                        .catch((_) => {
                            showMsg(
                                'Error connecting to the explorer. Will try again...',
                                false,
                                true
                            );
                            setTimeout(() => this.loadMore(), 8000);
                        })
                        .finally(() => this.setState({ loading: false }));
                })
                .catch((_) => {
                    showMsg(
                        'Error connecting to the explorer. Will try again...',
                        false,
                        true
                    );
                    this.loadMore();
                });
        }
    }

    render() {
        return (
            <Fragment>
                <PageTitle
                    heading="Action History"
                    subheading="Here you can see the list of completed auctions."
                    icon="pe-7s-wristwatch icon-gradient bg-night-fade"
                />

                {!this.state.loading && this.state.boxes.length === 0 && (
                    <strong
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        No Auction History Yet
                    </strong>
                )}

                <Row>
                    {this.state.boxes.map((box) => {
                        return <HistoryBox box={box} />;
                    })}
                </Row>

                <ResponsiveContainer height={70}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Row>
                            <Button
                                onClick={() => this.loadMore(true)}
                                outline
                                className="btn-outline-light m-2 border-0"
                                color="primary"
                            >
                                {this.state.still && !this.state.loading && (
                                    <span>
                                        <i className="nav-link-icon lnr-plus-circle">
                                            {' '}
                                        </i>
                                        Load More
                                    </span>
                                )}
                            </Button>
                        </Row>
                        <br />
                        <Row>
                            <PropagateLoader
                                css={override}
                                size={20}
                                color={'#0b473e'}
                                loading={this.state.loading}
                            />
                        </Row>
                    </div>
                </ResponsiveContainer>
            </Fragment>
        );
    }
}
