import React from 'react';
import {css} from '@emotion/core';
import AudioPlayer from "react-h5-audio-player";
import ReactPlayer from "react-player";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from "@fortawesome/free-regular-svg-icons";
import {faStar as faStarSolid} from "@fortawesome/free-solid-svg-icons";
import {addForKey, removeForKey} from "../auction/helpers";
import ArtworkDetails from "./artworkDetails";
import noImg from "../assets/no-image-removebg-preview.jpg";

export default class ArtworkMedia extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFav: props.box.isFav
        };
        this.favNFT = this.favNFT.bind(this);
    }

    favNFT() {
        if (this.props.box.isFav) {
            this.props.box.isFav = false
            removeForKey('fav-artworks', this.props.box.assets[0].tokenId)
        } else {
            this.props.box.isFav = true
            addForKey({
                asset: this.props.box.assets[0],
                id: this.props.box.assets[0].tokenId,
                boxId: this.props.box.boxId
            }, 'fav-artworks')
        }
        this.forceUpdate()
    }

    render() {
        let box = this.props.box;
        let icon = 'lnr-picture'
        if (box.isAudio)
            icon = 'lnr-music-note'
        else if (box.isVideo)
            icon = 'lnr-film-play'
        let style = {}
        if (this.props.height)
            style.height = this.props.height
        if (this.props.width)
            style.width = this.props.width
        return (
            <div className="imgDiv"
                 style={style}
            >

                {!this.props.avoidDetail && <ArtworkDetails
                    box={this.props.box}
                    isOpen={this.state.artDetail}
                    close={() => this.setState({artDetail: !this.state.artDetail})}
                />}

                {!this.props.removeIcon && <i
                    style={{zIndex: 1, cursor: "pointer"}}
                    onClick={() => {
                        if (!this.props.avoidDetail) this.setState({artDetail: true})
                    }}
                    className={icon + " text-dark font-weight-bold imgicon"}/>}
                {!this.props.avoidFav && <div
                    style={{zIndex: 1, cursor: "pointer"}}
                    onClick={() => this.favNFT()}
                    className="font-icon-wrapper font-weight-bold text-dark imgfav">
                    <FontAwesomeIcon icon={this.props.box.isFav? faStarSolid : faStar}/>
                </div>}
                {box.isPicture && <div>
                    <img
                        style={{cursor: 'pointer'}}
                        onClick={() => {
                            if (!this.props.avoidDetail) this.setState({artDetail: true})
                        }}
                        className="auctionImg"
                        src={
                            box.artworkUrl
                                ? box.artworkUrl
                                : noImg
                        }
                    />
                </div>}
                {box.isAudio && <div>
                    <img
                        style={{cursor: 'pointer'}}
                        className="auctionImg"
                        onClick={() => {
                            if (!this.props.avoidDetail) this.setState({artDetail: true})
                        }}
                        src={
                            box.artworkUrl
                                ? box.artworkUrl
                                : noImg
                        }
                    />
                    <AudioPlayer
                        customAdditionalControls={[]}
                        showSkipControls={false}
                        showJumpControls={false}
                        showFilledVolume={false}
                        defaultCurrentTime={"00:00"}
                        layout={"horizontal-reverse"}
                        preload={"none"}
                        autoPlay={false}
                        className='audioTab'
                        src={box.audioUrl}
                    />
                </div>}
                {box.isVideo && <div>
                    <ReactPlayer
                        pip={true}
                        light={!this.props.preload}
                        playing={false}
                        url={[{src: box.artworkUrl}]} // video location
                        controls  // gives the front end video controls
                        width='100%'
                        height='100%'
                        config={{
                            file: {
                                attributes: {
                                    controlsList: 'nodownload'  //<- this is the important bit
                                }
                            }
                        }}
                    />
                </div>}
            </div>
        );
    }
}
