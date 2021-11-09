import React, {Fragment} from 'react';
import {Button, FormText, Input, Label, Modal, ModalBody, ModalFooter} from "reactstrap";
import BeatLoader from "react-spinners/BeatLoader";
import FormGroup from "react-bootstrap/lib/FormGroup";
import InputGroup from "react-bootstrap/lib/InputGroup";
import {Form} from "react-bootstrap";
import ModalHeader from "react-bootstrap/lib/ModalHeader";
import {getReturnAddr, returnFunds} from "../auction/assembler";
import {getTxUrl, showMsg} from "../auction/helpers";

export default class Refund extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            txId: null,
            loading: false
        };

        this.refund = this.refund.bind(this);
    }

    async refund() {
        this.setState({loading: true})
        try {
            const addr = await getReturnAddr(this.state.proxyContract)
            if (!addr) throw new Error()
            const txId = await returnFunds(addr, this.state.proxyContract)
            this.setState({txId: txId})
        } catch (e) {
            showMsg('Error while sending the refund! Make sure your funds are still in the proxy contract.', true)
        }
        this.setState({loading: false})
    }

    render() {
        return (
            <Fragment>
                <Modal
                    size="md"
                    isOpen={this.props.isOpen}
                    toggle={() => {
                        this.setState({txId: null})
                        this.props.close()
                    }}
                >
                    <ModalHeader
                        toggle={() => {
                            this.setState({txId: null})
                            this.props.close()
                        }}
                    >
                        <span className="fsize-1 text-muted">
                        Refund stuck funds
                    </span>
                    </ModalHeader>
                    <ModalBody>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <fieldset disabled={this.state.loading}>
                                <Form>
                                    {this.state.txId === null && <FormGroup>
                                        <Label for="tokenName">Proxy Address</Label>
                                        <InputGroup>
                                            <Input
                                                value={this.state.proxyContract}
                                                onChange={(e) => {
                                                    this.setState({proxyContract: e.target.value})
                                                }}
                                                id="proxy"
                                            />
                                        </InputGroup>
                                        <FormText>
                                            This is the address you've sent your funds to.
                                        </FormText>
                                    </FormGroup>}
                                    {this.state.txId !== null && <FormGroup>
                                        <a target='_blank' href={getTxUrl(this.state.txId)}>See the refund transaction</a>
                                    </FormGroup>}
                                </Form>
                            </fieldset>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <BeatLoader
                            size={8}
                            color={'#0b473e'}
                            loading={this.state.loading}
                        />

                        <Button
                            className="ml mr-2 btn-transition"
                            color="secondary"
                            onClick={() => {
                                this.setState({txId: null})
                                this.props.close()
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            onClick={this.refund}
                        >
                            Send Refund
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}
