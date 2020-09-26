import React from "react";
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
    Row
} from "reactstrap";
import {friendlyToken} from "../../../auction/helpers";
import SyncLoader from "react-spinners/SyncLoader";
import {css} from "@emotion/core";

const override = css`
    display: block;
    margin: 0 auto;
`;

export default class PlaceBidModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalLoading: false,
            bidAmount: (props.box.value + props.box.minStep) / 1e9,
        }
    }

    render() {
        return <Modal
            isOpen={this.props.isOpen}
            toggle={this.props.close}
            className={this.props.className}
        >
            <ModalHeader toggle={this.props.close}>
                            <span className="fsize-1 text-muted">
                                New bid for{' '}
                                {friendlyToken(
                                    this.props.box.assets[0],
                                    false,
                                    5
                                )}
                            </span>
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

                    <FormGroup>
                        <InputGroup>
                            <Input
                                type="number"
                                value={this.state.bidAmount}
                                invalid={
                                    this.state.bidAmount <
                                    (this.props.box.value +
                                        this.props.box.minStep) / 1e9
                                }
                                onChange={(event) =>
                                    this.setState({
                                        bidAmount:
                                        event.target.value,
                                    })
                                }
                                id="bidAmount"
                            />
                            <InputGroupAddon addonType="append">
                                <InputGroupText>ERG</InputGroupText>
                            </InputGroupAddon>
                            <FormFeedback invalid>
                                Minimum bid value for this auction
                                is{' '}
                                {(this.props.box.value +
                                    this.props.box.minStep) /
                                1e9}{' '}
                                ERG
                            </FormFeedback>
                        </InputGroup>
                        <FormText>
                            Specify your bid amount.
                        </FormText>
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
                        this.state.bidAmount <
                        (this.props.box.value +
                            this.props.box.minStep) /
                        1e9
                    }
                    // onClick={() =>
                    //
                    // }
                >
                    Place Bid
                </Button>
            </ModalFooter>
        </Modal>

    }
}
