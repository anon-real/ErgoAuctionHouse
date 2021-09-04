import React from 'react';
import {Container, Modal, ModalBody, ModalHeader} from 'reactstrap';
import {friendlyAddress, showMsg} from '../auction/helpers';
import {Col, Row} from "react-bootstrap";
import Clipboard from "react-clipboard.js";

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
                    {!this.props.simple && <span className="fsize-1 text-muted">
                        Artwork details for NFT {' '}
                        {friendlyAddress(this.props.tokenId, 5)}.
                    </span>}
                    {this.props.simple && <span className="fsize-1 text-muted">
                        Details for {' '} {friendlyAddress(this.props.tokenId, 5)}.
                    </span>}
                </ModalHeader>
                <ModalBody>
                    <Container>
                        <Row>
                            <Col md="4">
                                {!this.props.simple && <span>Artwork</span>} Name:
                            </Col>
                            <Col md="8">
                                <b>{this.props.tokenName}</b>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="4">
                                {!this.props.simple && <span>Artwork</span>} Description:
                            </Col>
                            <Col md="8" style={{overflowY: "auto"}}>
                                <b>
                                    <pre>{this.props.tokenDescription}</pre>
                                </b>
                            </Col>
                        </Row>
                        {!this.props.simple && <Row>
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
                        </Row>}
                        {this.props.artist && <Row>
                            <Col md="4">
                                Artist Address:
                            </Col>
                            <Col md="8">
                                <Clipboard
                                    component="b"
                                    data-clipboard-text={this.props.artist}
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    {friendlyAddress(this.props.artist, 10)}
                                </Clipboard>{' '}
                            </Col>
                        </Row>}

                        <div className="divider text-muted bg-premium-dark opacity-1"/>
                        <div
                            style={{overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            {this.props.artworkUrl && <img
                                className="d-block w-100"
                                src={this.props.artworkUrl}
                            />
                            }
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
