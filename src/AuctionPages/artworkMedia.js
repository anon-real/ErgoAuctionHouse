import React from 'react';
import {css} from '@emotion/core';
import AudioPlayer from "react-h5-audio-player";
import ReactPlayer from "react-player";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from "@fortawesome/free-regular-svg-icons";
import {faStar as faStarSolid} from "@fortawesome/free-solid-svg-icons";
import { addForKey, getThumbnailAddress, removeForKey } from '../auction/helpers';
import ArtworkDetails from "./artworkDetails";
import noImg from "../assets/no-image-removebg-preview.jpg";

export default class ArtworkMedia extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFav: props.box.isFav,
            errors: {}
        };
        this.favNFT = this.favNFT.bind(this);
    }

    favNFT() {
        if (this.props.box.isFav) {
            this.props.box.isFav = false
            removeForKey('fav-artworks', this.props.box.token.id)
        } else {
            this.props.box.isFav = true
            addForKey({
                asset: this.props.box.token,
                id: this.props.box.token.id,
                boxId: this.props.box.boxId
            }, 'fav-artworks')
        }
        this.forceUpdate()
    }

    render() {
        let box = this.props.box;
        let icon = ''
        if (box.isPicture)
            icon = 'lnr-picture'
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

                {!this.props.removeIcon && icon.length > 0 && <i
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
                            getThumbnailAddress(box.token.id)
                        }
                        onError={(e)=>{

                            if(!(box.token.id in this.state.errors)){
                                e.target.src=box.token.url;
                                let error = this.state.errors;
                                error[box.token.id]=true;
                                this.setState({error})
                            }
                            else
                                e.target.src="";

                        }}
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
                            getThumbnailAddress(box.token.id,true)
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
                        src={getThumbnailAddress(box.token.id)}
                        onError={(e)=>{

                            if(!(box.token.id in this.state.errors)){
                                e.target.src=box.token.url;
                                let error = this.state.errors;
                                error[box.token.id]=true;
                                this.setState({error})
                            }
                            else
                                e.target.src="";

                        }}
                    />
                </div>}
                {box.isVideo && <div>
                    <ReactPlayer
                        pip={true}
                        light={!this.props.preload}
                        playing={false}
                        url={[{src: getThumbnailAddress(box.token.id,false,false)}]} // video location
                        onError={(e)=>{

                            if(!(box.token.id in this.state.errors)){
                                e.target.src=box.token.url;
                                let error = this.state.errors;
                                error[box.token.id]=true;
                                this.setState({error})
                            }
                            else
                                e.target.src="";

                        }}
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
                {!box.isArtwork && <div
                    style={{cursor: 'pointer'}}
                    onClick={() => {
                        if (!this.props.avoidDetail) this.setState({artDetail: true})
                    }}
                    className='notArtwork'>
                    <b className='font-size-xlg text-grey'>May not be an artwork</b>
                    <br/>
                    <text className='font-size-md text-grey'>Click to see details</text>
                </div>}
            </div>
        );
    }
}
