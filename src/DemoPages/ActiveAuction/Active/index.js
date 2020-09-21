import React, {Fragment} from 'react';

import PageTitle from '../../../Layout/AppMain/PageTitle';
import {currentHeight, getActiveAuctions, getTokenInfo, getUnspentBoxes, getTokenTx} from "../../../auction/explorer"
import {friendlyToken, getTxUrl} from "../../../auction/helpers"
import {css} from "@emotion/core";
import PropagateLoader from "react-spinners/PropagateLoader";
import SyncLoader from "react-spinners/SyncLoader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faAngleUp, faArrowUp} from "@fortawesome/free-solid-svg-icons";
import {Line, LineChart, ResponsiveContainer} from "recharts";
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col, Nav,
    NavItem, NavLink,
    Progress,
    Row,
    TabPane,
    Tooltip
} from "reactstrap";
import {Address, Explorer, Transaction, ErgoBox} from "@coinbarn/ergo-ts";
import ReactTooltip from 'react-tooltip';


const override = css`
  display: block;
  margin: 0 auto;
`;

export default class ActiveAuctions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {height: -1, loading: true, auctions: [], tooltip: false}
    }


    componentDidMount() {
        currentHeight().then(res => {
            this.setState({height: res})
        })
        getActiveAuctions().then(boxes => {
            console.log(boxes)
            boxes.forEach(box => box.loader = false)
            this.setState({auctions: boxes, loading: false})
            this.setState({tooltip: true})
        })
    }

    toggle() {
        this.setState({
            tooltip: !this.state.tooltip
        });
    }

    showIssuingTx(box) {
        box.loader = true
        this.forceUpdate()
        getTokenTx(box.assets[0].tokenId).then(res => {
            window.open(getTxUrl(res), "_blank")
        }).finally(() => {
            box.loader = false
            this.forceUpdate()
        })
    }

    render() {
        const listItems = this.state.auctions.map((box) => {
            return <Col key={box.id} md="6">
                <div className="card mb-3 widget-chart">
                    <div className="widget-chart-content">
                        <ResponsiveContainer height={20}>
                            <SyncLoader
                                css={override}
                                size={8}
                                color={"#0b473e"}
                                loading={box.loader}
                            />
                        </ResponsiveContainer>

                        <div className="widget-numbers">
                            {box.value / 1e9} ERG
                        </div>
                        <div className="widget-chart-wrapper chart-wrapper-relative">
                            <div style={{display: 'flex', justifyContent: 'center'}} className="widget-subheading m-1">
                                <span data-tip={box.assets[0].tokenId}>{friendlyToken(box.assets[0])}</span>
                                <i onClick={() => this.showIssuingTx(box)} data-tip='click to see issuing transaction'
                                   style={{fontSize: '1.5rem', marginLeft: '5px'}}
                                   className="pe-7s-help1 icon-gradient bg-night-sky"/>

                            </div>
                            <div style={{display: 'flex', justifyContent: 'center'}} className="widget-subheading m-1">
                                <span data-tip={box.assets[0].tokenId}>{friendlyToken(box.assets[0])}</span>
                                <i onClick={() => this.showIssuingTx(box)} data-tip='click to see issuing transaction'
                                   style={{fontSize: '1.5rem', marginLeft: '5px'}}
                                   className="pe-7s-help1 icon-gradient bg-night-sky"/>

                            </div>
                            <div style={{display: 'flex', justifyContent: 'center'}} className="widget-subheading m-1">
                                <span data-tip={box.assets[0].tokenId}>{friendlyToken(box.assets[0])}</span>
                                <i onClick={() => this.showIssuingTx(box)} data-tip='click to see issuing transaction'
                                   style={{fontSize: '1.5rem', marginLeft: '5px'}}
                                   className="pe-7s-help1 icon-gradient bg-night-sky"/>

                            </div>
                        </div>
                        <ReactTooltip effect="solid" place="bottom"/>

                        <div className="widget-chart-wrapper chart-wrapper-relative">
                            <div style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '50px',
                                overflow: 'scroll'
                            }}>
                                <p className="text-primary">
                                    This is a NFT containing word ergo in base16 - also is the first token auctioned on
                                    top of Ergo
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="widget-chart-wrapper chart-wrapper-relative">
                        <Button outline className="btn-outline-light m-2 border-0" color="primary">
                            <i className="nav-link-icon lnr-pencil"> </i>
                            <span>Place Bid</span>
                        </Button>
                        <Button outline className="btn-outline-light m-2 border-0" color="primary">
                            <i className="nav-link-icon lnr-sync"> </i>
                            <span>Refresh</span>
                        </Button>
                    </div>
                    <CardFooter>
                        <Col md={6} className="widget-description">
                            Up by
                            <span className="text-success pl-1 pr-1">
                                                <FontAwesomeIcon icon={faAngleUp}/>
                                                <span className="pl-1">54.1%</span>
                                            </span>
                            since initial bid
                        </Col>

                        <Col md={6} className="justify-content-end ml-3">
                            <div className="widget-content">
                                <div className="widget-content-outer">
                                    <div className="widget-content-wrapper">
                                        <div className="widget-content-left mr-3">
                                            <div className="widget-numbers fsize-2 text-muted">
                                                233
                                            </div>
                                        </div>
                                        <div className="widget-content-right">
                                            <div className="text-muted opacity-6">
                                                Blocks Remaining
                                            </div>
                                        </div>
                                    </div>
                                    <div className="widget-progress-wrapper">
                                        <Progress className="progress-bar-xs progress-bar-animated-alt"
                                                  value={50}/>
                                    </div>
                                </div>
                            </div>
                        </Col>

                    </CardFooter>

                </div>
            </Col>
        });


        return (
            <Fragment>
                <PageTitle
                    heading="Active Actions"
                    subheading="Here you can see current active auctions. You can bid on any of them if there is still time."
                    icon="pe-7s-volume2 icon-gradient bg-night-fade"
                />
                {/*<h3>{this.state.height}</h3>*/}


                {this.state.loading ? (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <PropagateLoader
                            css={override}
                            size={20}
                            color={"#0b473e"}
                            loading={this.state.loading}
                        />
                    </div>
                ) : (
                    <Row>
                        {listItems}

                    </Row>
                )}
            </Fragment>
        );
    }
}