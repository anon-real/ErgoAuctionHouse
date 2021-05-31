import React, {Fragment, useRef} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {
    auctionFee,
    currentHeight,
    getAllActiveAuctions,
} from '../../../auction/explorer';
import {
    friendlyAddress,
    getWalletAddress,
    isWalletNode, isWalletSaved,
    showMsg,
} from '../../../auction/helpers';
import Clipboard from 'react-clipboard.js';
import {css} from '@emotion/core';
import PropagateLoader from 'react-spinners/PropagateLoader';
import SyncLoader from 'react-spinners/SyncLoader';
import {
    Button,
    Col,
    Container, DropdownItem, DropdownMenu, DropdownToggle,
    Form,
    FormFeedback,
    FormGroup,
    FormText,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row, UncontrolledButtonDropdown,
} from 'reactstrap';
import cx from 'classnames';
import TitleComponent2 from '../../../Layout/AppMain/PageTitleExamples/Variation2';
import {
    auctionTxRequest,
    getAssets,
    withdrawFinishedAuctions,
} from '../../../auction/nodeWallet';
import number from 'd3-scale/src/number';
import ActivePicture from './activePicture';
import {
    decodeBoxes,
    ergToNano,
    isFloat,
    isNatural,
} from '../../../auction/serializer';
import {assembleFinishedAuctions} from '../../../auction/assembler';
import NewAuction from "./newAuction";
import NewAuctionAssembler from "./newAuctionAssembler";
import PlaceBidModal from "./placeBid";
import ShowAuctions from "./showActives";
import SendModal from "./sendModal";
import {faDollarSign} from "@fortawesome/free-solid-svg-icons";
import {ResponsiveContainer} from "recharts";

const override = css`
  display: block;
  margin: 0 auto;
`;

const sortKeyToVal = {
    '0': 'Lowest remaining time',
    '1': 'Highest remaining time',
    '2': 'Highest price',
    '3': 'Lowest price',
    '4': 'Latest bids',
    '5': 'Me As Seller First',
    '6': 'Me As Bidder First',
}

const limit = 9

export default class ActiveAuctions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            auctions: [],
            sortKey: '0',
            end: limit
        };
        this.refreshInfo = this.refreshInfo.bind(this);
        this.openAuction = this.openAuction.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.sortAuctions = this.sortAuctions.bind(this);
        this.toggleAssemblerModal = this.toggleAssemblerModal.bind(this);
        this.trackScrolling = this.trackScrolling.bind(this);
    }

    toggleModal() {
        if (isWalletNode()) {
            this.setState({
                modal: !this.state.modal,
            });
        } else {
            this.setState({
                modalAssembler: !this.state.modalAssembler,
            });
        }
    }

    toggleAssemblerModal(address = '', bid = 0, isAuction = false) {
        this.setState({
            assemblerModal: !this.state.assemblerModal,
            bidAddress: address,
            bidAmount: bid,
            isAuction: isAuction
        });
    }

    openAuction() {
        if (!isWalletSaved()) {
            showMsg(
                'In order to create a new auction, configure a wallet first.',
                true
            );
        } else {
            this.toggleModal();
        }
    }
    
    isBottom(el) {
        return el.getBoundingClientRect().bottom <= window.innerHeight+1600; // bottom reached
    }

    trackScrolling = () => {
        if(!this.state.loading && this.state.auctions.length >= this.state.end && document.getElementsByClassName('page-list-container') !== undefined){
            const wrappedElement = document.getElementsByClassName('page-list-container')[0]
            if (this.isBottom(wrappedElement)) { 
                this.setState({end: this.state.end + limit})
            }
        }
    };

    componentDidMount() {
        let type = 'picture'
        try {
            type = (this.props.location.search.split('=')[1]) ? this.props.location.search.split('=')[1] : 'picture'
        } catch (e) {
        }
        this.refreshInfo(true, true, type);
        this.refreshTimer = setInterval(this.refreshInfo, 5000);
        document.addEventListener('scroll', this.trackScrolling); // add event listener
    }

    componentWillReceiveProps(nextProps, nextContext) {
        let type = 'picture'
        try {
            type = nextProps.location.search.split('=')[1]
        } catch (e) {
        }
        if (this.props.location.search !== nextProps.location.search) {
            this.setState({loading: true})
            this.refreshInfo(true, true, type);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling); // removing event listener
        if (this.refreshTimer !== undefined) {
            clearInterval(this.refreshTimer);
        }
    }

    sortAuctions(auctions, key) {
        if (key === '0')
            auctions.sort((a, b) => a.remBlock - b.remBlock)
        else if (key === '1')
            auctions.sort((a, b) => b.remBlock - a.remBlock)
        else if (key === '2')
            auctions.sort((a, b) => b.value - a.value)
        else if (key === '3')
            auctions.sort((a, b) => a.value - b.value)
        else if (key === '4')
            auctions.sort((a, b) => b.creationHeight - a.creationHeight)
        else if (key === '5' && isWalletSaved())
            auctions.sort((a, b) => (b.seller === getWalletAddress()) - (a.seller === getWalletAddress()))
        else if (key === '6' && isWalletSaved())
            auctions.sort((a, b) => (b.bidder === getWalletAddress()) - (a.bidder === getWalletAddress()))
        this.setState({auctions: auctions, sortKey: key})
    }

    refreshInfo(force = false, firstTime = false, type = null) {
        if (type === null)
            type = this.state.type
        if (!force) {
            this.setState({lastUpdated: this.state.lastUpdated + 5});
            if (this.state.lastUpdated < 40) return;
        }
        this.setState({lastUpdated: 0});
        currentHeight()
            .then((height) => {
                this.setState({currentHeight: height});
                getAllActiveAuctions()
                    .then((boxes) => {
                        decodeBoxes(boxes, height)
                            .then(boxes => {
                                if (type === 'picture') return boxes.filter(box => box.isPicture)
                                if (type === 'audio') return boxes.filter(box => box.isAudio)
                                if (type === 'other') return boxes.filter(box => !box.isArtwork)
                            })
                            .then((boxes) => {
                                this.setState({
                                    loading: false,
                                    type: type
                                });
                                this.sortAuctions(boxes, this.state.sortKey)
                                withdrawFinishedAuctions(boxes);
                                if (firstTime) assembleFinishedAuctions(boxes);
                            })
                            .finally(() => {
                                this.setState({loading: false});
                            });
                    })
                    .catch((_) =>
                        console.log('failed to get boxes from explorer!')
                    );
            })
            .catch((_) => {
                if (force) {
                    showMsg(
                        'Error connecting to the explorer. Will try again...',
                        false,
                        true
                    );
                }
                if (!force) setTimeout(() => this.refreshInfo(true), 4000);
                else setTimeout(() => this.refreshInfo(true), 20000);
            });
    }

    render() {
        return (
            <Fragment>
                <NewAuction
                    isOpen={this.state.modal}
                    close={this.toggleModal}
                />

                <NewAuctionAssembler
                    isOpen={this.state.modalAssembler}
                    close={this.toggleModal}
                    assemblerModal={this.toggleAssemblerModal}
                />

                <SendModal
                    isOpen={this.state.assemblerModal}
                    close={this.toggleAssemblerModal}
                    bidAmount={this.state.bidAmount}
                    isAuction={this.state.isAuction}
                    bidAddress={this.state.bidAddress}
                />

                <div className="app-page-title">
                    <div className="page-title-wrapper">
                        <div className="page-title-heading">
                            <div
                                className={cx('page-title-icon', {
                                    'd-none': false,
                                })}
                            >
                                <i className="pe-7s-volume2 icon-gradient bg-night-fade"/>
                            </div>
                            <div>
                                Active Auctions - {this.state.type}
                                <div
                                    className={cx('page-title-subheading', {
                                        'd-none': false,
                                    })}
                                >
                                    Here you can see current active auctions.
                                    Last updated {this.state.lastUpdated}{' '}
                                    seconds ago.
                                </div>
                                <div
                                    className={cx('page-title-subheading', {
                                        'd-none': false,
                                    })}
                                >
                                    <b>{this.state.auctions.length} active auctions with worth
                                        of {(this.state.auctions.map(auc => auc.value).reduce((a, b) => a + b, 0) / 1e9).toFixed(1)} ERG</b>
                                </div>
                            </div>
                        </div>
                        <div className="page-title-actions">
                            <TitleComponent2/>
                        </div>
                        <Container>
                            <Row>
                                <Col md='8'/>
                                <Col md='4' className='text-right'>
                                    <Button
                                        onClick={this.openAuction}
                                        outline
                                        className="btn-outline-lin m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-plus-circle"> </i>
                                        <span>New Auction</span>
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col md='8'/>
                                <Col md='4' className='text-right'>
                                    <UncontrolledButtonDropdown>
                                        <DropdownToggle caret outline className="mb-2 mr-2 border-0" color="primary">
                                            <i className="nav-link-icon lnr-sort-amount-asc"> </i>
                                            {sortKeyToVal[this.state.sortKey]}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {Object.keys(sortKeyToVal).map(sortKey => <DropdownItem
                                                onClick={() => {
                                                    this.sortAuctions([].concat(this.state.auctions), sortKey)
                                                }}>{sortKeyToVal[sortKey]}</DropdownItem>)}
                                        </DropdownMenu>
                                    </UncontrolledButtonDropdown>
                                </Col>
                            </Row>
                        </Container>

                    </div>
                </div>
                {this.state.loading ? (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <PropagateLoader
                            css={override}
                            size={20}
                            color={'#0b473e'}
                            loading={this.state.loading}
                        />
                    </div>
                ) : (
                    <div className="page-list-container">
                        <ShowAuctions
                            auctions={this.state.auctions.slice(0, this.state.end)}
                        />
                    </div>
                )}
            </Fragment>
        );
    }
}
