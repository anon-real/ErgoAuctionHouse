import React from 'react';
import {Button, Container, Modal, ModalBody, ModalFooter} from 'reactstrap';
import {bidHelper} from "../auction/newBidAssm";
import {getArtworkUrl} from "../auction/helpers";

export default class FakeModal extends React.Component {
    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                backdrop="static"
                toggle={this.props.close}
            >
                <ModalBody>
                    <Container>
                        <p className="text-danger mr-2 ml-2">
                            There is a similar artwork issued before this one.
                            <br/>
                            <b>Note that this message may not be accurate! Please see the potential original one and make the decision for yourself.</b>
                        </p>
                    </Container>
                </ModalBody>
                <ModalFooter>
                    <Button
                        className="ml-3 mr-3 btn-transition"
                        color="secondary"
                        onClick={() => {
                            this.props.close()
                            bidHelper(this.props.bid, this.props.box, this.props.modal, null, false)
                        }}
                    >
                        Place the bid anyway
                    </Button>
                    <Button
                        className="ml-3 mr-3 btn-transition"
                        color="secondary"
                        onClick={() => {
                            window.open(getArtworkUrl(this.props.original))
                        }}
                    >
                        See the potential original
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}
