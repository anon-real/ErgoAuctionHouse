import React, { Fragment } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Button,
    Container,
    Modal,
    ModalBody,
    ModalHeader,
    Row,
} from 'reactstrap';
import {friendlyToken, getAddrUrl, getTxUrl, showMsg} from '../../../auction/helpers';
import SyncLoader from 'react-spinners/SyncLoader';
import { css } from '@emotion/core';
import { ResponsiveContainer } from 'recharts';
import { auctionTree, boxById, txById } from '../../../auction/explorer';
import AppMobileMenu from '../../../Layout/AppMobileMenu';
import moment from 'moment';

const override = css`
    display: block;
    margin: 0 auto;
`;

class BidHistory extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            data: {
                bids: [],
                labels: [],
                txIds: [],
            },
        };
        this.loadBids = this.loadBids.bind(this);
    }

    showTx(txId) {
        window.open(getTxUrl(txId), '_blank');
    }

    loadBids(txId) {
        txById(txId)
            .then((res) => {
                let time = moment(res.summary.timestamp).format('lll');
                this.setState({
                    data: {
                        labels: [time].concat(this.state.data.labels),
                        bids: this.state.data.bids,
                        txIds: this.state.data.txIds,
                    },
                });

                boxById(res.inputs[res.inputs.length - 1].id)
                    .then((res) => {
                        if (res.ergoTree !== auctionTree) {
                            this.setState({
                                loading: false,
                            });
                        } else {
                            this.setState({
                                data: {
                                    bids: [res.value / 1e9].concat(
                                        this.state.data.bids
                                    ),
                                    labels: this.state.data.labels,
                                    txIds: [res.txId].concat(
                                        this.state.data.txIds
                                    ),
                                },
                            });
                            this.loadBids(res.txId);
                        }
                    })
                    .catch((_) => {
                        showMsg(
                            'Failed to load all bids history...',
                            false,
                            true
                        );
                        this.setState({ loading: false });
                    });
            })
            .catch((_) => {
                showMsg('Failed to load all bids history...', false, true);
                this.setState({ loading: false });
            });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this.setState({
                data: {
                    bids: [this.props.box.value / 1e9],
                    labels: [],
                    txIds: [this.props.box.txId],
                },
                loading: true,
            });
            this.loadBids(this.props.box.txId);
        }
    }

    render() {
        let data = {
            labels: this.state.data.labels,
            datasets: [
                {
                    label: 'Bid Amount in ERG',
                    backgroundColor: 'rgba(35, 67, 123, 1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(53, 102, 187, 1)',
                    data: this.state.data.bids,
                },
            ],
        };

        return (
            <Modal
                size="lg"
                isOpen={this.props.isOpen}
                toggle={this.props.close}
                className={this.props.className}
            >
                <ModalHeader toggle={this.props.close}>
                    <span className="fsize-1 text-muted">
                        Bid history of{' '}
                        {friendlyToken(this.props.box.assets[0], false, 5)}. Click on bars to see transaction.
                    </span>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <SyncLoader
                            css={override}
                            size={8}
                            color={'#0b473e'}
                            loading={this.state.loading}
                        />
                    </Row>
                    <div>
                        <Bar
                            onElementsClick={(e) => {
                                if (e.length > 0 && e[0]._index !== undefined) this.showTx(this.state.data.txIds[e[0]._index])
                            }}
                            data={data}
                            width={100}
                            height={50}
                            options={{
                                maintainAspectRatio: true,
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true
                                        }
                                    }]
                                }
                            }}
                        />
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}

export default BidHistory;
