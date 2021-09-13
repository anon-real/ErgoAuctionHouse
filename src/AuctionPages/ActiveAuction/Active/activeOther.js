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
import {friendlyAddress, friendlyToken, getAddrUrl, isWalletSaved, showMsg,} from '../../../auction/helpers';
import {ResponsiveContainer} from 'recharts';
import SyncLoader from 'react-spinners/SyncLoader';
import ReactTooltip from 'react-tooltip';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleUp, faEllipsisH, faEllipsisV} from '@fortawesome/free-solid-svg-icons';
import {css} from '@emotion/core';
import PlaceBidModal from './placeBid';
import MyBidsModal from './myBids';
import BidHistory from './bidHistory';
import {Button, Row} from 'react-bootstrap';
import ArtworkDetails from '../../artworkDetails';
import {Link} from "react-router-dom";
import {longToCurrency} from "../../../auction/serializer";
import {bidHelper} from "../../../auction/newBidAssm";
import FooterSection from "../../footerSection";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class ActiveOther extends React.Component {
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

                        <div className="d-inline-flex">
                            <span className="widget-numbers">
                                {this.props.box.value / 1e9} ERG
                            </span>
                        </div>
                        <div className="widget-chart-wrapper chart-wrapper-relative justify justify-content-lg-start">
                            <div
                                onClick={() => {
                                    this.setState({infoModal: true})
                                }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflowY: 'hidden',
                                    overflowX: 'hidden',
                                    fontSize: '12px',
                                }}
                                className="widget-subheading m-1"
                            >
                                <span
                                    data-tip={this.props.box.assets[0].tokenId}
                                >
                                    {friendlyToken(this.props.box.assets[0], true, 8)}
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
                                    {friendlyAddress(this.props.box.seller, 8)}
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
                                    {friendlyAddress(this.props.box.bidder, 8)}
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
                                onClick={() => {
                                    this.setState({infoModal: true})
                                }}
                                style={{
                                    flex: 1,
                                    cursor: 'pointer',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100px',
                                    overflowY: 'hidden',
                                    overflowX: 'hidden',
                                    fontSize: '12px',
                                }}
                            >
                                <p className="text-primary mr-2 ml-2">
                                    {this.props.box.description}

                                    <Link
                                        to={'/auction/active?type=other&artist=' + this.props.box.artist}
                                    >
                                        <b
                                        >
                                            {' '}- By {friendlyAddress(this.props.box.artist, 4)}
                                        </b></Link>
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
                    <FooterSection box={this.props.box} loading={(val) => this.setState({loading: val})} assemblerModal={this.props.assemblerModal} openBid={this.openBid}/>
                </div>
            </Col>
        );
    }
}
