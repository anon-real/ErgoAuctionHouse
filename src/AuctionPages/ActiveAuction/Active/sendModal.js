import React from 'react';
import {Button, Container, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {friendlyAddress, showMsg} from '../../../auction/helpers';
import Clipboard from "react-clipboard.js";
import {auctionFee} from "../../../auction/explorer";
import QRCode from "react-qr-code";

const statusToBadge = {
    'pending mining': 'info',
    rejected: 'warning',
    complete: 'primary',
    'current active bid': 'success',
    'winner': 'success',
};

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
                                    (this.props.bidAmount + auctionFee) /
                                    1e9
                                }
                                onSuccess={() => showMsg('Copied!')}
                            >
                                exactly{' '}
                                {(this.props.bidAmount + auctionFee) / 1e9}{' '}
                                erg
                            </Clipboard>{' '}
                            {this.props.isAuction && <span>and the <b>token</b> you want to auction</span>}{' '}
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
                            {!this.props.isAuction ?
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
                        <QRCode
                            value={"https://explorer.ergoplatform.com/payment-request?address=" + this.props.bidAddress +
                            "&amount=" + (this.props.bidAmount + auctionFee) / 1e9}/>
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
