import React from 'react';
import { Button, Container, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { friendlyToken, getMyBids, getTxUrl } from '../../../auction/helpers';

const statusToBadge = {
    'pending mining': 'info',
    rejected: 'warning',
    complete: 'primary',
    'current active bid': 'success',
    'winner': 'success',
};

export default class MyBidsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curBids: getMyBids().filter((bid) => {
                return (
                    bid.token.tokenId === props.box.assets[0].tokenId &&
                    bid.token.amount === props.box.assets[0].amount
                );
            }),
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.state = {
            curBids: getMyBids().filter((bid) => {
                return (
                    bid.token.tokenId === this.props.box.assets[0].tokenId &&
                    bid.token.amount === this.props.box.assets[0].amount
                );
            }),
        };
    }

    render() {
        return (
            <Modal
                size="lg"
                isOpen={this.props.isOpen}
                toggle={this.props.close}
                className={this.props.className}
            >
                <ModalHeader toggle={this.props.close}>
                    <span className="fsize-1 text-muted">
                        Bids for{' '}
                        {friendlyToken(this.props.box.assets[0], false, 5)}.
                        Statuses will get updated automatically.
                    </span>
                </ModalHeader>
                <ModalBody>
                    <Container>
                        {this.state.curBids.length === 0 ? (
                            <strong
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100px',
                                }}
                            >
                                You have no bids for this auction
                            </strong>
                        ) : (
                            <div className="table-responsive">
                                <table className="align-middle mb-0 table table-borderless table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th className="text-center">
                                                Amount
                                            </th>
                                            <th className="text-center">
                                                Status
                                            </th>
                                            <th className="text-center">
                                                Transaction
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.curBids.map((bid) => {
                                            let status =
                                                bid.amount ===
                                                    this.props.box.value &&
                                                bid.status === 'complete'
                                                    ? this.props.highText
                                                    : bid.status;
                                            return (
                                                <tr>
                                                    <td className="text-center">
                                                        {bid.amount / 1e9} ERG
                                                    </td>
                                                    <td className="text-center">
                                                        <div
                                                            className={
                                                                'badge badge-' +
                                                                statusToBadge[
                                                                    status
                                                                ]
                                                            }
                                                        >
                                                            {status}
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <Button
                                                            onClick={() =>
                                                                window.open(
                                                                    getTxUrl(
                                                                        bid.txId
                                                                    ),
                                                                    '_blank'
                                                                )
                                                            }
                                                            outline
                                                            className="btn-outline-lin m-2 border-0"
                                                            color="primary"
                                                            disabled={bid.status === 'rejected'}
                                                        >
                                                            <span>
                                                                See Transaction
                                                            </span>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Container>
                </ModalBody>
            </Modal>
        );
    }
}
