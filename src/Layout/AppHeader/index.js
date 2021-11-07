import React, {Fragment} from 'react';
import cx from 'classnames';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import WalletModal from "./Components/WalletModal";
import {
    Col,
    Collapse,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    NavItem,
    NavLink,
    UncontrolledButtonDropdown
} from "reactstrap";
import nodeWallet from "../../assets/images/Ergo_auction_house_logo.png";
import {Row} from "react-bootstrap";
import {encodeQueries, isWalletSaved, parseQueries, showMsg} from "../../auction/helpers";
import NewAuctionAssembler from "../../AuctionPages/ActiveAuction/Active/newAuctionAssembler";
import SendModal from "../../AuctionPages/ActiveAuction/Active/sendModal";
import NewArtwork from "../../AuctionPages/Owned/newArtwork";
import {withRouter} from "react-router-dom";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.openAuction = this.openAuction.bind(this);
        this.toggleAssemblerModal = this.toggleAssemblerModal.bind(this);
        this.updateParams = this.updateParams.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState(parseQueries(nextProps.location.search))
    }

    handleScroll(event) {
        let header = document.getElementById("myHeader");
        let sticky = header.offsetTop;

        if (window.pageYOffset > sticky + 60) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }
    }

    openAuction() {
        if (!isWalletSaved()) {
            showMsg(
                'In order to create a new auction, configure your wallet first.',
                true
            );
        } else {
            this.setState({
                auctionModal: !this.state.auctionModal,
            })
        }
    }

    openArtwork() {
        if (!isWalletSaved()) {
            showMsg(
                'In order to create a new artwork, configure your wallet first.',
                true
            );
        } else {
            this.setState({
                newArtworkModal: !this.state.newArtworkModal,
            })
        }
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

    updateParams(key, newVal) {
        let queries = parseQueries(this.props.location.search)
        queries[key] = newVal
        this.props.history.push({
            pathname: '/auction/active',
            search: encodeQueries(queries)
        })
    }

    render() {
        let {
            headerBackgroundColor,
            enableMobileMenuSmall,
            enableHeaderShadow
        } = this.props;
        return (
            <Fragment>
                <NewAuctionAssembler
                    isOpen={this.state.auctionModal}
                    close={() => this.setState({auctionModal: !this.state.auctionModal})}
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

                <NewArtwork
                    sendModal={this.toggleAssemblerModal}
                    isOpen={this.state.newArtworkModal}
                    close={() => this.setState({newArtworkModal: !this.state.newArtworkModal})}/>


                <div id='myHeader' style={{zIndex: '10'}}>
                    <ReactCSSTransitionGroup
                        component="div"
                        className={cx("app-header", false, {'header-shadow': true})}
                        transitionName="HeaderAnimation"
                        transitionAppear={true}
                        transitionAppearTimeout={150}
                        transitionEnter={false}
                        transitionLeave={false}>
                        <Navbar color="white" light expand="md">
                            <NavbarBrand href="/">
                                <img
                                    style={{height: '40px'}}
                                    src={nodeWallet}
                                />

                            </NavbarBrand>
                            <NavbarToggler onClick={() => this.setState({isOpen: !this.state.isOpen})}/>
                            <Collapse isOpen={this.state.isOpen} navbar>
                                <Col md='9'>
                                    <Nav className="mr-auto" navbar>
                                        <NavItem>
                                            <NavLink href="#/auction/active?type=all"
                                                     active={window.location.href.includes("#/auction/active")}>Active
                                                Auctions</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink href="#/auction/history"
                                                     active={window.location.href.includes("#/auction/history")}
                                            >Past Auctions</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink href="#/owned"
                                                     active={window.location.href.includes("#/owned")}
                                            >Owned Artworks</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink href="#/faq"
                                                     active={window.location.href.includes("#/faq")}
                                            >
                                                FAQ
                                            </NavLink>
                                        </NavItem>
                                        {/*<div className="search-container">*/}
                                        <div className="search-box">
                                            <form className="d-flex justify-content-between align-items-center"
                                                  onSubmit={(e) => {
                                                      e.preventDefault();
                                                      this.updateParams('searchValue', this.state.searchValue)
                                                  }}>
                                                {/*< className="">*/}
                                                <input
                                                    placeholder="Search in name, description and addresses"
                                                    value={this.state.searchValue}
                                                    onChange={(e) => {
                                                        this.setState({searchValue: e.target.value})
                                                    }}
                                                />
                                                    <button className="search-icon-container" type="submit">
                                                        {/*<i className="lnr lnr-magnifier search-icon"/>*/}
                                                        <span className="lnr lnr-magnifier font-size-lg"/>
                                                    </button>
                                            </form>
                                        </div>
                                        {/*</div>*/}
                                    </Nav>
                                </Col>
                                <Col md='3'>
                                    <div className='float-right'>
                                        <Row>
                                            <UncontrolledButtonDropdown>
                                                <DropdownToggle outline className="border-0 mr-2 font-size-lg"
                                                                color="none">
                                                    <span className="notificationIcon pe-7s-plus font-weight-bold"/>
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <DropdownItem
                                                        onClick={() => {
                                                            this.openAuction()
                                                        }}>New Auction</DropdownItem>
                                                    <DropdownItem
                                                        onClick={() => this.openArtwork()}>Create Artwork</DropdownItem>
                                                </DropdownMenu>

                                            </UncontrolledButtonDropdown>
                                            <WalletModal/>
                                        </Row>
                                    </div>
                                </Col>

                            </Collapse>
                        </Navbar>
                    </ReactCSSTransitionGroup>
                </div>

            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    enableHeaderShadow: state.ThemeOptions.enableHeaderShadow,
    closedSmallerSidebar: state.ThemeOptions.closedSmallerSidebar,
    headerBackgroundColor: state.ThemeOptions.headerBackgroundColor,
    enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

const mapDispatchToProps = dispatch => ({});

// export default connect(mapStateToProps, mapDispatchToProps)(Header);
export default withRouter(Header)
