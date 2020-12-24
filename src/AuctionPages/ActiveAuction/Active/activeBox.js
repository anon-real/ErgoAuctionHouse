import React from 'react';
import {Button, CardFooter, Col, Progress} from 'reactstrap';
import {
    friendlyAddress,
    friendlyToken,
    getAddrUrl,
    getTxUrl, getWalletAddress,
    isWalletSaved,
    showMsg,
} from '../../../auction/helpers';
import {ResponsiveContainer} from 'recharts';
import SyncLoader from 'react-spinners/SyncLoader';
import ReactTooltip from 'react-tooltip';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleUp} from '@fortawesome/free-solid-svg-icons';
import {css} from '@emotion/core';
import {auctionWithExtensionTree, getSpendingTx} from '../../../auction/explorer';
import PlaceBidModal from './placeBid';
import MyBidsModal from './myBids';
import BidHistory from './bidHistory';
import {Row} from "react-bootstrap";
import ArtworkDetails from "../../artworkDetails";

const override = css`
    display: block;
    margin: 0 auto;
`;

export default class ActiveBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bidModal: false,
            myBidsModal: false,
            detailsModal: false,
        };
        this.openBid = this.openBid.bind(this);
        this.openMyBids = this.openMyBids.bind(this);
        this.openDetails = this.openDetails.bind(this);
    }

    openDetails() {
        this.setState({detailsModal: !this.state.detailsModal});
    }

    openBid() {
        if (this.state.bidModal) {
            this.setState({bidModal: !this.state.bidModal});
            return;
        }
        if (!isWalletSaved()) {
            showMsg(
                'In order to place bids, you have to configure the wallet first.',
                true
            );
        } else if (this.props.box.remBlock <= 0) {
            showMsg(
                'This auction is finished! It is pending for withdrawal; If you configure your wallet, the app can use it to withdraw finished auctions.',
                true
            );
        } else {
            this.setState({bidModal: !this.state.bidModal});
        }
    }

    openMyBids() {
        this.setState({myBidsModal: !this.state.myBidsModal});
    }

    showIssuingTx(box) {
        box.loader = true;
        this.forceUpdate();
        getSpendingTx(box.assets[0].tokenId)
            .then((res) => {
                window.open(getTxUrl(res), '_blank');
            })
            .finally(() => {
                box.loader = false;
                this.forceUpdate();
            });
    }

    showAddress(addr) {
        window.open(getAddrUrl(addr), '_blank');
    }

    render() {
        let box = this.props.box;
        return (
            <Col key={box.id} md="6">
                <PlaceBidModal
                    isOpen={this.state.bidModal}
                    box={this.props.box}
                    close={this.openBid}
                    assemblerModal={this.props.assemblerModal}
                />
                <MyBidsModal
                    isOpen={this.state.myBidsModal}
                    box={this.props.box}
                    close={this.openMyBids}
                    highText="current active bid"
                />
                <BidHistory close={this.openDetails} box={this.props.box} isOpen={this.state.detailsModal}/>
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
                                data-tip="Artwork NFT"
                                className="icon-wrapper rounded-circle opacity-7 m-2 font-icon-wrapper">
                                <i className="lnr-picture icon-gradient bg-plum-plate fsize-4"/>
                                <ArtworkDetails
                                    isOpen={this.state.artDetail}
                                    close={() => this.setState({artDetail: !this.state.artDetail})}
                                    tokenId={this.props.box.assets[0].tokenId}
                                    tokenName={this.props.box.tokenName}
                                    tokenDescription={this.props.box.tokenDescription}
                                    artHash={this.props.box.artHash}
                                    artworkUrl={this.props.box.artworkUrl}
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
                                    Bidder{' '}
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
                        <ReactTooltip effect="solid" place="bottom"/>

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
                            onClick={() => this.openBid()}
                            outline
                            className="btn-outline-light m-2 border-0"
                            color="primary"
                        >
                            <i className="nav-link-icon lnr-pencil"> </i>
                            <span>Place Bid</span>
                        </Button>
                        <Button
                            onClick={() => {
                                this.setState({detailsModal: true});
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
                        <Col md={6} className="widget-description">
                            Up by
                            <span className="text-success pl-1 pr-1">
                                <FontAwesomeIcon icon={faAngleUp}/>
                                <span className="pl-1">
                                    {this.props.box.increase}%
                                </span>
                            </span>
                            since the initial bid
                        </Col>

                        <Col md={6} className="justify-content-end ml-3">
                            <div className="widget-content">
                                <div className="widget-content-outer">
                                    <div className="widget-content-wrapper">
                                        <div className="widget-content-left mr-3">
                                            <div className="widget-numbers fsize-2 text-muted">
                                                {this.props.box.remBlock}
                                            </div>
                                        </div>
                                        <div className="widget-content-right">
                                            <div
                                                data-tip={this.props.box.ergoTree === auctionWithExtensionTree ?
                                                    "Auto Extend Enabled" : ""}
                                                className="text-muted opacity-6">
                                                Blocks Remaining
                                            </div>
                                        </div>
                                    </div>
                                    <div className="widget-progress-wrapper">
                                        <Progress
                                            className="progress-bar-xs progress-bar-animated-alt"
                                            value={this.props.box.doneBlock}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </CardFooter>
                </div>
            </Col>
        );
    }
}
