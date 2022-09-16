import React, {Fragment} from 'react';

import {currentBlock, followAuction, getAllActiveAuctions,} from '../../../auction/explorer';
import {
    encodeQueries,
    friendlyAddress,
    getAuctionUrl,
    getWalletAddress,
    isWalletSaved,
    parseQueries,
} from '../../../auction/helpers';
import {css} from '@emotion/core';
import PropagateLoader from 'react-spinners/PropagateLoader';
import {assembleFinishedAuctions} from "../../../auction/assembler";
import {Col, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledButtonDropdown,} from 'reactstrap';
import cx from 'classnames';
import TitleComponent2 from '../../../Layout/AppMain/PageTitleExamples/Variation2';
import {decodeBoxes, longToCurrency,} from '../../../auction/serializer';
import ShowAuctions from "./showActives";
import {withRouter} from 'react-router-dom';
import ArtworkMedia from "../../artworkMedia";
import Announcement from "react-announcement";
import logo from '../../../assets/Auction House LOGO3.svg'

const Coverflow = require('react-coverflow');

const override = css`
  display: block;
  margin: 0 auto;
`;

const sortKeyToVal = {
    '0': 'Lowest remaining time',
    '1': 'Highest remaining time',
    '2': 'Highest bid',
    '3': 'Lowest bid',
    '4': 'Hottest first',
    '5': 'My auctions first',
    '6': 'My bids first',
    '7': 'My favorites first',
    '8': 'ERG auctions first',
    '9': 'Non ERG auctions first',
}

const types = ['all', 'picture', 'audio', 'video', 'other']

const limit = 9
const updatePeriod = 40
let searchflagControl = true;

class ActiveAuctions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            allAuctions: [],
            sortKey: '0',
            end: limit,
            values: [],
            lastLoaded: [],
            lastUpdated: 0,
            searchValue: '',
        };
        this.sortAuctions = this.sortAuctions.bind(this);
        this.filterAuctions = this.filterAuctions.bind(this);
        this.trackScrolling = this.trackScrolling.bind(this);
        this.updateParams = this.updateParams.bind(this);
        this.getToShow = this.getToShow.bind(this);
        this.getHottest = this.getHottest.bind(this);
    }

    isBottom(el) {
        return el.getBoundingClientRect().bottom <= window.innerHeight; // bottom reached
    }

    trackScrolling = () => {
        if (!this.state.loading && document.getElementsByClassName('page-list-container') !== undefined) {
            const wrappedElement = document.getElementsByClassName('page-list-container')[0]
            if (this.isBottom(wrappedElement)) {
                this.setState({end: this.state.end + limit})
            }
        }
    };

    updateParams(key, newVal) {
        let queries = parseQueries(this.props.location.search)
        queries[key] = newVal
        this.props.history.push({
            pathname: '/auction/active',
            search: encodeQueries(queries)
        })
    }

    componentDidMount() {
        let queries = parseQueries(this.props.location.search)
        this.updateAuctions().then(auctions => {
            queries.allAuctions = auctions
            queries.loading = false
            queries.lastUpdated = 0
            this.setState(queries)
            assembleFinishedAuctions(auctions).then(r => {
            })
        })
        this.refreshTimer = setInterval(() => {
            const lastUpdated = this.state.lastUpdated
            let newLastUpdate = lastUpdated + 10
            if (lastUpdated > updatePeriod) {
                this.updateAuctions().then(auctions => {
                    this.setState({allAuctions: auctions, lastUpdated: 0, loading: false})
                })
            } else this.setState({lastUpdated: newLastUpdate})
        }, 10000);
        document.addEventListener('scroll', this.trackScrolling); // add event listener
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState(parseQueries(nextProps.location.search))
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling); // removing event listener
        if (this.refreshTimer !== undefined) {
            clearInterval(this.refreshTimer);
        }
    }

    async updateAuctions() {
        const block = await currentBlock()
        let boxes
        if (this.state.specific) {
            boxes = [await followAuction(this.state.boxId)]
        } else {
            boxes = await getAllActiveAuctions()
        }
        const auctions = await decodeBoxes(boxes, block)
        return auctions
    }

    filterAuctions(auctions, forceType = null) {
        const artist = this.state.artist
        let type = this.state.type
        if (forceType) type = forceType
        if (artist !== undefined) {
            auctions = auctions.filter(auc => artist.split(',').includes(auc.artist))
        }

        let finalValue = this.state.searchValue
        if (finalValue !== '') {
            var re = new RegExp(finalValue, 'i');
            auctions = auctions.filter(data =>
                data.description.match(re) !== null ||
                data.tokenName.match(re) !== null ||
                data.artist.search(finalValue) !== -1 ||
                data.bidder.search(finalValue) !== -1
            )
        }


        if (type === 'all') return auctions
        if (type) auctions = auctions.filter(auc => auc.type === type)
        return auctions
    }

    sortAuctions(auctions, forceKey = null) {
        let key = this.state.sortKey.toString()
        if (forceKey) key = forceKey
        if (key === '0')
            auctions.sort((a, b) => a.remTimeTimestamp - b.remTimeTimestamp)
        else if (key === '1')
            auctions.sort((a, b) => b.remTimeTimestamp - a.remTimeTimestamp)
        else if (key === '2')
            auctions.sort((a, b) => {
                if (a.curBid < a.minBid) return 1
                if (b.curBid < b.minBid) return -1
                else return b.curBid - a.curBid
            })
        else if (key === '3')
            auctions.sort((a, b) => {
                if (a.curBid < a.minBid) return 1
                if (b.curBid < b.minBid) return -1
                else return a.curBid - b.curBid
            })
        else if (key === '4')
            auctions.sort((a, b) => {
                if (a.curBid < a.minBid) return 1
                if (b.curBid < b.minBid) return -1
                return b.creationHeight - a.creationHeight
            })
        else if (key === '5' && isWalletSaved())
            auctions.sort((a, b) => (b.seller === getWalletAddress()) - (a.seller === getWalletAddress()))
        else if (key === '6' && isWalletSaved())
            auctions.sort((a, b) => (b.bidder === getWalletAddress()) - (a.bidder === getWalletAddress()))
        else if (key === '7')
            auctions.sort((a, b) => (b.isFav - a.isFav))
        else if (key === '8')
            auctions.sort((a, b) => (b.currency === 'ERG') - (a.currency === 'ERG'))
        else if (key === '9')
            auctions.sort((a, b) => (b.currency !== 'ERG') - (a.currency !== 'ERG'))
        // console.log('yay', auctions)
        return auctions
    }

    calcValues(auctions) {
        let values = {ERG: 0}
        auctions.forEach(bx => {
            if (bx.curBid >= bx.minBid) {
                if (!Object.keys(values).includes(bx.currency))
                    values[bx.currency] = 0
                values[bx.currency] += bx.curBid
            }
        })
        return values
    }

    friendlyArtist() {
        return this.state.artist.split(',').map(artist => friendlyAddress(artist, 3))
            .join(' - ')
    }

    getToShow() {
        const auctions = this.state.allAuctions;
        const filtered = this.filterAuctions(auctions);
        return this.sortAuctions(filtered)
    }

    getHottest() {
        // const pictureAuctions = this.filterAuctions(this.state.allAuctions, 'picture')
        // const artworkAuctions = this.filterAuctions(this.state.allAuctions.filter(auc => auc.isArtwork && auc.minBid <= auc.curBid))
        // if (artworkAuctions.length >= 3)
        //     return this.sortAuctions(artworkAuctions, '4').slice(0, 5)
        return []
    }

    // setSelectedAuctions(auctions){
    //     this.setState({loading:true})
    //     setTimeout(()=>this.setState({selectedAuctions: selectedAuctions,loading:false}),1000) // SetTimeout For better UX 
    // }

    render() {
        let values = this.calcValues(this.filterAuctions(this.state.allAuctions))
        return (
            <Fragment>
                <Announcement
                    daysToLive={0}
                    secondsBeforeBannerShows={1}
                    title="Auction House Token ($AHT) and IDO"
                    subtitle="We have our IDO landing page and whitepaper ready. Click to check it out!"
                    link="https://ido.ergoauctions.org/"
                    imageSource={logo}
                />
                <div className="app-page-title">
                    <div className="page-title-wrapper">
                        <div className="page-title-heading">
                            <div
                                className={cx('page-title-icon', {
                                    'd-none': false,
                                })}
                            >
                                {
                                    this.state.type === "audio" ?
                                        <i className="pe-7s-volume2  icon-gradient bg-night-fade"
                                           style={{fontSize: 56}}/>
                                        :
                                        <i className="pe-7s-photo  icon-gradient bg-night-fade" style={{fontSize: 56}}/>

                                }
                            </div>
                            <div>
                                Active Auctions {this.state.type && this.state.type !== 'all' &&
                            <text>- {this.state.type}</text>}
                                <div
                                    className={cx('page-title-subheading', {
                                        'd-none': false,
                                    })}
                                >
                                    Updated {this.state.lastUpdated}{' '}
                                    seconds ago.
                                </div>
                                {this.state.artist && <div
                                    className={cx('page-title-subheading', {
                                        'd-none': false,
                                    })}
                                >
                                    <b>Artist: {this.friendlyArtist()}</b>
                                </div>}
                                <div
                                    className={cx('page-title-subheading', {
                                        'd-none': false,
                                    })}
                                >
                                    <b>{this.getToShow().length} active auctions with worth of: <br/></b>
                                    <b>{longToCurrency(values.ERG, -1, 'ERG')} <i>ERG</i></b>
                                    {Object.keys(values).filter(key => key !== 'ERG').map(key =>
                                        <b>{', '}{longToCurrency(values[key], -1, key)} <i>{key}</i></b>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="page-title-actions">
                            <TitleComponent2/>
                        </div>
                    </div>
                    <div>
                        <Row>
                            <Col className='text-right'>
                                <b><a href='https://v1.ergoauctions.org/' target='_blank'>Make sure to check out the V1 auctions!</a></b>
                            </Col>
                        </Row>
                    </div>
                </div>
                {/*{!this.state.loading && this.getHottest().length > 0 && <div*/}
                {/*    className="mb-xl-5 card mb-3 bg-white widget-chart"*/}
                {/*>*/}
                {/*    <div className='notArtwork'>*/}
                {/*        <b className='font-size-xlg text-primary'>Hot auctions</b>*/}
                {/*    </div>*/}
                {/*    <Coverflow*/}
                {/*        className='coverflow'*/}
                {/*        width={960}*/}
                {/*        height={550}*/}
                {/*        displayQuantityOfSide={2}*/}
                {/*        navigation={false}*/}
                {/*        enableHeading={true}*/}
                {/*        enableScroll={false}*/}
                {/*    >*/}
                {/*        {this.getHottest().map(hot => {*/}
                {/*            // return <img style={{position: "relative"}} src={hot.artworkUrl} alt={hot.tokenName}*/}
                {/*            //      data-action={getAuctionUrl(hot.boxId)}/>*/}
                {/*            return <ArtworkMedia box={hot} height='100%' width='100%'*/}
                {/*                                 avoidDetail={true}*/}
                {/*                                 avoidFav={true}*/}
                {/*                                 alt={hot.tokenName}*/}
                {/*                                 data-action={getAuctionUrl(hot.boxId)}/>*/}
                {/*        })}*/}
                {/*        /!*data-action="http://tw.yahoo.com"/>*!/*/}
                {/*    </Coverflow>*/}
                {/*</div>}*/}
                {!this.state.loading && <div>
                    <Row>
                        <Col className='text-right'>
                            <UncontrolledButtonDropdown>
                                <DropdownToggle caret outline className="mb-2 mr-2 border-0 font-size-lg"
                                                color="primary">
                                    <i className="nav-link-icon lnr-sort-amount-asc"> </i>
                                    {sortKeyToVal[this.state.sortKey]}
                                </DropdownToggle>
                                <DropdownMenu>
                                    {Object.keys(sortKeyToVal).map(sortKey => <DropdownItem
                                        onClick={() => {
                                            // this.sortAuctions([].concat(this.state.auctions), sortKey)
                                            this.updateParams('sortKey', sortKey)
                                        }}>{sortKeyToVal[sortKey]}</DropdownItem>)}
                                </DropdownMenu>

                            </UncontrolledButtonDropdown>


                            <UncontrolledButtonDropdown>
                                <DropdownToggle caret outline className="mb-2 mr-2 border-0 font-size-lg"
                                                color="primary">
                                    <i className="nav-link-icon pe-7s-filter"> </i>
                                    {this.state.type}
                                </DropdownToggle>
                                <DropdownMenu>
                                    {types.map(type => <DropdownItem
                                        onClick={() => {
                                            // this.sortAuctions([].concat(this.state.auctions), sortKey)
                                            this.updateParams('type', type)
                                        }}>{type}</DropdownItem>)}
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        </Col>
                    </Row>
                </div>}
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
                    <div className="page-list-container">
                        <ShowAuctions
                            auctions={this.getToShow().slice(0, this.state.end)}
                            updateParams={this.updateParams}
                        />
                    </div>
                )}
            </Fragment>
        );
    }
}

export default withRouter(ActiveAuctions)