import React, {Fragment} from 'react';
import cx from 'classnames';

import {connect} from 'react-redux';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import WalletModal from "./Components/WalletModal";
import {Col, Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink} from "reactstrap";
import nodeWallet from "../../assets/images/Ergo_auction_house_logo.png";

class Header extends React.Component {
    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll(event) {
        let header = document.getElementById("myHeader");
        let sticky = header.offsetTop;

        if (window.pageYOffset > sticky) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }
    }

    render() {
        let {
            headerBackgroundColor,
            enableMobileMenuSmall,
            enableHeaderShadow
        } = this.props;
        return (
            <Fragment>

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
                            <NavbarToggler/>
                            <Collapse navbar>
                                <Col md='10'>
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
                                </Col>
                                <Col md='2'>
                                    <div className='float-right'>
                                        <WalletModal/>
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

export default connect(mapStateToProps, mapDispatchToProps)(Header);