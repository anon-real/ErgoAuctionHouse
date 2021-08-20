import React from 'react';
import {
    Button,
    Container,
    FormFeedback,
    FormGroup,
    FormText,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
} from 'reactstrap';
import {
    copyToClipboard,
    friendlyAddress,
    friendlyToken,
    getWalletAddress,
    isWalletNode, isWalletSaved,
    showMsg,
} from '../../../auction/helpers';
import SyncLoader from 'react-spinners/SyncLoader';
import { css } from '@emotion/core';
import { bidTxRequest, getAssets } from '../../../auction/nodeWallet';
import { auctionFee, currentHeight } from '../../../auction/explorer';
import { ergToNano, isFloat } from '../../../auction/serializer';
import {getBidP2s, registerBid} from "../../../auction/bidAssembler";

const override = css`
    display: block;
    margin: 0 auto;
`;

export default class PlaceBidModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalLoading: false,
            assemblerModal: false,
            copied: false,
            bidAmount: ((props.box.value + props.box.minStep) / 1e9).toString(),
        };
        this.updateAssets = this.updateAssets.bind(this);
        this.placeBid = this.placeBid.bind(this);
    }

    updateAssets() {
        this.setState({ modalLoading: true });
        return getAssets()
            .then((res) => {
                this.setState({ ergBalance: res.balance });
            })
            .catch((_) => {
                showMsg('Could not get balance from wallet!', true);
            })
            .finally(() => {
                this.setState({ modalLoading: false });
            });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.isOpen === true && this.props.isOpen === false) {
            if (isWalletNode()) this.updateAssets();
            this.setState({copied: false})
            if (this.state.bidAddress !== undefined) this.setState({assemblerModal: true})
        }
    }

    placeBid() {
        if (!isWalletSaved()) {
            showMsg(
                `Please configure the wallet first!`,
                true
            );
            return;
        }
        if (
            isWalletNode() &&
            ergToNano(this.state.bidAmount) + auctionFee > this.state.ergBalance
        ) {
            showMsg(
                `Not enough balance to place ${this.state.bidAmount} ERG bid.`,
                true
            );
            return;
        }
        this.setState({ modalLoading: true });
        currentHeight()
            .then((height) => {
                if (isWalletNode()) {
                    let res = bidTxRequest(
                        this.props.box,
                        ergToNano(this.state.bidAmount),
                        height
                    );
                    res.then((_) => {
                        showMsg(
                            'Your bid transaction was generated successfully. If you keep the app open, you will be notified about any status!'
                        );
                        this.props.close();
                    })
                        .catch((nodeRes) => {
                            showMsg(
                                'Could not generate bid transaction. Potentially your wallet is locked.',
                                true
                            );
                        })
                        .finally((_) => this.setState({ modalLoading: false }));
                } else {
                    getBidP2s(ergToNano(this.state.bidAmount), this.props.box)
                        .then((addr) => {
                            registerBid(
                                height,
                                ergToNano(this.state.bidAmount),
                                this.props.box,
                                addr.address
                            )
                                .then((r) => {
                                    if (r.id !== undefined) {
                                        this.props.close()
                                        this.props.assemblerModal(addr.address, ergToNano(this.state.bidAmount))
                                    } else {
                                        showMsg(
                                            'Could not contact the assembler service.',
                                            true
                                        );
                                    }
                                })
                                .catch((_) => {
                                    showMsg(
                                        'Could not contact the assembler service.',
                                        true
                                    );
                                })
                                .finally((_) =>
                                    this.setState({ modalLoading: false })
                                );
                        })
                        .catch((_) => {
                            showMsg(
                                'Could not contact the assembler service.',
                                true
                            );
                            this.setState({ modalLoading: false });
                        });
                }
            })
            .catch(() =>
                showMsg(
                    'Could not get height from the explorer, try again!',
                    true
                )
            );
    }

    render() {
        return (
            <span>
                <Modal
                    isOpen={this.props.isOpen}
                    toggle={this.props.close}
                    className={this.props.className}
                >
                    <ModalHeader toggle={this.props.close}>
                        <span className="fsize-1 text-muted">
                            New bid for{' '}
                            {friendlyToken(this.props.box.assets[0], false, 5)}
                        </span>
                    </ModalHeader>
                    <ModalBody>
                        <Container>
                            <Row>
                                <SyncLoader
                                    css={override}
                                    size={8}
                                    color={'#0b473e'}
                                    loading={this.state.modalLoading}
                                />
                            </Row>

                            <FormGroup>
                                <InputGroup>
                                    <Input
                                        type="number"
                                        value={this.state.bidAmount}
                                        invalid={
                                            ergToNano(this.state.bidAmount) <
                                            this.props.box.value +
                                                this.props.box.minStep
                                        }
                                        onChange={(e) => {
                                            if (isFloat(e.target.value)) {
                                                this.setState({
                                                    bidAmount: e.target.value,
                                                });
                                            }
                                        }}
                                        id="bidAmount"
                                    />
                                    <InputGroupAddon addonType="append">
                                        <InputGroupText>ERG</InputGroupText>
                                    </InputGroupAddon>
                                    <FormFeedback invalid>
                                        Minimum bid value for this auction is{' '}
                                        {(this.props.box.value +
                                            this.props.box.minStep) /
                                            1e9}{' '}
                                        ERG
                                    </FormFeedback>
                                </InputGroup>
                                <FormText>Specify your bid amount.</FormText>
                            </FormGroup>
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="ml mr-2 btn-transition"
                            color="secondary"
                            onClick={this.props.close}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            disabled={
                                ergToNano(this.state.bidAmount) <
                                    this.props.box.value +
                                        this.props.box.minStep ||
                                this.state.modalLoading
                            }
                            onClick={this.placeBid}
                        >
                            Place Bid
                        </Button>
                    </ModalFooter>
                </Modal>

            </span>
        );
    }
}
