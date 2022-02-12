import React from 'react';
import {Col, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink, Row, UncontrolledButtonDropdown,} from 'reactstrap';
import {friendlyAddress, getAddrUrl, isWalletSaved, showMsg,} from '../../../auction/helpers';
import {ResponsiveContainer} from 'recharts';
import SyncLoader from 'react-spinners/SyncLoader';
import ReactTooltip from 'react-tooltip';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEllipsisH} from '@fortawesome/free-solid-svg-icons';
import {css} from '@emotion/core';
import PlaceBidModal from './placeBid';
import MyBidsModal from './myBids';
import BidHistory from './bidHistory';
import FooterSection from "../../footerSection";
import 'react-h5-audio-player/lib/styles.css';
import ArtworkMedia from "../../artworkMedia";
import {textStyle} from "../../../assets/reactCss";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class ActiveAuction extends React.Component {
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
        console.log(box);
        return (
            <Col key={box.id} xs="12" md="6" lg="6" xl="4">
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
                <div className="card mb-3 bg-white widget-chart" style={
                    {
                        'opacity': this.props.box.isFinished || this.state.loading ? 0.6 : 1
                    }
                }>

                    <Row style={{marginTop: 8}}>
                        <Col className="text-truncate">
                            <b data-tip={this.props.box.tokenName}>{this.props.box.tokenName}</b>
                        </Col>

                        {(this.props.box.royalty > 0 || this.props.box.totalIssued > 1) &&
                        <Col className="text-truncate">
                            {this.props.box.royalty > 0 &&
                            <i data-tip={`Includes ${this.props.box.royalty * 100}% royalty on secondary sales`} style={{fontSize: '12px'}}
                               className="font-weight-light">{`${this.props.box.royalty * 100}% royalty`}</i>}
                            {this.props.box.totalIssued > 1 &&
                            <i data-tip={`This is a Fungible Token with total issuance of ${this.props.box.totalIssued}`}
                               style={{fontSize: '12px'}}
                               className="font-weight-light">{` - ${this.props.box.token.amount} out of ${this.props.box.totalIssued}`}</i>}</Col>
                        }

                    </Row>

                    <div className="widget-chart-actions">
                        <UncontrolledButtonDropdown direction="left">
                            <DropdownToggle color="link">
                                <FontAwesomeIcon icon={faEllipsisH}/>
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
                                                    // this.props.box.boxId
                                                (this.props.box.stableId? this.props.box.stableId : this.props.box.boxId)
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
                        <ResponsiveContainer height={10}>
                            <SyncLoader
                                css={override}
                                size={8}
                                color={'#0086d3'}
                                loading={this.state.loading}
                            />
                        </ResponsiveContainer>
                        <ReactTooltip effect="solid" place="bottom"/>
                        <ArtworkMedia preload={this.props.preload} box={this.props.box}/>

                        <div className="widget-chart-wrapper chart-wrapper-relative">
                            <div
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflowY: 'hidden',
                                    overflowX: 'hidden',
                                    fontSize: '12px',
                                }}
                            >
                                <p className="text-primary mr-2 ml-2">
                                    <div style={textStyle}>{this.props.box.description}</div>
                                    <b
                                        style={{cursor: "pointer"}}
                                        onClick={() => this.props.updateParams('artist', this.props.box.artist)}
                                    >
                                        {' '}- By {friendlyAddress(this.props.box.artist, 5)}
                                    </b>
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
                                {friendlyAddress(this.props.box.seller, 5)}
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
                                {friendlyAddress(this.props.box.bidder, 5)}
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
                    <FooterSection box={this.props.box} loading={(val) => this.setState({loading: val})}
                                   assemblerModal={this.props.assemblerModal} openBid={this.openBid}/>

                </div>
            </Col>
        );
    }
}
