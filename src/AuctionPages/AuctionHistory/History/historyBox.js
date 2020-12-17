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
import MyBidsModal from "../../ActiveAuction/Active/myBids";
import BidHistory from "../../ActiveAuction/Active/bidHistory";
import ArtworkDetails from "../../artworkDetails";

const override = css`
    display: block;
    margin: 0 auto;
`;

export default class HistoryBox extends React.Component {
    constructor() {
        super();
        this.state = {
            myBidsModal: false,
            detailsModal: false
        };
        this.openMyBids = this.openMyBids.bind(this)
        this.openDetails = this.openDetails.bind(this)
    }

    showIssuingTx(box) {
        box.loader = true;
        this.forceUpdate();
        getSpendingTx(box.assets[0].tokenId)
            .then((res) => {
                this.showTx(res);
            })
            .finally(() => {
                box.loader = false;
                this.forceUpdate();
            });
    }

    openMyBids() {
        this.setState({ myBidsModal: !this.state.myBidsModal });
    }

    showTx(txId) {
        window.open(getTxUrl(txId), '_blank');
    }

    showAddress(addr) {
        window.open(getAddrUrl(addr), '_blank');
    }

    openDetails() {
        this.setState({ detailsModal: !this.state.detailsModal });
    }

    render() {
        return (
            <Col key={this.props.box.id} md="6">
                <MyBidsModal
                    isOpen={this.state.myBidsModal}
                    box={this.props.box}
                    close={this.openMyBids}
                    highText='winner'
                />
                <BidHistory close={this.openDetails} box={this.props.box} isOpen={this.state.detailsModal} />
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

                        <div className="d-inline-flex">
                            <span className="widget-numbers">
                                {this.props.box.value / 1e9} ERG
                            </span>
                            {this.props.box.isArtwork && <span
                                onClick={() => this.setState({artDetail: true})}
                                data-tip="Artwork NFT Detail"
                                className="icon-wrapper rounded-circle opacity-7 m-2 font-icon-wrapper">
                                <i className="lnr-picture icon-gradient bg-plum-plate fsize-4"/>
                                <ArtworkDetails
                                    isOpen={this.state.artDetail}
                                    close={() => this.setState({artDetail: !this.state.artDetail})}
                                    tokenId={this.props.box.assets[0].tokenId}
                                    tokenName={this.props.box.tokenName}
                                    tokenDescription={this.props.box.tokenDescription}
                                    artHash={this.props.box.artHash}
                                />
                            </span>}
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
                                    data-tip="see winner's address"
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
                                    height: '60px',
                                    overflowY: 'hidden',
                                    overflowX: 'hidden'
                                }}
                            >
                                <p className="text-primary mr-2 ml-2">
                                    {this.props.box.description}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="widget-chart-wrapper chart-wrapper-relative">
                        <Button
                            onClick={() => this.openMyBids()}
                            outline
                            className="btn-outline-light m-2 border-0"
                            color="primary"
                        >
                            <i className="nav-link-icon lnr-layers"> </i>
                            <span>My Bids</span>
                        </Button>
                        <Button
                            onClick={() => this.showTx(this.props.box.finalTx)}
                            outline
                            className="btn-outline-light m-2 border-0"
                            color="primary"
                        >
                            <i className="nav-link-icon lnr-exit-up"> </i>
                            <span>Final Transaction</span>
                        </Button>
                        <Button
                            onClick={() => {
                                this.setState({ detailsModal: true });
                            }}
                            outline
                            className="btn-outline-light m-2 border-0"
                            color="primary"
                        >
                            <i className="nav-link-icon lnr-chart-bars"> </i>
                            <span>Details</span>
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
