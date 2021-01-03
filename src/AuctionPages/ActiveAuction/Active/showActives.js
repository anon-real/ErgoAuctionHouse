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
import ActiveBox from './activeBox';
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

    render() {
        const listItems = this.state.auctions.map((box) => {
            return (
                <ActiveBox
                    box={box}
                    assemblerModal={this.toggleAssemblerModal}
                />
            );
        });
        return (
            <Fragment>
                <Modal
                    isOpen={this.state.assemblerModal}
                    backdrop="static"
                    toggle={this.toggleAssemblerModal}
                    className={this.props.className}
                >
                    <ModalHeader>
                        <span className="fsize-1 text-muted">
                            Click on the amount and the address to copy them!
                        </span>
                    </ModalHeader>
                    <ModalBody>
                        <Container>
                            <p>
                                Send{' '}
                                <Clipboard
                                    component="b"
                                    data-clipboard-text={
                                        (this.state.bidAmount + auctionFee) /
                                        1e9
                                    }
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    exactly{' '}
                                    {(this.state.bidAmount + auctionFee) / 1e9}{' '}
                                    erg
                                </Clipboard>{' '}
                                {this.state.isAuction && <span>and the <b>token</b> you want to auction</span>}{' '}
                                to{' '}
                                <Clipboard
                                    component="b"
                                    data-clipboard-text={this.state.bidAddress}
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    {friendlyAddress(this.state.bidAddress)}
                                </Clipboard>
                                <b
                                    onClick={() =>
                                        this.copyToClipboard(
                                            this.state.bidAddress
                                        )
                                    }
                                ></b>
                                {!this.state.isAuction ?
                                    <p>
                                        You have a limited time to do that, your bid will be placed automatically
                                        afterward.
                                    </p> : <p>
                                        You have a limited time to do that, your auction will be started automatically
                                        afterward.
                                    </p>}
                            </p>
                            <p>
                                Your funds will be safe, find out more about how{' '}
                                <a
                                    target="_blank"
                                    href="https://www.ergoforum.org/t/some-details-about-ergo-auction-house/428/6"
                                >
                                    here.
                                </a>
                            </p>
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="ml-3 mr-3 btn-transition"
                            color="secondary"
                            onClick={this.toggleAssemblerModal}
                        >
                            OK
                        </Button>
                    </ModalFooter>
                </Modal>

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
