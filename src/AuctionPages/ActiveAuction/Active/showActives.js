import React, {Fragment, useRef} from 'react';

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
    Container,
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
    Row,
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
import SendModal from "./sendModal";
import ActiveAudio from "./activeAudio";
import ActiveOther from "./activeOther";

const override = css`
    display: block;
    margin: 0 auto;
`;

export default class ShowAuctions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lastUpdated: 0,
            modal: false,
            loading: false,
            auctions: props.auctions,
            tooltip: false,
            currentHeight: 0,
            myBids: false,
        };
        this.closeMyBids = this.closeMyBids.bind(this);
        this.toggleAssemblerModal = this.toggleAssemblerModal.bind(this);
    }

    componentDidMount() {
        currentHeight().then((res) => {
            this.setState({height: res});
        });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({auctions: nextProps.auctions})
    }

    closeMyBids() {
        this.setState(this.setState({myBids: false}));
    }

    toggleAssemblerModal(address = '', bid = 0, isAuction = false) {
        this.setState({
            assemblerModal: !this.state.assemblerModal,
            bidAddress: address,
            bidAmount: bid,
            isAuction: isAuction
        });
    }

    render() {
        const listItems = this.state.auctions.map((box) => {
            if (box.isPicture) {
                return (
                    <ActivePicture
                        box={box}
                        assemblerModal={this.toggleAssemblerModal}
                    />
                );
            } else if (box.isAudio) {
                return (
                    <ActiveAudio
                        box={box}
                        assemblerModal={this.toggleAssemblerModal}
                    />
                );
            } else {
                return (
                    <ActiveOther
                        box={box}
                        assemblerModal={this.toggleAssemblerModal}
                    />
                );
            }
        });
        return (
            <Fragment>
                <SendModal
                    isOpen={this.state.assemblerModal}
                    close={this.toggleAssemblerModal}
                    bidAmount={this.state.bidAmount}
                    isAuction={this.state.isAuction}
                    bidAddress={this.state.bidAddress}
                />

                {!this.state.loading && this.state.auctions.length === 0 && (
                    <strong
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        No Active Auctions
                    </strong>
                )}
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
                    <Row>{listItems}</Row>
                )}
            </Fragment>
        );
    }
}
