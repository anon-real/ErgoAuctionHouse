import React from 'react';
import { Button, CardFooter, Col, Progress } from 'reactstrap';
import {
    friendlyAddress,
    friendlyToken,
    getAddrUrl,
    getTxUrl,
    isWalletSaved,
    showMsg,
} from '../../../auction/helpers';
import { ResponsiveContainer } from 'recharts';
import SyncLoader from 'react-spinners/SyncLoader';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { css } from '@emotion/core';
import { getSpendingTx } from '../../../auction/explorer';

const override = css`
    display: block;
    margin: 0 auto;
`;

export default class HistoryBox extends React.Component {
    showIssuingTx(box) {
        box.loader = true;
        this.forceUpdate();
        getSpendingTx(box.assets[0].tokenId)
            .then((res) => {
                this.showTx(res)
            })
            .finally(() => {
                box.loader = false;
                this.forceUpdate();
            });
    }

    showTx(txId) {
        window.open(getTxUrl(txId), '_blank');
    }

    showAddress(addr) {
        window.open(getAddrUrl(addr), '_blank');
    }

    render() {
        return (
            <Col key={this.props.box.id} md="6">
                <div className="card mb-3 widget-chart">
                        <div className="widget-chart-content">
                        <ResponsiveContainer height={20}>
                            <SyncLoader
                                css={override}
                                size={8}
                                color={'#0b473e'}
                                loading={this.props.box.loader}
                            />
                        </ResponsiveContainer>

                        <div className="widget-numbers">
                            {this.props.box.value / 1e9} ERG
                        </div>
                        <div className="widget-chart-wrapper chart-wrapper-relative justify justify-content-lg-start">
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                                className="widget-subheading m-1"
                            >
                                <span
                                    data-tip={this.props.box.assets[0].tokenId}
                                >
                                    {friendlyToken(this.props.box.assets[0])}
                                </span>
                                <i
                                    onClick={() =>
                                        this.showIssuingTx(this.props.box)
                                    }
                                    data-tip="see issuing transaction"
                                    style={{
                                        fontSize: '1.5rem',
                                        marginLeft: '5px',
                                    }}
                                    className="pe-7s-help1 icon-gradient bg-night-sky"
                                />
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                                className="widget-subheading m-1"
                            >
                                <span data-tip={this.props.box.seller}>
                                    Seller{' '}
                                    {friendlyAddress(this.props.box.seller)}
                                </span>
                                <i
                                    onClick={() =>
                                        this.showAddress(this.props.box.seller)
                                    }
                                    data-tip="see seller's address"
                                    style={{
                                        fontSize: '1.5rem',
                                        marginLeft: '5px',
                                    }}
                                    className="pe-7s-help1 icon-gradient bg-night-sky"
                                />
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                                className="widget-subheading m-1"
                            >
                                <span data-tip={this.props.box.bidder}>
                                    Winner{' '}
                                    {friendlyAddress(this.props.box.bidder)}
                                </span>
                                <i
                                    onClick={() =>
                                        this.showAddress(this.props.box.bidder)
                                    }
                                    data-tip="see current bidder's address"
                                    style={{
                                        fontSize: '1.5rem',
                                        marginLeft: '5px',
                                    }}
                                    className="pe-7s-help1 icon-gradient bg-night-sky"
                                />
                            </div>
                        </div>
                        <ReactTooltip effect="solid" place="bottom" />

                        <div className="widget-chart-wrapper chart-wrapper-relative">
                            <div
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '50px',
                                    overflow: 'scroll',
                                }}
                            >
                                <p className="text-primary">
                                    {this.props.box.description}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="widget-chart-wrapper chart-wrapper-relative">
                        <Button
                            onClick={() => this.showTx(this.props.box.finalTx)}
                            outline
                            className="btn-outline-light m-2 border-0"
                            color="primary"
                        >
                            <i className="nav-link-icon lnr-exit-up"> </i>
                            <span>Final Transaction</span>
                        </Button>
                    </div>
                    <CardFooter>
                        <Col className="widget-description">
                            Up by
                            <span className="text-success pl-1 pr-1">
                                <FontAwesomeIcon icon={faAngleUp} />
                                <span className="pl-1">
                                    {this.props.box.increase}%
                                </span>
                            </span>
                            in comparision to the initial bid
                        </Col>
                    </CardFooter>
                </div>
            </Col>
        );
    }
}
