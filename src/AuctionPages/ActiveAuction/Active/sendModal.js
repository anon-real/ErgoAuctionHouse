import React from 'react';
import {Button, Container, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {friendlyAddress, showMsg} from '../../../auction/helpers';
import Clipboard from "react-clipboard.js";
import QRCode from "react-qr-code";
import {additionalData, supportedCurrencies, txFee} from "../../../auction/consts";

export default class SendModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                backdrop="static"
                toggle={this.close}
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
                                    this.props.bidAmount
                                }
                                onSuccess={() => showMsg('Copied!')}
                            >
                                exactly{' '}
                                {this.props.bidAmount}{' '}{this.props.currency}
                            </Clipboard>
                            {this.props.isAuction && <span>
                                {this.props.currency !== 'ERG' && <Clipboard
                                    component="b"
                                    data-clipboard-text={
                                        this.props.bidAmount
                                    }
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    {', '}{(parseInt(additionalData.dataInput.additionalRegisters.R8.renderedValue) + supportedCurrencies.ERG.minSupported) / 1e9} ERG
                                </Clipboard>}
                                {' '}and the <b>token</b> you want to auction</span>}{' '}
                            to{' '}
                            <Clipboard
                                component="b"
                                data-clipboard-text={this.props.bidAddress}
                                onSuccess={() => showMsg('Copied!')}
                            >
                                {friendlyAddress(this.props.bidAddress)}
                            </Clipboard>
                            <b
                                onClick={() =>
                                    this.copyToClipboard(
                                        this.props.bidAddress
                                    )
                                }
                            ></b>
                            <br/>
                            <br/>
                            <li>
                                The operation will be done as soon as the funds are sent.
                            </li>
                            <li>
                                You can send the requested funds in multiple transactions.
                            </li>
                            <li>
                                Your funds are safe, find out more about how{' '}
                                <a
                                    target="_blank"
                                    href="https://www.ergoforum.org/t/some-details-about-ergo-auction-house/428/6"
                                >
                                    here.
                                </a>
                            </li>
                            {this.props.isAuction && <li>
                                Starting auction fee (<b>{parseInt(additionalData.dataInput.additionalRegisters.R8.renderedValue) / 1e9} ERG</b>) is included in the funds above.
                            </li>}
                            <li>
                                You have a limited time to send the funds.
                            </li>
                        </p>
                        {this.props.currency === 'ERG' && <QRCode
                            value={"https://explorer.ergoplatform.com/payment-request?address=" + this.props.bidAddress +
                            "&amount=" + this.props.bidAmount}/>}
                        {this.props.currency !== 'ERG' && this.props.isAuction && <QRCode
                            value={"https://explorer.ergoplatform.com/payment-request?address=" + this.props.bidAddress +
                            "&amount=" + ((supportedCurrencies.ERG.minSupported + parseInt(additionalData.dataInput.additionalRegisters.R8.renderedValue)) / 1e9) +`&${supportedCurrencies[this.props.currency].id}=${this.props.bidAmount}`}/>}
                        {this.props.currency !== 'ERG' && !this.props.isAuction && this.props.currency && <QRCode
                            value={"https://explorer.ergoplatform.com/payment-request?address=" + this.props.bidAddress +
                            "&amount=" + 4 * (txFee / 1e9) + `&${supportedCurrencies[this.props.currency].id}=${this.props.bidAmount}`}/>}
                    </Container>
                </ModalBody>
                <ModalFooter>
                    <Button
                        className="ml-3 mr-3 btn-transition"
                        color="secondary"
                        onClick={this.props.close}
                    >
                        OK
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}
