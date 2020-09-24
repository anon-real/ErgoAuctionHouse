import React, { Fragment } from 'react';

import {
    currentHeight,
    getActiveAuctions,
    getTokenTx,
    test,
} from '../../../auction/explorer';
import {
    friendlyAddress,
    friendlyToken,
    getAddrUrl,
    getTxUrl,
    isWalletSaved,
    showMsg,
} from '../../../auction/helpers';
import { css } from '@emotion/core';
import PropagateLoader from 'react-spinners/PropagateLoader';
import SyncLoader from 'react-spinners/SyncLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { ResponsiveContainer } from 'recharts';
import {
    Button,
    CardBody,
    CardFooter,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    FormFeedback,
    FormGroup,
    FormText,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupButtonDropdown,
    InputGroupText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Progress,
    Row,
} from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import cx from 'classnames';
import TitleComponent2 from '../../../Layout/AppMain/PageTitleExamples/Variation2';
import { getAssets } from '../../../auction/nodeWallet';
import number from 'd3-scale/src/number';
import FormControl from 'react-bootstrap/lib/FormControl';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const override = css`
    display: block;
    margin: 0 auto;
`;

export default class ActiveAuctions extends React.Component {
    constructor(props) {
        super(props);
        console.log('fuckkkkkkkkkkkkkkk')
        this.state = {
            lastUpdated: 0,
            tokenId: '',
            modal: false,
            modalLoading: true,
            assets: {},
            loading: true,
            auctions: [],
            tooltip: false,
            currentHeight: 0,
        };
        this.refreshInfo = this.refreshInfo.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.openAuction = this.openAuction.bind(this);
        this.openBid = this.openBid.bind(this);
        this.canStartAuction = this.canStartAuction.bind(this);
        this.toggleBidModal = this.toggleBidModal.bind(this);
        this.updateAssets = this.updateAssets.bind(this);
    }

    openAuction() {
        if (!isWalletSaved()) {
            showMsg(
                'In order to create a new auction, you have to configure the wallet first.',
                true
            );
        } else {
            this.toggleModal();
        }
    }

    openBid() {
        if (!isWalletSaved()) {
            showMsg(
                'In order to place bids, you have to configure the wallet first.',
                true
            );
        } else {
            this.toggleBidModal();
        }
    }

    canStartAuction() {
        return (
            this.state.tokenId !== undefined &&
            this.state.tokenId.length > 0 &&
            this.state.initialBid > 0 &&
            this.state.auctionDuration > 0 &&
            this.state.auctionStep >= 0 &&
            this.state.tokenQuantity > 0
        );
    }

    toggleBidModal() {
        this.setState({
            bidModal: !this.state.bidModal,
        });
        if (!this.state.bidModal) {
            this.updateAssets()
                .then(() => {
                    this.setState({
                        bidAmount:
                            (this.state.currentBox.value +
                                this.state.currentBox.minStep) /
                            1e9,
                    });
                })
                .catch(() => {});
        }
    }

    updateAssets() {
        this.setState({ modalLoading: true });
        return getAssets()
            .then((res) => {
                this.setState({ assets: res.assets });
                this.setState({ ergBalance: res.balance });
            })
            .catch((err) => {
                showMsg(
                    'Error getting assets from wallet. Check your wallet accessibility.',
                    true
                );
            })
            .finally(() => {
                this.setState({ modalLoading: false });
            });
    }

    toggleModal() {
        this.setState({
            modal: !this.state.modal,
        });
        if (this.state.modal) {
            this.setState({ modalLoading: false, assets: {} });
        } else {
            this.updateAssets().then(() => {
                let assets = this.state.assets;
                if (Object.keys(assets).length === 0)
                    showMsg('Your wallet contains no tokens to auction!', true);
                else
                    this.setState({
                        tokenId: Object.keys(assets)[0],
                        tokenQuantity: Object.values(assets)[0],
                    });
            });
        }
    }

    componentDidMount() {
        console.log(this.state);
        currentHeight().then((res) => {
            this.setState({ height: res });
        });
        this.refreshInfo(true);
        // this.refreshTimer = setInterval(this.refreshInfo, 5000);
    }

    componentWillUnmount() {
        if (this.refreshTimer !== undefined) {
            clearInterval(this.refreshTimer);
        }
    }

    refreshInfo(force = false) {
        if (!force) {
            this.setState({ lastUpdated: this.state.lastUpdated + 5 });
            if (this.state.lastUpdated < 40) return;
        }
        this.setState({ lastUpdated: 0 });
        currentHeight().then((height) =>
            this.setState({ currentHeight: height })
        );
        getActiveAuctions()
            .then((boxes) => {
                boxes.forEach((box) => {
                    box.description =
                        'This is a NFT containing word ergo in base16 - also is the first token auctioned on top of Ergo';
                    box.remBlock = 233;
                    box.doneBlock = 50;
                    box.finalBlock = 32000;
                    box.increase = 57;
                    box.minStep = 1000000000;
                    box.seller =
                        '9gAKeRu1W4Dh6adWXnnYmfqjCTnxnSMtym2LPPMPErCkusCd6F3';
                    box.bidder =
                        '9hyV1owHpWKuWUnd3cTbTTptCzRfWQFhA9Bs8dSKNcNWicmc6gz';
                    box.loader = false;
                });
                this.setState({ auctions: boxes, loading: false });
                this.setState({ tooltip: true });
            })
            .finally(() => {
                this.setState({ loading: false });
            });
    }

    toggle() {
        this.setState({
            tooltip: !this.state.tooltip,
        });
    }

    showAddress(addr) {
        window.open(getAddrUrl(addr), '_blank');
    }

    showIssuingTx(box) {
        box.loader = true;
        this.forceUpdate();
        getTokenTx(box.assets[0].tokenId)
            .then((res) => {
                window.open(getTxUrl(res), '_blank');
            })
            .finally(() => {
                box.loader = false;
                this.forceUpdate();
            });
    }

    render() {
        const listItems = this.state.auctions.map((box) => {
            return (
                <Col key={box.id} md="6">
                    <div className="card mb-3 widget-chart">
                        <div className="widget-chart-content">
                            <ResponsiveContainer height={20}>
                                <SyncLoader
                                    css={override}
                                    size={8}
                                    color={'#0b473e'}
                                    loading={box.loader}
                                />
                            </ResponsiveContainer>
                            {test(322945)}

                            <div className="widget-numbers">
                                {box.value / 1e9} ERG
                            </div>
                            <div className="widget-chart-wrapper chart-wrapper-relative justify justify-content-lg-start">
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                    className="widget-subheading m-1"
                                >
                                    <span data-tip={box.assets[0].tokenId}>
                                        {friendlyToken(box.assets[0])}
                                    </span>
                                    <i
                                        onClick={() => this.showIssuingTx(box)}
                                        data-tip="see issuing transaction"
                                        style={{
                                            fontSize: '1.5rem',
                                            marginLeft: '5px',
                                        }}
                                        className="pe-7s-help1 icon-gradient bg-night-sky"
                                    />
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                    className="widget-subheading m-1"
                                >
                                    <span data-tip={box.seller}>
                                        Seller {friendlyAddress(box.seller)}
                                    </span>
                                    <i
                                        onClick={() =>
                                            this.showAddress(box.seller)
                                        }
                                        data-tip="see seller's address"
                                        style={{
                                            fontSize: '1.5rem',
                                            marginLeft: '5px',
                                        }}
                                        className="pe-7s-help1 icon-gradient bg-night-sky"
                                    />
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                    className="widget-subheading m-1"
                                >
                                    <span data-tip={box.bidder}>
                                        Bidder {friendlyAddress(box.bidder)}
                                    </span>
                                    <i
                                        onClick={() =>
                                            this.showAddress(box.bidder)
                                        }
                                        data-tip="see current bidder's address"
                                        style={{
                                            fontSize: '1.5rem',
                                            marginLeft: '5px',
                                        }}
                                        className="pe-7s-help1 icon-gradient bg-night-sky"
                                    />
                                </div>
                            </div>
                            <ReactTooltip effect="solid" place="bottom" />

                            <div className="widget-chart-wrapper chart-wrapper-relative">
                                <div
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '50px',
                                        overflow: 'scroll',
                                    }}
                                >
                                    <p className="text-primary">
                                        {box.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="widget-chart-wrapper chart-wrapper-relative">
                            <Button
                                outline
                                className="btn-outline-light m-2 border-0"
                                color="primary"
                            >
                                <i className="nav-link-icon lnr-layers"> </i>
                                <span>My Bids</span>
                            </Button>
                            <Button
                                onClick={() => {
                                    this.setState(
                                        this.setState({ currentBox: box })
                                    );
                                    this.openBid();
                                }}
                                outline
                                className="btn-outline-light m-2 border-0"
                                color="primary"
                            >
                                <i className="nav-link-icon lnr-pencil"> </i>
                                <span>Place Bid</span>
                            </Button>
                        </div>
                        <CardFooter>
                            <Col md={6} className="widget-description">
                                Up by
                                <span className="text-success pl-1 pr-1">
                                    <FontAwesomeIcon icon={faAngleUp} />
                                    <span className="pl-1">
                                        {box.increase}%
                                    </span>
                                </span>
                                since initial bid
                            </Col>

                            <Col md={6} className="justify-content-end ml-3">
                                <div className="widget-content">
                                    <div className="widget-content-outer">
                                        <div className="widget-content-wrapper">
                                            <div className="widget-content-left mr-3">
                                                <div className="widget-numbers fsize-2 text-muted">
                                                    {box.remBlock}
                                                </div>
                                            </div>
                                            <div className="widget-content-right">
                                                <div className="text-muted opacity-6">
                                                    Blocks Remaining
                                                </div>
                                            </div>
                                        </div>
                                        <div className="widget-progress-wrapper">
                                            <Progress
                                                className="progress-bar-xs progress-bar-animated-alt"
                                                value={box.doneBlock}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </CardFooter>
                    </div>
                </Col>
            );
        });
        return (
            <Fragment>
                {this.state.currentBox !== undefined && <Modal
                    isOpen={this.state.bidModal}
                    toggle={this.toggleBidModal}
                    className={this.props.className}
                >
                    <ModalHeader toggle={this.toggle}>
                <span className="fsize-1 text-muted">
                    New bid for {friendlyToken(this.state.currentBox.assets[0], false, 5)}
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
                                            (this.state.currentBox.value + this.state.currentBox.minStep) / 1e9
                                        }
                                        onChange={(event) =>
                                            this.setState({
                                                bidAmount: event.target.value,
                                            })
                                        }
                                        id="bidAmount"
                                    />
                                    <InputGroupAddon addonType="append">
                                        <InputGroupText>ERG</InputGroupText>
                                    </InputGroupAddon>
                                    <FormFeedback invalid>
                                        Minimum bid value for this auction is{' '}
                                        {(this.state.currentBox.value + this.state.currentBox.minStep) / 1e9} ERG
                                    </FormFeedback>
                                </InputGroup>
                                <FormText>Specify your bid amount.</FormText>
                            </FormGroup>
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="ml mr-2 btn-transition"
                            color="secondary"
                            onClick={this.toggleBidModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            disabled={
                                this.state.bidAmount < (this.state.currentBox.value + this.state.currentBox.minStep) / 1e9
                            }
                            // onClick={() =>
                            //
                            // }
                        >
                            Place Bid
                        </Button>
                    </ModalFooter>
                </Modal>}

                <Modal
                    size="lg"
                    isOpen={this.state.modal}
                    toggle={this.toggleModal}
                    className={this.props.className}
                >
                    <ModalHeader toggle={this.toggleModal}>
                        <span className="fsize-1 text-muted">New Auction</span>
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

                            <Form>
                                <FormGroup>
                                    <Label for="tokenId">Token</Label>
                                    <Input
                                        value={this.state.tokenId}
                                        onChange={(event) => {
                                            this.setState({
                                                tokenId: event.target.value,
                                                tokenQuantity: this.state.assets[
                                                    event.target.value
                                                    ],
                                            });
                                        }}
                                        type="select"
                                        id="tokenId"
                                        invalid={this.state.tokenId === ''}
                                    >
                                        {Object.keys(this.state.assets).map((id) => {
                                            return <option>{id}</option>;
                                        })}
                                    </Input>
                                    <FormFeedback invalid>
                                        No token to select from.
                                    </FormFeedback>
                                    <FormText>
                                        These tokens are loaded from your wallet
                                    </FormText>
                                </FormGroup>
                                <div className="divider" />
                                <Row>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="tokenQuantity">
                                                Token Quantity
                                            </Label>
                                            <Input
                                                min={1}
                                                type="number"
                                                step="1"
                                                value={this.state.tokenQuantity}
                                                onChange={(event) => {
                                                    let cur = event.target.value;
                                                    this.setState({
                                                        tokenQuantity: parseInt(cur),
                                                    });
                                                }}
                                                id="tokenQuantity"
                                                invalid={
                                                    this.state.assets[
                                                        this.state.tokenId
                                                        ] < this.state.tokenQuantity
                                                }
                                            />
                                            <FormFeedback invalid>
                                                More than balance, selected token's
                                                balance is{' '}
                                                {this.state.assets[this.state.tokenId]}
                                            </FormFeedback>
                                            <FormText>
                                                Specify token quantity to be auctioned.
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="bid">Initial Bid</Label>
                                            <InputGroup>
                                                <Input
                                                    min={0.1}
                                                    type="number"
                                                    value={this.state.initialBid}
                                                    onChange={(event) => {
                                                        let val = number(
                                                            event.target.value
                                                        );
                                                        if (!isNaN(val) && val < 0) {
                                                            this.setState({
                                                                initialBid: 0.1,
                                                            });
                                                        } else {
                                                            this.setState({
                                                                initialBid:
                                                                event.target.value,
                                                            });
                                                        }
                                                    }}
                                                    id="bid"
                                                />
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText>ERG</InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <FormText>
                                                Specify initial bid of the auction.
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="divider" />
                                <Row>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="auctionStep">
                                                Minimum Step
                                            </Label>
                                            <InputGroup>
                                                <Input
                                                    type="number"
                                                    value={this.state.auctionStep}
                                                    onChange={(event) =>
                                                        this.setState({
                                                            auctionStep:
                                                            event.target.value,
                                                        })
                                                    }
                                                    id="auctionStep"
                                                />
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText>ERG</InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <FormText>
                                                The bidder must increase the bid by at
                                                least this value.
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="duration">
                                                Auction Duration
                                            </Label>
                                            <InputGroup>
                                                <Input
                                                    type="number"
                                                    value={this.state.auctionDuration}
                                                    onChange={(event) =>
                                                        this.setState({
                                                            auctionDuration:
                                                            event.target.value,
                                                        })
                                                    }
                                                    id="duration"
                                                />
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText>
                                                        Blocks
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <FormText>
                                                Auction will last for this number of
                                                blocks. For example set to 720 for your
                                                auction to last ~1 day.
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="divider" />
                                <FormGroup>
                                    <Label for="description">Description</Label>
                                    <Input
                                        invalid={
                                            this.state.description !== undefined &&
                                            this.state.description.length > 150
                                        }
                                        value={this.state.description}
                                        onChange={(event) =>
                                            this.setState({
                                                description: event.target.value,
                                            })
                                        }
                                        type="textarea"
                                        name="text"
                                        id="description"
                                    />
                                    <FormFeedback invalid>
                                        At most 150 characters!
                                    </FormFeedback>
                                    <FormText>
                                        You can explain about the token you are
                                        auctioning here.
                                    </FormText>
                                </FormGroup>
                            </Form>
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="ml mr-2 btn-transition"
                            color="secondary"
                            onClick={this.toggleModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            disabled={!this.canStartAuction()}
                            // onClick={() =>
                            //
                            // }
                        >
                            Create Auction
                        </Button>
                    </ModalFooter>
                </Modal>

                <div className="app-page-title">
                    <div className="page-title-wrapper">
                        <div className="page-title-heading">
                            <div
                                className={cx('page-title-icon', {
                                    'd-none': false,
                                })}
                            >
                                <i className="pe-7s-volume2 icon-gradient bg-night-fade" />
                            </div>
                            <div>
                                Active Actions
                                <div
                                    className={cx('page-title-subheading', {
                                        'd-none': false,
                                    })}
                                >
                                    Here you can see current active auctions.
                                    Last updated {this.state.lastUpdated}{' '}
                                    seconds ago.
                                </div>
                            </div>
                        </div>
                        <div className="page-title-actions">
                            <TitleComponent2 />
                        </div>
                        <Button
                            onClick={this.openAuction}
                            outline
                            className="btn-outline-lin m-2 border-0"
                            color="primary"
                        >
                            <i className="nav-link-icon lnr-plus-circle"> </i>
                            <span>New Auction</span>
                        </Button>
                    </div>
                </div>
                {!this.state.loading && this.state.auctions.length === 0 && (
                    <strong
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        No Active Auctions
                    </strong>
                )}
                {this.state.loading ? (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <PropagateLoader
                            css={override}
                            size={20}
                            color={'#0b473e'}
                            loading={this.state.loading}
                        />
                    </div>
                ) : (
                    <Row>{listItems}</Row>
                )}
            </Fragment>
        );
    }
}
