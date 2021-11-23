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
            <span>
            {this.props.box && <Modal
                size="lg"
                isOpen={this.props.isOpen}
                toggle={this.props.close}
            >
                <ModalHeader toggle={this.props.close}>
                    {this.props.box.isArtwork && this.props.box.assets && <span className="fsize-1 text-muted">
                        Artwork details for NFT {' '}
                        {friendlyAddress(this.props.box.assets[0].tokenId, 5)}.
                    </span>}
                    {!this.props.box.isArtwork && this.props.box.assets && <span className="fsize-1 text-muted">
                        Details for {' '} {friendlyAddress(this.props.box.assets[0].tokenId, 5)}.
                    </span>}
                </ModalHeader>
                <ModalBody>
                    <Container>
                        <Row>
                            <Col md="3">
                                {this.props.box.isArtwork && <span>Artwork</span>} Name:
                            </Col>
                            <Col md="9">
                                <b>{this.props.box.tokenName}</b>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="3">
                                {this.props.box.isArtwork && <span>Artwork</span>} Description:
                            </Col>
                            <Col md="9" style={{overflowY: "auto"}}>
                                <b>
                                    {isJson(this.props.box.tokenDescription) && <JSONPretty id="json-pretty"
                                                                                            data={JSON.parse(this.props.box.tokenDescription)}/>}
                                    {!isJson(this.props.box.tokenDescription) &&
                                    <pre>{this.props.box.tokenDescription}</pre>}

                                </b>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="3">
                                Auction Description:
                            </Col>
                            <Col md="9" style={{overflowY: "auto"}}>
                                <b>
                                    {this.props.box.description}

                                </b>
                            </Col>
                        </Row>
                        {this.props.box.isArtwork && <Row>
                            <Col md="3">
                                Artwork Checksum:
                            </Col>
                            <Col md="9">
                                <Clipboard
                                    component="b"
                                    data-clipboard-text={this.props.box.artHash}
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    {friendlyAddress(this.props.box.artHash, 15)}
                                </Clipboard>{' '}
                            </Col>
                        </Row>}
                        <Row>
                            <Col md="3">
                                Token ID:
                            </Col>
                            <Col md="9">
                                <Clipboard
                                    component="b"
                                    data-clipboard-text={this.props.box.assets[0].tokenId}
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    {friendlyAddress(this.props.box.assets[0].tokenId, 15)}
                                </Clipboard>{' '}
                            </Col>
                        </Row>
                        {this.props.box.artist && <Row>
                            <Col md="3">
                                Artist Address:
                            </Col>
                            <Col md="9">
                                <Clipboard
                                    component="b"
                                    data-clipboard-text={this.props.box.artist}
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    {friendlyAddress(this.props.box.artist, 10)}
                                </Clipboard>{' '}
                            </Col>
                        </Row>}
                        {this.props.box.royalty >= 0 && <Row>
                            <Col md="3">
                                Royalty:
                            </Col>
                            <Col md="9">
                                <b>{`${(this.props.box.royalty / 10)}%`}</b>
                            </Col>
                        </Row>}
                        {this.props.box.totalIssued > 1 && <Row>
                            <Col md="3">
                                Total issued:
                            </Col>
                            <Col md="9">
                                <b>{this.props.box.totalIssued} - Fungible token</b>
                            </Col>
                        </Row>}

                        <div className="divider text-muted bg-premium-dark opacity-1"/>
                        <div
                            style={{overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            {this.props.box.isArtwork &&
                            <ArtworkMedia avoidDetail={true} avoidFav={true} preload={true} box={this.props.box}
                                          height='100%'
                                          removeIcon={true}/>}


                        </div>
                    </Container>
                </ModalBody>
            </Modal>}
                {!this.props.box && <b>No auction provided</b>}
        </span>
        );
    }

}
