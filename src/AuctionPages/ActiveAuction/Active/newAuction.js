import React, { Fragment } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Button,
    Col,
    Container, Form, FormFeedback, FormGroup, FormText, Input, InputGroup, InputGroupAddon, InputGroupText, Label,
    Modal,
    ModalBody, ModalFooter,
    ModalHeader,
    Row,
    Tooltip,
} from 'reactstrap';
import {
    friendlyToken,
    getAddrUrl,
    getTxUrl, getWalletAddress,
    showMsg,
} from '../../../auction/helpers';
import SyncLoader from 'react-spinners/SyncLoader';
import { css } from '@emotion/core';
import {allAuctionTrees, auctionFee, boxById, currentHeight, txById} from '../../../auction/explorer';
import moment from 'moment';
import { ResponsiveContainer } from 'recharts';
import PropagateLoader from 'react-spinners/PropagateLoader';
import ReactTooltip from 'react-tooltip';
import {ergToNano, isFloat, isNatural} from "../../../auction/serializer";
import {auctionTxRequest, getAssets} from "../../../auction/nodeWallet";

const override = css`
    display: block;
    margin: 0 auto;
`;

class NewAuction extends React.Component {
    constructor(props) {
        super();
        this.state = {
            tokenId: '',
            assets: {},
            modalLoading: true,
        }
        this.canStartAuction = this.canStartAuction.bind(this);
        this.updateAssets = this.updateAssets.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this.updateAssets()
                .then(() => {
                    let assets = this.state.assets;
                    if (Object.keys(assets).length === 0)
                        showMsg(
                            'Your wallet contains no tokens to auction!',
                            true
                        );
                    else
                        this.setState({
                            tokenId: Object.keys(assets)[0],
                            tokenQuantity: Object.values(assets)[0],
                        });
                })
                .catch(() => {
                    showMsg(
                        'Error getting assets from wallet. Check your wallet accessibility.',
                        true
                    );
                });
        } else if (!this.props.isOpen) {
            this.setState({modalLoading: false, assets: {}});
        }
    }

    updateAssets() {
        this.setState({modalLoading: true});
        return getAssets()
            .then((res) => {
                this.setState({assets: res.assets});
                this.setState({ergBalance: res.balance});
            })
            .finally(() => {
                this.setState({modalLoading: false});
            });
    }


    canStartAuction() {
        return (
            !this.state.modalLoading &&
            this.state.tokenId !== undefined &&
            this.state.tokenId.length > 0 &&
            ergToNano(this.state.initialBid) >= 100000000 &&
            this.state.auctionDuration > 0 &&
            ergToNano(this.state.auctionStep) >= 100000000 &&
            this.state.tokenQuantity > 0
        );
    }

    startAuction() {
        if (
            ergToNano(this.state.initialBid) + auctionFee >
            this.state.ergBalance
        ) {
            showMsg(
                `Not enough balance to initiate auction with ${this.state.initialBid} ERG.`,
                true
            );
            return;
        }
        this.setState({modalLoading: true});
        currentHeight()
            .then((height) => {
                let description = this.state.description;
                if (!description) description = '';
                let res = auctionTxRequest(
                    ergToNano(this.state.initialBid),
                    getWalletAddress(),
                    this.state.tokenId,
                    this.state.tokenQuantity,
                    ergToNano(this.state.auctionStep),
                    height,
                    height + parseInt(this.state.auctionDuration) + 5, // +5 to take into account the time it takes to be mined
                    description,
                    this.state.auctionAutoExtend
                );
                res.then((data) => {
                    showMsg(
                        'Auction transaction was generated successfully. If you keep the app open, you will be notified about any status!'
                    );
                    this.props.close();
                })
                    .catch((nodeRes) => {
                        showMsg(
                            'Could not generate auction transaction. Potentially your wallet is locked.',
                            true
                        );
                    })
                    .finally((_) => this.setState({modalLoading: false}));
            })
            .catch(
                (_) =>
                    showMsg(
                        'Could not get height from the explorer, try again!'
                    ),
                true
            );
    }


    render() {
        return (
            <Modal
                size="lg"
                isOpen={this.props.isOpen}
                toggle={this.props.close}
            >
                <ModalHeader toggle={this.props.close}>
                    <span className="fsize-1 text-muted">New Auction</span>
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

                        <Form>
                            <FormGroup>
                                <Label for="tokenId">Token</Label>
                                <Input
                                    value={this.state.tokenId}
                                    onChange={(event) => {
                                        this.setState({
                                            tokenId: event.target.value,
                                            tokenQuantity: this.state
                                                .assets[event.target.value],
                                        });
                                    }}
                                    type="select"
                                    id="tokenId"
                                    invalid={this.state.tokenId === ''}
                                >
                                    {Object.keys(this.state.assets).map(
                                        (id) => {
                                            return <option>{id}</option>;
                                        }
                                    )}
                                </Input>
                                <FormFeedback invalid>
                                    No tokens to select from.
                                </FormFeedback>
                                <FormText>
                                    These tokens are loaded from your
                                    wallet.
                                </FormText>
                            </FormGroup>
                            <div className="divider"/>
                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="tokenQuantity">
                                            Token Quantity
                                        </Label>
                                        <Input
                                            min={1}
                                            type="number"
                                            step="1"
                                            value={this.state.tokenQuantity}
                                            onChange={(event) => {
                                                let cur =
                                                    event.target.value;
                                                this.setState({
                                                    tokenQuantity: parseInt(
                                                        cur
                                                    ),
                                                });
                                            }}
                                            id="tokenQuantity"
                                            invalid={
                                                this.state.assets[
                                                    this.state.tokenId
                                                    ] < this.state.tokenQuantity
                                            }
                                        />
                                        <FormFeedback invalid>
                                            More than balance, selected
                                            token's balance is{' '}
                                            {
                                                this.state.assets[
                                                    this.state.tokenId
                                                    ]
                                            }
                                        </FormFeedback>
                                        <FormText>
                                            Specify token quantity to be
                                            auctioned.
                                        </FormText>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="bid">Initial Bid</Label>
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                invalid={
                                                    ergToNano(
                                                        this.state
                                                            .initialBid
                                                    ) < 100000000
                                                }
                                                value={
                                                    this.state.initialBid
                                                }
                                                onChange={(e) => {
                                                    if (
                                                        isFloat(
                                                            e.target.value
                                                        )
                                                    ) {
                                                        this.setState({
                                                            initialBid:
                                                            e.target
                                                                .value,
                                                        });
                                                    }
                                                }}
                                                id="bid"
                                            />
                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>
                                                    ERG
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <FormFeedback invalid>
                                                Must be at least 0.1 ERG
                                            </FormFeedback>
                                        </InputGroup>
                                        <FormText>
                                            Specify initial bid of the
                                            auction.
                                        </FormText>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <div className="divider"/>
                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="auctionStep">
                                            Minimum Step
                                        </Label>
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                invalid={
                                                    ergToNano(
                                                        this.state
                                                            .auctionStep
                                                    ) < 100000000
                                                }
                                                value={
                                                    this.state.auctionStep
                                                }
                                                onChange={(e) => {
                                                    if (
                                                        isFloat(
                                                            e.target.value
                                                        )
                                                    ) {
                                                        this.setState({
                                                            auctionStep:
                                                            e.target
                                                                .value,
                                                        });
                                                    }
                                                }}
                                                id="auctionStep"
                                            />
                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>
                                                    ERG
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <FormFeedback invalid>
                                                Must be at least 0.1 ERG
                                            </FormFeedback>
                                        </InputGroup>
                                        <FormText>
                                            The bidder must increase the bid
                                            by at least this value.
                                        </FormText>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="duration">
                                            Auction Duration
                                        </Label>
                                        <InputGroup>
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <Label check>
                                                        <Input
                                                            checked={
                                                                this.state
                                                                    .auctionAutoExtend
                                                            }
                                                            onChange={(e) =>
                                                                this.setState(
                                                                    {
                                                                        auctionAutoExtend:
                                                                        e
                                                                            .target
                                                                            .checked,
                                                                    }
                                                                )
                                                            }
                                                            className="mr-2"
                                                            addon
                                                            type="checkbox"
                                                            aria-label="Checkbox for following text input"
                                                        />
                                                        Auto Extend
                                                    </Label>
                                                </InputGroupText>
                                            </InputGroupAddon>

                                            <Input
                                                type="number"
                                                value={
                                                    this.state
                                                        .auctionDuration
                                                }
                                                onChange={(event) => {
                                                    if (
                                                        isNatural(
                                                            event.target
                                                                .value
                                                        )
                                                    )
                                                        this.setState({
                                                            auctionDuration:
                                                            event.target
                                                                .value,
                                                        });
                                                }}
                                                id="duration"
                                            />
                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>
                                                    Blocks
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <FormText>
                                            Auction will last for this
                                            number of blocks (e.g. 720 for
                                            ~1 day). <br/> By enabling auto
                                            extend, your auction's duration
                                            will be extended slightly if a
                                            bid is placed near the end of
                                            the auction.
                                        </FormText>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <div className="divider"/>
                            <FormGroup>
                                <Label for="description">Description</Label>
                                <Input
                                    invalid={
                                        this.state.description !==
                                        undefined &&
                                        this.state.description.length > 150
                                    }
                                    value={this.state.description}
                                    onChange={(event) =>
                                        this.setState({
                                            description: event.target.value,
                                        })
                                    }
                                    type="textarea"
                                    name="text"
                                    id="description"
                                />
                                <FormFeedback invalid>
                                    At most 150 characters!
                                </FormFeedback>
                                <FormText>
                                    You can explain about the token you are
                                    auctioning here.
                                </FormText>
                            </FormGroup>
                        </Form>
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
                        disabled={!this.canStartAuction()}
                        onClick={() => this.startAuction()}
                    >
                        Create Auction
                    </Button>
                </ModalFooter>
            </Modal>

        );
    }
}

export default NewAuction;
