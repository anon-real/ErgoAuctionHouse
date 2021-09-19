import React, {Fragment} from 'react';
import {Col, Row,} from 'reactstrap';
import {getWalletAddress, isWalletSaved, isYoroi,} from '../../../auction/helpers';
import {css} from '@emotion/core';
import 'react-h5-audio-player/lib/styles.css';
import ArtworkMedia from "../../artworkMedia";
import {getYoroiTokens} from "../../../auction/yoroiUtils";
import {decodeArtwork} from "../../../auction/serializer";
import PropagateLoader from "react-spinners/PropagateLoader";
import {getBalance} from "../../../auction/explorer";
import NewAuctionAssembler from "../../ActiveAuction/Active/newAuctionAssembler";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class OwnedArtworks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            artworks: [],
            artDetail: false,
            box: null
        };
        this.loadArtworks = this.loadArtworks.bind(this);
    }

    componentWillMount() {
        if (isWalletSaved()) this.loadArtworks().then(r => {
        })
    }

    async loadArtworks() {
        this.setState({loading: true})
        let ids = []
        if (isYoroi()) ids = Object.keys(await getYoroiTokens())
        else ids = (await getBalance(getWalletAddress())).tokens.map(tok => tok.tokenId)
        let decoded = []
        for (let i = 0; i < ids.length; i++) {
            const dec = await decodeArtwork(null, ids[i])
            decoded = decoded.concat([dec])
        }
        this.setState({artworks: decoded.filter(bx => bx.isArtwork), loading: false})
    }

    render() {
        const listItems = this.state.artworks.map((box) => {
            return (
                <Col key={box.id} xs="12" md="6" lg="6" xl="3">
                    <div
                        style={{
                            borderWidth: '1px',
                            borderRadius: '8px',
                            borderColor: 'lightgrey',
                            boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.08)',
                            borderStyle: 'solid',
                            textAlign: "center"
                        }}
                        className="mb-3">
                        <p className='text-center'><b>{box.tokenName}</b></p>
                        <ArtworkMedia box={box}/>
                        <button type="button"
                                onClick={() => this.setState({modalAssembler: true, selected: box.assets[0].tokenId})}
                                className="btn btn-sm border-0 btn-link">Auction it
                        </button>
                    </div>
                </Col>
            );
        });
        return (
            <Fragment>
                <NewAuctionAssembler
                    isOpen={this.state.modalAssembler}
                    close={() => this.setState({modalAssembler: !this.state.modalAssembler})}
                    selected={this.state.selected}
                    assemblerModal={this.toggleAssemblerModal}
                />
                {!isWalletSaved() && (
                    <strong
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        Set your wallet first!
                    </strong>
                )}
                {isWalletSaved() && !this.state.loading && this.state.artworks.length === 0 && (
                    <strong
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        No artworks is owned
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
                            color={'#0086d3'}
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
