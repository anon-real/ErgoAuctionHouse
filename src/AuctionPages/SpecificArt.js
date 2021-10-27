import React from 'react';
import {Col, Row,} from 'reactstrap';
import ReactTooltip from 'react-tooltip';
import {css} from '@emotion/core';
import 'react-h5-audio-player/lib/styles.css';
import ArtworkMedia from "./artworkMedia";
import {friendlyAddress, getArtistUrl} from "../auction/helpers";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class SpecificArt extends React.Component {
    render() {
        let box = this.props.box;
        return (
            <div
                style={{
                    borderWidth: '1px',
                    borderRadius: '8px',
                    borderColor: 'lightgrey',
                    boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.08)',
                    borderStyle: 'solid',
                    textAlign: "center"
                }}
            >
                {/*<p className='text-center'><b>{box.tokenName}</b></p>*/}
                {/*<p className='text-center'><b>{box.totalIssued}</b></p>*/}
                <ReactTooltip effect="solid" place="bottom"/>

                <Row style={{margin: 5}}>
                    <Col className="text-truncate">
                        <b>{box.tokenName}</b>
                    </Col>

                    {(box.royalty > 0 || box.totalIssued > 1) &&
                    <Col className="text-truncate">
                        {box.royalty > 0 &&
                        <i data-tip={`Includes ${box.royalty / 10}% royalty on secondary sales`}
                           style={{fontSize: '12px'}}
                           className="font-weight-light">{`${box.royalty / 10}% royalty`}</i>}
                        {box.totalIssued > 1 &&
                        <i data-tip={`Not an NFT; There are ${box.totalIssued} of this token`}
                           style={{fontSize: '12px'}}
                           className="font-weight-light">{` - #${box.totalIssued}`}</i>}</Col>
                    }

                </Row>
                <ArtworkMedia avoidFav={true} box={box} avoidDetail={false}/>
                <p className="text-primary mr-2 ml-2">
                    <b
                        style={{cursor: "pointer"}}
                        onClick={() => window.open(getArtistUrl(box.artist))}
                    >
                        {' '}- By {friendlyAddress(box.artist, 4)}
                    </b>
                </p>
            </div>
        );
    }
}
