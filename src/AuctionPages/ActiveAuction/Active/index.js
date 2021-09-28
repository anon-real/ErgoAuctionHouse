import React, {Fragment} from 'react';
import Coverflow from 'react-coverflow';

import {currentBlock, followAuction, getAllActiveAuctions,} from '../../../auction/explorer';
import {friendlyAddress, getAuctionUrl, getWalletAddress, isWalletSaved, showMsg,} from '../../../auction/helpers';
import {css} from '@emotion/core';
import PropagateLoader from 'react-spinners/PropagateLoader';
import {assembleFinishedAuctions} from "../../../auction/assembler";
import {
    Button,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    UncontrolledButtonDropdown,
} from 'reactstrap';
import cx from 'classnames';
import TitleComponent2 from '../../../Layout/AppMain/PageTitleExamples/Variation2';
import {decodeBoxes, longToCurrency,} from '../../../auction/serializer';
import NewAuctionAssembler from "./newAuctionAssembler";
import ShowAuctions from "./showActives";
import SendModal from "./sendModal";
import {withRouter} from 'react-router-dom';
import ArtworkMedia from "../../artworkMedia";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCoffee} from "@fortawesome/free-solid-svg-icons";

const override = css`
  display: block;
  margin: 0 auto;
`;

const sortKeyToVal = {
    '0': 'Lowest remaining time',
    '1': 'Highest remaining time',
    '2': 'Highest price',
    '3': 'Lowest price',
    '4': 'Latest bids',
    '5': 'Me As Seller First',
    '6': 'Me As Bidder First',
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
            searchValue:'',
            selectedAuctions:[]
        };
        this.openAuction = this.openAuction.bind(this);
        this.sortAuctions = this.sortAuctions.bind(this);
        this.filterAuctions = this.filterAuctions.bind(this);
        this.toggleAssemblerModal = this.toggleAssemblerModal.bind(this);
        this.trackScrolling = this.trackScrolling.bind(this);
        this.updateParams = this.updateParams.bind(this);
        this.getToShow = this.getToShow.bind(this);
        this.getHottest = this.getHottest.bind(this);
        this.SubmitSearchAuctions = this.SubmitSearchAuctions.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
    }

    toggleAssemblerModal(address = '', bid = 0, isAuction = false, currency = 'ERG') {
        this.setState({
            assemblerModal: !this.state.assemblerModal,
            bidAddress: address,
            bidAmount: bid,
            isAuction: isAuction,
            currency: currency
        });
    }

    openAuction() {
        if (!isWalletSaved()) {
            showMsg(
                'In order to create a new auction, configure a wallet first.',
                true
            );
        } else {
            this.setState({
                modalAssembler: !this.state.modalAssembler,
            })
        }
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

    parseQueries(query) {
        let queries = query.slice(1).split('&')
        let queryMp = {}
        queries.forEach(query => {
            let cur = query.split('=')
            if (cur[0].length > 0)
                queryMp[cur[0]] = cur[1]
        })
        if (!Object.keys(queryMp).includes('artist'))
            queryMp['artist'] = undefined
        return queryMp
    }

    encodeQueries(queries) {
        return Object.keys(queries).filter(key => queries[key]).map(key => `${key}=${queries[key]}`).join('&')
    }

    updateParams(key, newVal) {
        let queries = this.parseQueries(this.props.location.search)
        queries[key] = newVal
        this.props.history.push({
            pathname: '/auction/active',
            search: this.encodeQueries(queries)
        })
    }

    componentDidMount() {
        let queries = this.parseQueries(this.props.location.search)
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
        this.setState(this.parseQueries(nextProps.location.search))
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

    filterAuctions(auctions, forceType=null) {
        const artist = this.state.artist
        let type = this.state.type
        if (forceType) type = forceType
        if (artist !== undefined) {

            auctions = auctions.filter(auc => artist.split(',').includes(auc.artist))
        }
        if (type === 'all') return auctions
        if (type) auctions = auctions.filter(auc => auc.type === type)
        return auctions
    }

    sortAuctions(auctions, forceKey=null) {
        let key = this.state.sortKey.toString()
        if (forceKey) key = forceKey
        if (key === '0')
            auctions.sort((a, b) => a.remTimeTimestamp - b.remTimeTimestamp)
        else if (key === '1')
            auctions.sort((a, b) => b.remTimeTimestamp - a.remTimeTimestamp)
        else if (key === '2')
            auctions.sort((a, b) => b.value - a.value)
        else if (key === '3')
            auctions.sort((a, b) => a.value - b.value)
        else if (key === '4')
            auctions.sort((a, b) => b.creationHeight - a.creationHeight)
        else if (key === '5' && isWalletSaved())
            auctions.sort((a, b) => (b.seller === getWalletAddress()) - (a.seller === getWalletAddress()))
        else if (key === '6' && isWalletSaved())
            auctions.sort((a, b) => (b.bidder === getWalletAddress()) - (a.bidder === getWalletAddress()))
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
        if(this.state.selectedAuctions){
            const auctions =  (this.state.selectedAuctions?.length !== 0) ? this.state.selectedAuctions.slice(0, this.state.end) : this.state.allAuctions.slice(0, this.state.end);
            const filtered = this.filterAuctions(auctions);
            return this.sortAuctions(filtered).slice(0, this.state.end)
        }else return []
    }

    getHottest() {
        // const pictureAuctions = this.filterAuctions(this.state.allAuctions, 'picture')
        const pictureAuctions = this.state.allAuctions
        if (pictureAuctions.length > 2)
            return this.sortAuctions(this.state.allAuctions, '4').slice(0, 5)
        return []
    }

    // setSelectedAuctions(auctions){
    //     this.setState({loading:true})
    //     setTimeout(()=>this.setState({selectedAuctions: selectedAuctions,loading:false}),1000) // SetTimeout For better UX 
    // }

    clearSearch(){
        this.setState({loading:false,searchValue:'',selectedAuctions:[]})
        this.updateParams('searchValue', '')
    }

    SubmitSearchAuctions(){
        let queries = this.parseQueries(this.props.location.search).searchValue
        let finalValue = (queries && queries !== '') ? queries : this.state.searchValue
        if(finalValue !== ''){
            let SelectedAuctions = [];
            var re = new RegExp(finalValue, 'i');
            this.state.allAuctions.map((data) => {
                console.log('Single',data)
                if(data.description.match(re)  !== null || 
                data.tokenName.match(re)  !== null ||
                data.artist.search(finalValue) !== -1 || 
                data.bidder.search(finalValue) !== -1)
                    SelectedAuctions.push(data)
            })
            if(SelectedAuctions.length === 0)
                SelectedAuctions = null;
            this.setState({selectedAuctions:SelectedAuctions})
        }
    }

    HandleSearch(){
        if(searchflagControl && this.state.allAuctions.length !== 0){
            this.SubmitSearchAuctions();
            searchflagControl = false;
        }
    }

    render() {
        let values = this.calcValues(this.filterAuctions(this.state.allAuctions))
        this.HandleSearch();
        return (
            <Fragment>
                <NewAuctionAssembler
                    isOpen={this.state.modalAssembler}
                    close={() => this.setState({modalAssembler: !this.state.modalAssembler})}
                    assemblerModal={this.toggleAssemblerModal}
                />

                <SendModal
                    isOpen={this.state.assemblerModal}
                    close={this.toggleAssemblerModal}
                    bidAmount={this.state.bidAmount}
                    isAuction={this.state.isAuction}
                    bidAddress={this.state.bidAddress}
                    currency={this.state.currency}
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
                                    Here you can see current active auctions.
                                    Last updated {this.state.lastUpdated}{' '}
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
                        <Container>
                            <Row>
                                <Col md='8'/>
                                <Col md='4' className='text-right'>
                                    <Button
                                        onClick={this.openAuction}
                                        outline
                                        className="btn-outline-lin m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-plus-circle"> </i>
                                        <span>New Auction</span>
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col className='text-right'>
                                    <UncontrolledButtonDropdown>
                                        <DropdownToggle caret outline className="mb-2 mr-2 border-0" color="primary">
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
                                        <DropdownToggle caret outline className="mb-2 mr-2 border-0" color="primary">
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
                        </Container>
                    </div>
                    <div className="search-container">
                        <div className="search-box">
                            <form className="d-flex justify-content-between align-items-center" onSubmit={(e)=>{
                                e.preventDefault();
                                this.SubmitSearchAuctions();
                            }}>
                                <input 
                                    disabled={false} 
                                    className="search-input ml-1" 
                                    placeholder="Search in the name, description, artist address, and bidder's address" 
                                    value={this.state.searchValue} 
                                    onChange={(e)=>{
                                        this.updateParams('searchValue', e.target.value)
                                        if(e.target.value === ''){
                                            this.setState({searchValue:e.target.value})
                                        }
                                    }}
                                />
                                <button className="search-icon-container" type="submit">
                                    <i className="lnr lnr-magnifier search-icon"/>
                                </button>
                            </form>
                        </div>
                        <div
                            className={cx('page-title-subheading d-flex flex-column flex-md-row align-items-center', {
                                'invisible': this.state.selectedAuctions?.length === 0,
                            })}
                        >
                            <button type="button" class="btn-outline-lin m-2 border-0 btn btn-outline-primary" onClick={this.clearSearch}>
                                <i class="lnr lnr-cross mr-2"/>
                                <span>Clear Search</span>
                            </button>
                        </div>
                    </div>
                </div>
                {/* {!this.state.loading && this.getHottest().length > 0  && <div
                    className="mb-xl-5"
                >
                    <Coverflow
                        className='coverflow'
                        width={960}
                        height={550}
                        displayQuantityOfSide={2}
                        navigation={false}
                        enableHeading={true}
                        enableScroll={false}
                    > */}
                        {/* {this.getHottest().map(hot => {
                            // return <img style={{position: "relative"}} src={hot.artworkUrl} alt={hot.tokenName}
                            //      data-action={getAuctionUrl(hot.boxId)}/>
                            return <ArtworkMedia box={hot} height='100%' width='100%'
                                                 avoidDetail={true}
                                                 avoidFav={true}
                                                 alt={hot.tokenName}
                                                 data-action={getAuctionUrl(hot.boxId)}/>
                        })} */}
                        {/*     data-action="http://tw.yahoo.com"/>*/}
                    {/* </Coverflow> */}
                {/* </div>} */}
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
                            auctions={this.getToShow()}
                            updateParams={this.updateParams}
                        />
                    </div>
                )}
            </Fragment>
        );
    }
}

export default withRouter(ActiveAuctions)