import React from 'react';
import {
    ButtonGroup,
    CardFooter,
    Col,
    DropdownMenu,
    DropdownToggle,
    Nav,
    NavItem,
    NavLink,
    Progress,
    UncontrolledButtonDropdown,
} from 'reactstrap';
import {friendlyAddress, getAddrUrl, isWalletSaved, showMsg,} from '../../../auction/helpers';
import {ResponsiveContainer} from 'recharts';
import SyncLoader from 'react-spinners/SyncLoader';
import ReactTooltip from 'react-tooltip';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleUp, faEllipsisH, faEllipsisV} from '@fortawesome/free-solid-svg-icons';
import {css} from '@emotion/core';
import PlaceBidModal from './placeBid';
import MyBidsModal from './myBids';
import BidHistory from './bidHistory';
import {Row} from 'react-bootstrap';
import ArtworkDetails from '../../artworkDetails';
import {Link} from "react-router-dom";
import {longToCurrency} from "../../../auction/serializer";
import {bidHelper} from "../../../auction/newBidAssm";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class ActiveAudio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
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
        } else if (this.props.box.remTime <= 0) {
            showMsg(
                'This auction is finished!',
                true
            );
        } else {
            this.setState({bidModal: !this.state.bidModal});
        }
    }

    openMyBids() {
        this.setState({myBidsModal: !this.state.myBidsModal});
    }

    showAddress(addr) {
        window.open(getAddrUrl(addr), '_blank');
    }

    render() {
        let box = this.props.box;
        return (
            <Col key={box.id} lg="6" xl="4" md="6">
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
                <BidHistory
                    close={this.openDetails}
                    box={this.props.box}
                    isOpen={this.state.detailsModal}
                />
                <ArtworkDetails
                    isOpen={this.state.infoModal}
                    close={() =>
                        this.setState({
                            infoModal: !this.state.infoModal,
                        })
                    }
                    tokenId={this.props.box.assets[0].tokenId}
                    tokenName={this.props.box.tokenName}
                    tokenDescription={
                        this.props.box.tokenDescription
                    }
                    artist={this.props.box.artist}
                    artHash={this.props.box.artHash}
                />
                <div className="card mb-3 bg-white widget-chart" style={
                    {
                        'opacity': this.props.box.isFinished ? 0.6 : 1
                    }
                }>

                    <b class="fsize-1 text-truncate" style={{marginTop: 8}}>{this.props.box.tokenName}</b>

                    <div className="widget-chart-actions">
                        <UncontrolledButtonDropdown direction="left">
                            <DropdownToggle color="link">
                                <FontAwesomeIcon icon={faEllipsisV}/>
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-md-left">
                                <Nav vertical>
                                    <NavItem className="nav-item-header">
                                        General
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            href={
                                                '#/auction/specific/' +
                                                this.props.box.boxId
                                            }
                                        >
                                            Link to Auction
                                        </NavLink>
                                        <NavLink
                                            onClick={() => this.openMyBids()}
                                        >
                                            My Bids
                                        </NavLink>
                                        <NavLink
                                            onClick={() =>
                                                this.setState({
                                                    detailsModal: true,
                                                })
                                            }
                                        >
                                            Details
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </div>

                    <div className="widget-chart-content">
                        <ResponsiveContainer height={20}>
                            <SyncLoader
                                css={override}
                                size={8}
                                color={'#0086d3'}
                                loading={this.state.loading}
                            />
                        </ResponsiveContainer>

                        <div style={{cursor: 'pointer'}}>
                            <audio controls="controls" preload='none'>
                                <source src={box.artworkUrl}/>
                            </audio>


                        </div>
                        <ReactTooltip effect="solid" place="bottom"/>

                        <div className="widget-chart-wrapper chart-wrapper-relative">
                            <div
                                onClick={() => {
                                    this.setState({infoModal: true})
                                }}
                                style={{
                                    flex: 1,
                                    cursor: 'pointer',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflowY: 'hidden',
                                    overflowX: 'hidden',
                                    fontSize: '12px',
                                }}
                            >
                                <p className="text-primary mr-2 ml-2">
                                    {this.props.box.description}

                                    <Link
                                        to={'/auction/active?type=audio&artist=' + this.props.box.artist}
                                    >
                                        <b
                                        >
                                            {' '}- By {friendlyAddress(this.props.box.artist, 4)}
                                        </b></Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='mb-2'>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                fontSize: '13px'
                            }}
                            className="widget-subheading m-1"
                        >
                            <span data-tip={this.props.box.seller}>
                                Seller{' '}
                                {friendlyAddress(this.props.box.seller, 9)}
                            </span>
                            <i
                                onClick={() =>
                                    this.showAddress(this.props.box.seller)
                                }
                                data-tip="see seller's address"
                                style={{
                                    fontSize: '1rem',
                                    marginLeft: '5px',
                                }}
                                className="pe-7s-help1 icon-gradient bg-night-sky"
                            />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                fontSize: '13px'
                            }}
                            className="widget-subheading m-1"
                        >
                            <span data-tip={this.props.box.bidder}>
                                Bidder{' '}
                                {friendlyAddress(this.props.box.bidder, 9)}
                            </span>
                            <i
                                onClick={() =>
                                    this.showAddress(this.props.box.bidder)
                                }
                                data-tip="see current bidder's address"
                                style={{
                                    fontSize: '1rem',
                                    marginLeft: '5px',
                                }}
                                className="pe-7s-help1 icon-gradient bg-night-sky"
                            />
                        </div>
                    </div>
                    <CardFooter>
                        <Col md={6} className="widget-description">
                            <Row>
                                {this.props.box.curBid >= this.props.box.minBid && <span>
                                    <b className="fsize-1">
                                        {longToCurrency(this.props.box.curBid, -1, this.props.box.currency)}{' '}{this.props.box.currency}
                                    </b>{' '}
                                    <text
                                        style={{fontSize: '10px'}}
                                        className="text-success pl-1 pr-1"
                                    >
                                        {this.props.box.increase}%
                                        <FontAwesomeIcon icon={faAngleUp}/>
                                    </text>
                                </span>}
                                {this.props.box.curBid < this.props.box.minBid && <span>
                                    <i
                                        style={{fontSize: '12px'}}
                                        className="pl-1 pr-1"
                                    >
                                        No bids yet
                                    </i>{' '}
                                </span>}
                            </Row>
                        </Col>

                        <Col md={6} className="justify-content-end ml-3">
                            <div className="widget-content">
                                <div className="widget-content-outer">
                                    <div className="widget-content-wrapper">
                                        {this.props.box.remTime}
                                    </div>
                                    <div className="widget-progress-wrapper">
                                        <Progress
                                            className="progress-bar-xs progress-bar-animated-alt"
                                            value={this.props.box.done}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>


                    </CardFooter>

                    <ButtonGroup style={{'pointerEvents': this.props.box.isFinished ? "none" : null}}>
                        <div className="d-block text-center">
                            <button className="btn-icon btn-icon-only btn btn-outline-primary"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.openBid();
                                    }}>
                                <i className="pe-7s-edit btn-icon-wrapper"> </i>
                            </button>
                        </div>
                        <button type="button" className="btn btn-outline-primary btn-sm"
                                style={{fontSize: 13}}
                                onClick={(e) => {
                                    // e.preventDefault();
                                    // this.openBid();
                                    e.preventDefault();
                                    this.setState({loading: true})
                                    bidHelper(this.props.box.nextBid, this.props.box, this.props.assemblerModal)
                                        .finally(() => this.setState({loading: false}))
                                }}>
                            <text>
                                Place Bid
                            </text>
                            {' '}
                            <text>
                                for{' '}
                                <b>
                                    {longToCurrency(this.props.box.nextBid, -1, this.props.box.currency)}{' '} {this.props.box.currency}
                                </b>
                            </text>
                        </button>
                        {this.props.box.instantAmount !== -1 &&
                        <button type="button" className="btn btn-outline-dark btn-sm"
                                style={{fontSize: 13}}
                                onClick={(e) => {
                                    e.preventDefault();
                                    this.setState({loading: true})
                                    bidHelper(this.props.box.instantAmount, this.props.box, this.props.assemblerModal)
                                        .finally(() => this.setState({loading: false}))
                                }}>
                            <text>
                                Buy
                            </text>
                            {' '}
                            <text>
                                for{' '}
                                <b>
                                    {longToCurrency(this.props.box.instantAmount, -1, this.props.box.currency)}{' '} {this.props.box.currency}
                                </b>
                            </text>
                        </button>}
                    </ButtonGroup>
                </div>
            </Col>
        );
    }
}
