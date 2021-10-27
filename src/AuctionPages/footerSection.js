import React from 'react';
import {ButtonGroup, CardFooter, Col, Progress,} from 'reactstrap';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleUp} from '@fortawesome/free-solid-svg-icons';
import {css} from '@emotion/core';
import {Row} from 'react-bootstrap';
import {longToCurrency} from "../auction/serializer";
import {bidHelper} from "../auction/newBidAssm";
import {isWalletSaved, showMsg} from "../auction/helpers";
import FakeModal from "./fakeModal";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class FooterSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.openFake = this.openFake.bind(this)
    }

    openFake(bid, box, modal, original) {
        this.setState({
            bid: bid,
            box: box,
            modal: modal,
            original: original,
            fakeOpen: true
        })
    }

    render() {
        return (
            <span style={{"display": "contents"}}>
                <FakeModal bid={this.state.bid} modal={this.state.modal} box={this.state.box}
                           original={this.state.original} isOpen={this.state.fakeOpen}
                           close={() => this.setState({fakeOpen: !this.state.fakeOpen})}/>
                    <CardFooter>
                        <Col md={6} className="widget-description">
                            <Row>
                                {this.props.box.curBid >= this.props.box.minBid && <span>
                                    <b className="fsize-1">
                                        {longToCurrency(this.props.box.curBid, -1, this.props.box.currency)}{' '}{this.props.box.currency}
                                    </b>{' '}
                                    <text
                                        style={{fontSize: '10px'}}
                                        className="text-success pl-1 pr-1"
                                    >
                                        {this.props.box.increase}%
                                        <FontAwesomeIcon icon={faAngleUp}/>
                                    </text>
                                </span>}
                                {this.props.box.curBid < this.props.box.minBid && <span>
                                    <i
                                        style={{fontSize: '12px'}}
                                        className="pl-1 pr-1"
                                    >
                                        No bids yet
                                    </i>{' '}
                                </span>}
                            </Row>
                        </Col>

                        <Col md={6} className="justify-content-end ml-3">
                            <div className="widget-content">
                                <div className="widget-content-outer">
                                    <div className="widget-content-wrapper">
                                        {this.props.box.remTime}
                                    </div>
                                    <div className="widget-progress-wrapper">
                                        <Progress
                                            className="progress-bar-xs progress-bar-animated-alt"
                                            value={this.props.box.done}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>


                    </CardFooter>

                    <ButtonGroup style={{'pointerEvents': this.props.box.isFinished ? "none" : null}}>
                        <div className="d-block text-center">
                            <button className="btn-icon btn-icon-only btn btn-outline-primary"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.props.openBid();
                                    }}>
                                <i className="pe-7s-edit btn-icon-wrapper"> </i>
                            </button>
                        </div>
                        <button type="button" className="btn btn-outline-primary btn-sm"
                                style={{fontSize: 13}}
                                onClick={(e) => {
                                    if (!isWalletSaved()) {
                                        showMsg(
                                            'In order to place bids, you have to configure the wallet first.',
                                            true
                                        );
                                        return
                                    }
                                    e.preventDefault();
                                    this.props.loading(true)
                                    bidHelper(this.props.box.nextBid, this.props.box, this.props.assemblerModal, this.openFake).finally(() => this.props.loading(false))
                                }}>
                            <text>
                                Bid
                            </text>
                            {' '}
                            <text>
                                for{' '}
                                <b>
                                    {longToCurrency(this.props.box.nextBid, -1, this.props.box.currency)}{' '} {this.props.box.currency}
                                </b>
                            </text>
                        </button>
                        {this.props.box.instantAmount !== -1 &&
                        <button type="button" className="btn btn-outline-dark btn-sm"
                                style={{fontSize: 13}}
                                onClick={(e) => {
                                    if (!isWalletSaved()) {
                                        showMsg(
                                            'In order to place bids, you have to configure the wallet first.',
                                            true
                                        );
                                        return
                                    }
                                    e.preventDefault();
                                    this.props.loading(true)
                                    bidHelper(this.props.box.instantAmount, this.props.box, this.props.assemblerModal, this.openFake).finally(() => this.props.loading(false))
                                }}>
                            <text>
                                Buy
                            </text>
                            {' '}
                            <text>
                                for{' '}
                                <b>
                                    {longToCurrency(this.props.box.instantAmount, -1, this.props.box.currency)}{' '} {this.props.box.currency}
                                </b>
                            </text>
                        </button>}
                    </ButtonGroup>
                    </span>
        );
    }
}
