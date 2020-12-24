import React from 'react';
import {Button, Container, Modal, ModalBody, ModalHeader} from 'reactstrap';
import {friendlyAddress, friendlyToken, getMyBids, getTxUrl, showMsg} from '../auction/helpers';
import {Col, Row} from "react-bootstrap";
import Clipboard from "react-clipboard.js";
import {auctionFee} from "../auction/explorer";

export default class ArtworkDetails extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Modal
                size="lg"
                isOpen={this.props.isOpen}
                toggle={this.props.close}
            >
                <ModalHeader toggle={this.props.close}>
                    <span className="fsize-1 text-muted">
                        Artwork details for NFT {' '}
                        {friendlyAddress(this.props.tokenId, 5)}.
                    </span>
                </ModalHeader>
                <ModalBody>
                    <Container>
                        <Row>
                            <Col md="4">
                                Artwork Name:
                            </Col>
                            <Col md="8">
                                <b>{this.props.tokenName}</b>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                Artwork Description:
                            </Col>
                            <Col md="8" style={{overflowY: "auto"}}>
                                <b>{this.props.tokenDescription}</b>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                Artwork Checksum:
                            </Col>
                            <Col md="8">
                                <Clipboard
                                    component="b"
                                    data-clipboard-text={this.props.artHash}
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    {friendlyAddress(this.props.artHash, 15)}
                                </Clipboard>{' '}
                            </Col>
                        </Row>

                        <div className="divider text-muted bg-premium-dark opacity-1"/>
                        <div style={{overflow: 'auto', display: 'flex',  justifyContent:'center', alignItems:'center'}}>
                            {this.props.artworkUrl && <img
                                style={{overflow: 'auto'}}
                                src={this.props.artworkUrl}
                                alt="new"
                            />}
                            {!this.props.artworkUrl && <p>
                                No artwork image detected, see the Artwork Description above for more details.
                            </p>}


                        </div>
                    </Container>
                </ModalBody>
            </Modal>
        );
    }
}
