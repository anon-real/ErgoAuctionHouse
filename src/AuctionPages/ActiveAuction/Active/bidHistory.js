import React from 'react';
import {Bar} from 'react-chartjs-2';
import {Modal, ModalBody, ModalHeader, Row,} from 'reactstrap';
import {friendlyToken, getTxUrl, showMsg,} from '../../../auction/helpers';
import SyncLoader from 'react-spinners/SyncLoader';
import {css} from '@emotion/core';
import { boxById, getAllBidsByAuctionId, txById } from '../../../auction/explorer';
import moment from 'moment';
import {ResponsiveContainer} from 'recharts';
import ReactTooltip from 'react-tooltip';
import {auctionAddress, auctionTrees} from "../../../auction/consts";
import {longToCurrency} from "../../../auction/serializer";
import { data } from 'autoprefixer';

const override = css`
  display: block;
  margin: 0 auto;
`;

const maxLoad = 50

class BidHistory extends React.Component {
    constructor(props) {
        super();
        this.state = {
            loading: false,
            remains: true,
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

    async loadBids(box) {
        const bids = await getAllBidsByAuctionId(box.id);
        console.log(box);
        let data = {
            bids: [],
            labels: [],
            txIds: [],
        }
        bids.map((bid)=>{
            if(bid.value !== 0){
                let time = moment(bid.timestamp).format('lll');
                data.bids.push(longToCurrency(this.props.box.numberOfAssets > 1 ? bid.amount : bid.value, -1, this.props.box.currency))
                data.labels.push(time)
                data.txIds.push(bid.transactionId)
            }
        })
        this.setState({
            loading: false,
            remains: false,
            data
        });

    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this.setState({
                data: {
                    bids: [],
                    labels: [],
                    txIds: [],
                },
                loading: true,
                remains: true,
            });
            // let txId = this.props.box.stableId? this.props.box.stableTxId : this.props.box.transactionId
            // if (!txId) txId = this.props.box.outputTransactionId
            this.loadBids(this.props.box);
            // this.loadBids(this.props.box.transactionId, 10);
        }
    }

    callbackFn(value, index, values) {
        return value;
    }

    render() {
        let data = {
            labels: this.state.data.labels,
            datasets: [
                {
                    label: `Bid Amount in ${this.props.box.currency}`,
                    backgroundColor: 'rgba(35, 67, 123, 1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(53, 102, 187, 1)',
                    data: this.state.data.bids.sort((a, b) => a.timeStamp - b.timeStamp),
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
                    <ReactTooltip/>
                    <span className="fsize-1 text-muted">
                        Bid history of{' '}
                        {friendlyToken(this.props.box.token, false, 5)}.
                        Click on bars to see transaction.
                    </span>
                </ModalHeader>
                <ModalBody>
                    <div>
                        <Bar
                            onElementsClick={(e) => {
                                if (e.length > 0 && e[0]._index !== undefined)
                                    this.showTx(
                                        this.state.data.txIds[e[0]._index]
                                    );
                            }}
                            data={data}
                            width={100}
                            height={50}
                            options={{
                                maintainAspectRatio: true,
                                scales: {
                                    yAxes: [
                                        {
                                            ticks: {
                                                beginAtZero: true,
                                                callback: this.callbackFn,
                                            },
                                        },
                                    ],
                                },
                            }}
                        />
                    </div>

                    <hr/>
                    <ResponsiveContainer height={40}>
                        <div
                            className="mt-1"
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            {this.state.remains && !this.state.loading && (
                                <div>
                                    <ReactTooltip
                                        effect="solid"
                                        place="right"
                                    />
                                    <div
                                        data-tip={`load ${maxLoad} more bids`}
                                        id="loadMoreIcn"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                        className="widget-subheading m-1"
                                    >
                                        <span>
                                            Latest{' '}
                                            {this.state.data.txIds.length} Bids
                                            Are Loaded
                                        </span>
                                        {/*<i*/}
                                        {/*    onClick={() => {*/}
                                        {/*        this.setState({*/}
                                        {/*            loading: true,*/}
                                        {/*        });*/}
                                        {/*        this.loadBids(*/}
                                        {/*            this.state.nextTx,*/}
                                        {/*            maxLoad*/}
                                        {/*        );*/}
                                        {/*    }}*/}
                                        {/*    style={{*/}
                                        {/*        fontSize: '1.5rem',*/}
                                        {/*        marginLeft: '5px',*/}
                                        {/*    }}*/}
                                        {/*    className="pe-7s-plus icon-gradient bg-night-sky"*/}
                                        {/*/>*/}
                                    </div>
                                </div>
                            )}
                            {!this.state.remains && (
                                <span>
                                    {this.state.data.txIds.length === 1 && (
                                        <span>All Bids Are Loaded</span>
                                    )}
                                    {this.state.data.txIds.length > 1 && (
                                        <span>
                                            All {this.state.data.txIds.length}{' '}
                                            Bids Are Loaded
                                        </span>
                                    )}
                                </span>
                            )}
                            <br/>
                            <Row>
                                <SyncLoader
                                    css={override}
                                    size={8}
                                    color={'#0086d3'}
                                    loading={this.state.loading}
                                />
                            </Row>
                        </div>
                    </ResponsiveContainer>
                </ModalBody>
            </Modal>
        );
    }
}

export default BidHistory;
