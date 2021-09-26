import React, {Fragment} from 'react';
import cx from 'classnames';

import {connect} from 'react-redux';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import HeaderLogo from '../AppLogo';
import WalletModal from "./Components/WalletModal";
import {ActiveNav, HistoryNav,About} from '../AppNav/NavItems';
import nodeWallet from "../../assets/images/symbol_bold__1080px__black.svg";

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
                    className={cx("app-header", headerBackgroundColor, {'header-shadow': enableHeaderShadow})}
                    transitionName="HeaderAnimation"
                    transitionAppear={true}
                    transitionAppearTimeout={1500}
                    transitionEnter={false}
                    transitionLeave={false}>

                    <HeaderLogo/>

                    <div className={cx(
                        "app-header__content",
                        {'header-mobile-open': enableMobileMenuSmall},
                    )}>
                        <div className="float-left nav-logo">
                            <a href='/' style={{ textDecoration: 'none'}}>
                                {/*<div className="logo-src"/>*/}
                                <img
                                    style={{ height: '40px', width: '40px' }}
                                    src={nodeWallet}
                                />
                                <strong className="ml-2 text-dark">  Auction House</strong>
                            </a>
                        </div>
                        <div className="app-header-right">
                        
                        <div>
                            <div className="dropdown d-inline-block mr-3 mb-2 bg-nav">
                                <button type="button" className="btn dropdown-toggle" data-toggle="dropdown">
                                    {ActiveNav[0].label}
                                </button>
                                <div className="dropdown-menu bg-nav">
                                { ActiveNav[0].content.map(val=>(
                                    <a className="dropdown-item" key={val.to} href={val.to}>{val.label}</a>
                                ))}
                                </div>
                            </div>
                            <div className="d-inline-block mr-3 mb-2 bg-nav">
                                <a className="btn" href={HistoryNav[0].to}>{HistoryNav[0].label}</a>
                            </div>
                            <div className="d-inline-block mr-3 mb-2 bg-nav">
                                <a className="btn" href={About[0].to}>{About[0].label}</a>
                            </div>
                            </div>
                            <WalletModal/>
                        </div>
                    </div>
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