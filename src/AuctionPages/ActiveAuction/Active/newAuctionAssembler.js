import React from 'react';
import moment from 'moment';
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
import {getWalletAddress, showMsg,} from '../../../auction/helpers';
import SyncLoader from 'react-spinners/SyncLoader';
import {css} from '@emotion/core';
import {currentHeight} from '../../../auction/explorer';
import {currencyToLong, isFloat, longToCurrency} from "../../../auction/serializer";
import {getAuctionP2s, registerAuction} from "../../../auction/newAuctionAssm";
import DateTimePicker from 'react-datetime-picker';
import {supportedCurrencies} from "../../../auction/consts";


const override = css`
  display: block;
  margin: 0 auto;
`;

class NewAuctionAssembler extends React.Component {
    constructor(props) {
        super();
        this.state = {
            modalLoading: false,
            endTime: moment().add(5, 'days')._d,
            currency: supportedCurrencies.ERG,
            auctionStep: longToCurrency(supportedCurrencies.ERG.minSupported, supportedCurrencies.ERG.decimal),
            initialBid: longToCurrency(supportedCurrencies.ERG.minSupported, supportedCurrencies.ERG.decimal),
            instantAmount: longToCurrency(supportedCurrencies.ERG.minSupported * 10, supportedCurrencies.ERG.decimal),
            enableInstantBuy: false,
        }
        this.canStartAuction = this.canStartAuction.bind(this);
        this.changeCurrency = this.changeCurrency.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.props.isOpen && !nextProps.isOpen) {
            this.setState({modalLoading: false, assets: {}});
        }
    }

    changeCurrency(name) {
        this.setState({
            currency: supportedCurrencies[name],
            auctionStep: longToCurrency(supportedCurrencies[name].minSupported, supportedCurrencies[name].decimal),
            initialBid: longToCurrency(supportedCurrencies[name].minSupported, supportedCurrencies[name].decimal),
            instantAmount: longToCurrency(supportedCurrencies[name].minSupported * 10, supportedCurrencies[name].decimal),
        })
    }


    canStartAuction() {
        return (
            !this.state.modalLoading &&
            currencyToLong(this.state.initialBid, this.state.currency.decimal) >= this.state.currency.minSupported &&
            this.state.auctionDuration > 0 &&
            currencyToLong(this.state.auctionStep, this.state.currency.decimal) >= this.state.currency.minSupported
        );
    }

    startAuction() {
        this.setState({modalLoading: true});
        currentHeight()
            .then((height) => {
                getAuctionP2s(currencyToLong(this.state.initialBid, this.state.currency.decimal), height + parseInt(this.state.auctionDuration) + 5,
                    currencyToLong(this.state.auctionStep, this.state.currency.decimal)).then(addr => {
                    let description = this.state.description;
                    if (!description) description = '';
                    registerAuction(
                        addr.address,
                        currencyToLong(this.state.initialBid, this.state.currency.decimal),
                        getWalletAddress(),
                        currencyToLong(this.state.auctionStep, this.state.currency.decimal),
                        height,
                        height + parseInt(this.state.auctionDuration) + 5, // +5 to take into account the time it takes to be mined
                        description,
                        this.state.auctionAutoExtend
                    ).then(res => {
                        this.props.close()
                        this.props.assemblerModal(addr.address, currencyToLong(this.state.initialBid, this.state.currency.decimal) - 10000000, true)

                    }).catch(err => {
                        showMsg('Error while registering the request to the assembler!', true);
                        this.setState({modalLoading: false})
                    })

                }).catch(_ => {
                    showMsg('Could not contact the assembler service.', true);
                    this.setState({modalLoading: false})
                })
            }).catch(_ => showMsg('Could not get height from the explorer, try again!', true));
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
                                color={'#0086d3'}
                                loading={this.state.modalLoading}
                            />
                        </Row>

                        <Form>
                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="bid">Initial Bid</Label>
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                invalid={
                                                    currencyToLong(
                                                        this.state.initialBid,
                                                        this.state.currency.decimal
                                                    ) < this.state.currency.minSupported
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
                                                <select onChange={(curr) => this.changeCurrency(curr.target.value)}>
                                                    {Object.keys(supportedCurrencies).map(res => {
                                                        return <option>{res}</option>
                                                    })}
                                                </select>
                                            </InputGroupAddon>
                                            <FormFeedback invalid>
                                                Must be at
                                                least {longToCurrency(this.state.currency.minSupported, this.state.currency.decimal)} {this.state.currency.name}
                                            </FormFeedback>
                                        </InputGroup>
                                        <FormText>
                                            Specify the initial bid of the auction and its currency
                                        </FormText>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <Label>
                                            Instant buy amount
                                        </Label>
                                        <InputGroup>
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <Label check>
                                                        <Input
                                                            checked={
                                                                this.state
                                                                    .enableInstantBuy
                                                            }
                                                            onChange={(e) =>
                                                                this.setState(
                                                                    {
                                                                        enableInstantBuy:
                                                                        e
                                                                            .target
                                                                            .checked,
                                                                    }
                                                                )
                                                            }
                                                            className="mr-2"
                                                            addon
                                                            type="checkbox"
                                                        />
                                                        Enable instant buy
                                                    </Label>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                type="text"
                                                invalid={
                                                    currencyToLong(this.state.instantAmount, this.state.currency.decimal) <= currencyToLong(this.state.initialBid, this.state.currency.decimal)
                                                }
                                                disabled={!this.state.enableInstantBuy}
                                                value={
                                                    this.state.instantAmount
                                                }
                                                onChange={(e) => {
                                                    if (
                                                        isFloat(
                                                            e.target.value
                                                        )
                                                    ) {
                                                        this.setState({
                                                            instantAmount:
                                                            e.target
                                                                .value,
                                                        });
                                                    }
                                                }}
                                                id="auctionStep"
                                            />
                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>
                                                    {this.state.currency.name}
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <FormFeedback invalid>
                                                Instant buy amount must be bigger than the initial bid!
                                            </FormFeedback>
                                        </InputGroup>
                                        <FormText>
                                            If you set this, anyone can instantly win your auction by bidding by this amount.
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
                                                    currencyToLong(this.state.auctionStep, this.state.currency.decimal) < this.state.currency.minSupported
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
                                                    {this.state.currency.name}
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <FormFeedback invalid>
                                                Must be at
                                                least {longToCurrency(this.state.currency.minSupported, this.state.currency.decimal)} {this.state.currency.name}
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
                                            Auction End Time
                                        </Label>
                                        <InputGroup>
                                            <DateTimePicker value={this.state.endTime} onChange={(tm => {
                                                this.setState({endTime: tm})
                                            })}/></InputGroup>
                                        <FormText>
                                            Your auction will end at this time.
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
                                        this.state.description.length > 250
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
                                    At most 250 characters!
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

export default NewAuctionAssembler;
