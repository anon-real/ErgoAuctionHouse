import React, { Fragment } from "react";

import PageTitle from "../../../Layout/AppMain/PageTitle";
import {
  currentHeight,
  getActiveAuctions,
  getTokenTx,
} from "../../../auction/explorer";
import {
  friendlyAddress,
  friendlyToken,
  getAddrUrl,
  getTxUrl,
} from "../../../auction/helpers";
import { css } from "@emotion/core";
import PropagateLoader from "react-spinners/PropagateLoader";
import SyncLoader from "react-spinners/SyncLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { ResponsiveContainer } from "recharts";
import { Button, CardFooter, Col, Progress, Row } from "reactstrap";
import ReactTooltip from "react-tooltip";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class ActiveAuctions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: -1,
      loading: true,
      auctions: [],
      tooltip: false,
      currentHeight: 0,
    };
    this.refreshInfo = this.refreshInfo.bind(this);
  }

  componentDidMount() {
    currentHeight().then((res) => {
      this.setState({ height: res });
    });
    this.refreshInfo();
    setInterval(this.refreshInfo, 30000);
  }

  refreshInfo() {
    currentHeight().then((height) => this.setState({ currentHeight: height }));
    getActiveAuctions()
      .then((boxes) => {
        boxes.forEach((box) => {
          box.description =
            "This is a NFT containing word ergo in base16 - also is the first token auctioned on top of Ergo";
          box.remBlock = 233;
          box.doneBlock = 50;
          box.increase = 57;
          box.seller = "9gAKeRu1W4Dh6adWXnnYmfqjCTnxnSMtym2LPPMPErCkusCd6F3";
          box.bidder = "9hyV1owHpWKuWUnd3cTbTTptCzRfWQFhA9Bs8dSKNcNWicmc6gz";
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
    window.open(getAddrUrl(addr), "_blank");
  }

  showIssuingTx(box) {
    box.loader = true;
    this.forceUpdate();
    getTokenTx(box.assets[0].tokenId)
      .then((res) => {
        window.open(getTxUrl(res), "_blank");
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
                  color={"#0b473e"}
                  loading={box.loader}
                />
              </ResponsiveContainer>

              <div className="widget-numbers">{box.value / 1e9} ERG</div>
              <div className="widget-chart-wrapper chart-wrapper-relative justify justify-content-lg-start">
                <div
                  style={{ display: "flex", justifyContent: "center" }}
                  className="widget-subheading m-1"
                >
                  <span data-tip={box.assets[0].tokenId}>
                    {friendlyToken(box.assets[0])}
                  </span>
                  <i
                    onClick={() => this.showIssuingTx(box)}
                    data-tip="see issuing transaction"
                    style={{ fontSize: "1.5rem", marginLeft: "5px" }}
                    className="pe-7s-help1 icon-gradient bg-night-sky"
                  />
                </div>
                <div
                  style={{ display: "flex", justifyContent: "center" }}
                  className="widget-subheading m-1"
                >
                  <span data-tip={box.seller}>
                    Seller {friendlyAddress(box.seller)}
                  </span>
                  <i
                    onClick={() => this.showAddress(box.seller)}
                    data-tip="see seller's address"
                    style={{ fontSize: "1.5rem", marginLeft: "5px" }}
                    className="pe-7s-help1 icon-gradient bg-night-sky"
                  />
                </div>
                <div
                  style={{ display: "flex", justifyContent: "center" }}
                  className="widget-subheading m-1"
                >
                  <span data-tip={box.bidder}>
                    Bidder {friendlyAddress(box.bidder)}
                  </span>
                  <i
                    onClick={() => this.showAddress(box.bidder)}
                    data-tip="see current bidder's address"
                    style={{ fontSize: "1.5rem", marginLeft: "5px" }}
                    className="pe-7s-help1 icon-gradient bg-night-sky"
                  />
                </div>
              </div>
              <ReactTooltip effect="solid" place="bottom" />

              <div className="widget-chart-wrapper chart-wrapper-relative">
                <div
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    height: "50px",
                    overflow: "scroll",
                  }}
                >
                  <p className="text-primary">{box.description}</p>
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
                outline
                className="btn-outline-light m-2 border-0"
                color="primary"
              >
                <i className="nav-link-icon lnr-pencil"> </i>
                <span>Place Bid</span>
              </Button>
              <Button
                outline
                className="btn-outline-light m-2 border-0"
                color="primary"
              >
                <i className="nav-link-icon lnr-sync"> </i>
                <span>Refresh</span>
              </Button>
            </div>
            <CardFooter>
              <Col md={6} className="widget-description">
                Up by
                <span className="text-success pl-1 pr-1">
                  <FontAwesomeIcon icon={faAngleUp} />
                  <span className="pl-1">{box.increase}%</span>
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
        <PageTitle
          heading="Active Actions"
          subheading="Here you can see current active auctions. Page gets updated automatically."
          icon="pe-7s-volume2 icon-gradient bg-night-fade"
        />
        {!this.state.loading && this.state.auctions.length === 0 && (
          <strong
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            No Active Auctions
          </strong>
        )}
        {this.state.loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PropagateLoader
              css={override}
              size={20}
              color={"#0b473e"}
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
