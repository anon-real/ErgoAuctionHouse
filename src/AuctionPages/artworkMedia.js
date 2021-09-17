import React from 'react';
import {css} from '@emotion/core';
import AudioPlayer from "react-h5-audio-player";
import ReactPlayer from "react-player";

const override = css`
  display: block;
  margin: 0 auto;
`;

export default class ArtworkMedia extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
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
        return (
            <div className="imgDiv"
                 style={style}
            >
                {!this.props.removeIcon && <i
                    style={{zIndex: 100, cursor: "pointer"}}
                    onClick={() => {
                        if (this.props.details)
                            this.props.details()
                    }}
                    className={icon + " text-white imgicon"}/>}
                {box.isPicture && <div>
                    <img
                        style={{cursor: 'pointer'}}
                        onClick={() => {
                            if (this.props.details)
                            this.props.details()
                        }}
                        className="auctionImg"
                        src={
                            box.artworkUrl
                                ? box.artworkUrl
                                : 'http://revisionmanufacture.com/assets/uploads/no-image.png'
                        }
                    />
                </div>}
                {box.isAudio && <div>
                    <img
                        style={{cursor: 'pointer'}}
                        onClick={() =>
                            this.setState({artDetail: true})
                        }
                        className="auctionImg"
                        src={
                            box.artworkUrl
                                ? box.artworkUrl
                                : 'http://revisionmanufacture.com/assets/uploads/no-image.png'
                        }
                    />
                    <AudioPlayer
                        style={{position: "absolute", bottom: "0px"}}
                        src={box.audioUrl}
                    />
                </div>}
                {box.isVideo && <div>
                    <ReactPlayer
                        pip={true}
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