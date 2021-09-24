import React from 'react';
import {Container, Modal, ModalBody, ModalHeader} from 'reactstrap';
import {friendlyAddress, isJson, showMsg} from '../auction/helpers';
import {Col, Row} from "react-bootstrap";
import Clipboard from "react-clipboard.js";
import ArtworkMedia from "./artworkMedia";
import JSONPretty from "react-json-pretty";

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
                            <Col md="3">
                                {!this.props.simple && <span>Artwork</span>} Name:
                            </Col>
                            <Col md="9">
                                <b>{this.props.tokenName}</b>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="3">
                                {!this.props.simple && <span>Artwork</span>} Description:
                            </Col>
                            <Col md="9" style={{overflowY: "auto"}}>
                                <b>
                                    {isJson(this.props.tokenDescription) && <JSONPretty id="json-pretty"
                                                                                        data={JSON.parse(this.props.tokenDescription)}/>}
                                    {!isJson(this.props.tokenDescription) && <pre>{this.props.tokenDescription}</pre>}

                                </b>
                            </Col>
                        </Row>
                        {!this.props.simple && <Row>
                            <Col md="3">
                                Artwork Checksum:
                            </Col>
                            <Col md="9">
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
                            <Col md="3">
                                Artist Address:
                            </Col>
                            <Col md="9">
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
                            {this.props.artworkUrl &&
                            <ArtworkMedia avoidFav={true} preload={true} box={this.props.box} height='100%'
                                          removeIcon={true}/>
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
