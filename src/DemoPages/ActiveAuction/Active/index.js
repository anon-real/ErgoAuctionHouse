import React, {Fragment} from 'react';

import PageTitle from '../../../Layout/AppMain/PageTitle';
import {currentHeight, getTokenInfo, getUnspentBoxes} from "../../../auction/wallet"
import {css} from "@emotion/core";
import PropagateLoader from "react-spinners/PropagateLoader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown} from "@fortawesome/free-solid-svg-icons";
import {Line, LineChart, ResponsiveContainer} from "recharts";
import {Col, Row} from "reactstrap";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class ActiveAuctions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {height: -1, loading: true, auctions: []}
    }


    componentDidMount() {
        currentHeight().then(res => {
            this.setState({height: res})
        })
        getUnspentBoxes("9gAKeRu1W4Dh6adWXnnYmfqjCTnxnSMtym2LPPMPErCkusCd6F3").then(boxes => {
            console.log(boxes)
            this.setState({auctions: boxes, loading: false})
        })
    }

    render() {
        const listItems = this.state.auctions.map((box) => {
            return <Col md="6">
                <div className="card mb-3 widget-chart">
                    <div className="widget-chart-content">
                        <div className="icon-wrapper rounded-circle">
                            <div className="icon-wrapper-bg bg-warning"/>
                            <i className="lnr-heart icon-gradient bg-premium-dark"> </i>
                        </div>
                        <div className="widget-numbers">
                            {box.value / 1e9} ERG
                        </div>
                        <div className="widget-subheading">
                            Active Social Profiles
                        </div>
                        <div className="widget-description">
                            Down by
                            <span className="text-danger pl-1 pr-1">
                                                <FontAwesomeIcon icon={faAngleDown}/>
                                                <span className="pl-1">54.1%</span>
                                            </span>
                            from 30 days ago
                        </div>
                    </div>
                    <div className="widget-chart-wrapper chart-wrapper-relative">
                    </div>
                </div>
            </Col>
        });
        console.log(listItems)


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