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
import {friendlyToken, isWalletSaved, showMsg,} from '../../../auction/helpers';
import SyncLoader from 'react-spinners/SyncLoader';
import {css} from '@emotion/core';
import {currentBlock} from '../../../auction/explorer';
import {currencyToLong, isFloat, longToCurrency} from '../../../auction/serializer';
import {registerBid} from "../../../auction/newBidAssm";
import {supportedCurrencies} from "../../../auction/consts";

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
            bidAmount: longToCurrency(props.box.nextBid, -1, props.box.currency).toString(),
        };
        this.placeBid = this.placeBid.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.isOpen === true && this.props.isOpen === false) {
            this.setState({copied: false})
            if (this.state.bidAddress !== undefined) this.setState({assemblerModal: true})
        }
    }

    placeBid() {
        if (!isWalletSaved()) {
            showMsg(`Please configure the wallet first!`, true);
            return;
        }
        this.setState({modalLoading: true});
        currentBlock().then((block) => {
            registerBid(
                block,
                currencyToLong(this.state.bidAmount, supportedCurrencies[this.props.box.currency].decimal),
                this.props.box,
            )
                .then((r) => {
                    if (r.id !== undefined) {
                        this.props.close()
                        this.props.assemblerModal(r.address, this.state.bidAmount, false, this.props.box.currency)
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
                    this.setState({modalLoading: false})
                );
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
                                    color={'#0086d3'}
                                    loading={this.state.modalLoading}
                                />
                            </Row>

                            <FormGroup>
                                <InputGroup>
                                    <Input
                                        type="number"
                                        value={this.state.bidAmount}
                                        invalid={
                                            currencyToLong(this.state.bidAmount, supportedCurrencies[this.props.box.currency].decimal) < this.props.box.nextBid
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
                                        <InputGroupText>{this.props.box.currency}</InputGroupText>
                                    </InputGroupAddon>
                                    <FormFeedback invalid>
                                        Minimum bid value for this auction is{' '}
                                        {longToCurrency(this.props.box.nextBid, -1, this.props.box.currency)}{' '}
                                        {this.props.box.currency}
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
                                currencyToLong(this.state.bidAmount, supportedCurrencies[this.props.box.currency].decimal) <
                                this.props.box.nextBid ||
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
