import React, {Fragment} from 'react';
import {css} from '@emotion/core';
import PropagateLoader from 'react-spinners/PropagateLoader';
import {Button, Col,} from 'reactstrap';
import cx from 'classnames';
import TitleComponent2 from '../Layout/AppMain/PageTitleExamples/Variation2';
import {decodeArtwork} from "../auction/serializer";
import SpecificArt from "./SpecificArt";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class ArtworkVisual extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        let parts = window.location.href.split('/')
        while (!parts[parts.length - 1]) parts.pop()
        let tokenId = parts[parts.length - 1]
        decodeArtwork(null, tokenId, true).then(res => {
            this.setState({box: res})

        }).finally(() => this.setState({loading: false}))

    }

    render() {
        return (
            <Fragment>
                <div className="app-page-title">
                    <div className="page-title-wrapper">
                        <div className="page-title-heading">
                            <div
                                className={cx('page-title-icon', {
                                    'd-none': false,
                                })}
                            >
                                <i className="pe-7s-volume2 icon-gradient bg-night-fade"/>
                            </div>
                            <div>
                                Artwork Details
                            </div>
                        </div>
                        <div className="page-title-actions">
                            <TitleComponent2/>
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
                            color={'#0086d3'}
                            loading={this.state.loading}
                        />
                    </div>
                ) : (
                    <div>
                        <Col xs="12" md="6" lg="6" xl="3">
                            <SpecificArt box={this.state.box}/>
                        </Col>
                    </div>
                )}
            </Fragment>
        );
    }
}
