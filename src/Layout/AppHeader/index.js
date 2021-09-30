import React, {Fragment} from 'react';
import cx from 'classnames';

import {connect} from 'react-redux';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import WalletModal from "./Components/WalletModal";
import {Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink} from "reactstrap";
import nodeWallet from "../../assets/images/Ergo_auction_house_logo.png";

class Header extends React.Component {
    render() {
        let {
            headerBackgroundColor,
            enableMobileMenuSmall,
            enableHeaderShadow
        } = this.props;
        return (
            <Fragment>
                <ReactCSSTransitionGroup
                    component="div"
                    className={cx("app-header", false, {'header-shadow': true}, "p-2")}
                    transitionName="HeaderAnimation"
                    transitionAppear={true}
                    transitionAppearTimeout={1500}
                    transitionEnter={false}
                    transitionLeave={false}>

                    <div className={cx(
                        "app-header__content",
                        {'header-mobile-open': enableMobileMenuSmall},
                    )}>
                        <div className="app-header-left">
                            {/*<MetisMenu content={ActiveNav} activeLinkFromLocation className="vertical-nav-menu" iconNamePrefix=""*/}
                            {/*           classNameStateIcon="pe-7s-angle-down"/>*/}
                            {/*<MetisMenu content={HistoryNav} activeLinkFromLocation className="vertical-nav-menu" iconNamePrefix=""*/}
                            {/*           classNameStateIcon="pe-7s-angle-down"/>*/}
                            {/*<MetisMenu content={MyArtworks} activeLinkFromLocation className="vertical-nav-menu" iconNamePrefix=""*/}
                            {/*           classNameStateIcon="pe-7s-angle-down"/>*/}
                            {/*<div className="divider text-muted opacity-2"/>*/}
                            {/*<MetisMenu content={About} activeLinkFromLocation className="vertical-nav-menu" iconNamePrefix=""*/}
                            {/*           classNameStateIcon="pe-7s-angle-down"/>*/}
                            <Navbar color="white" light expand="md">
                                <NavbarBrand href="/">
                                    <img
                                        style={{height: '30px'}}
                                        src={nodeWallet}
                                    />

                                </NavbarBrand>
                                {/*<a href='/' style={{textDecoration: 'none'}} className='logo-src'>*/}
                                {/*</a>*/}
                                <NavbarToggler/>
                                <Collapse navbar>
                                    <Nav className="mr-auto" navbar>
                                        <NavItem>
                                            <NavLink href="#/auction/active?type=all"
                                                     active={window.location.href.includes("#/auction/active")}>Active
                                                Auctions</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink href="#/owned"
                                                     active={window.location.href.includes("#/owned")}
                                            >Owned Artworks</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink href="#/auction/history"
                                                     active={window.location.href.includes("#/auction/history")}
                                            >History</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink href="#/faq"
                                                     active={window.location.href.includes("#/faq")}
                                            >
                                                FAQ
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                </Collapse>
                            </Navbar>
                        </div>
                    </div>

                    <WalletModal/>
                </ReactCSSTransitionGroup>
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

export default connect(mapStateToProps, mapDispatchToProps)(Header);