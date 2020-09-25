import React from 'react';
import { currentHeight } from '../../../auction/explorer';
import {
    Button,
    Card,
    Col,
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
    Row,
} from 'reactstrap';
import { friendlyToken, getAddrUrl, getTxUrl } from '../../../auction/helpers';
import SyncLoader from 'react-spinners/SyncLoader';
import avatar4 from '../../../assets/utils/images/avatars/4.jpg';
import avatar3 from '../../../assets/utils/images/avatars/3.jpg';
import avatar2 from '../../../assets/utils/images/avatars/2.jpg';
import avatar1 from '../../../assets/utils/images/avatars/1.jpg';

const statusToBadge = {
    'pending mining': 'info',
    rejected: 'warning',
    complete: 'primary',
    'current active bid': 'success',
};

export default class MyBidsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: this.props.isOpen,
            box: undefined,
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({ isOpen: nextProps.isOpen, box: nextProps.box });
    }

    render() {
        let curBids = [
            {
                amount: 1000000000,
                txId:
                    '7fc145c59be002e4a91068ad9dc4dfa8ef928d26f1ea549649139d3b849d4189',
                status: 'pending mining',
            },
            {
                amount: 2300000000,
                txId:
                    '4dc2a37e456fdbd11269e9b3e532d6126390d757f3146633793e0183aa31fc68',
                status: 'rejected',
            },
            {
                amount: 134200000000,
                txId:
                    '7973f35b6232e36e184f03cdd3afcd5512a5bf03d32f462ff95bc172e5266c45',
                status: 'complete',
            },
            {
                amount: 10000000,
                txId:
                    '7973f35b6232e36e184f03cdd3afcd5512a5bf03d32f462ff95bc172e5266c45',
                status: 'complete',
            },
        ];
        return (
            <Modal
                size="lg"
                isOpen={this.state.isOpen}
                toggle={this.props.closeMyBids}
                className={this.props.className}
            >
                {this.state.box !== undefined && (
                    <span>
                        <ModalHeader toggle={() => this.props.closeMyBids}>
                            <span className="fsize-1 text-muted">
                                Bids for{' '}
                                {friendlyToken(
                                    this.state.box.assets[0],
                                    false,
                                    5
                                )}
                            </span>
                        </ModalHeader>
                        <ModalBody>
                            <Container>
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
                                            {curBids.map((bid) => {
                                                let status =
                                                    bid.amount ===
                                                    this.state.box.value
                                                        ? 'current active bid'
                                                        : bid.status;
                                                return (
                                                    <tr>
                                                        <td className="text-center">
                                                            {bid.amount / 1e9}{' '}
                                                            ERG
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
                                                            >
                                                                <span>
                                                                    See
                                                                    Transaction
                                                                </span>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Container>
                        </ModalBody>
                    </span>
                )}
            </Modal>
        );
    }
}
