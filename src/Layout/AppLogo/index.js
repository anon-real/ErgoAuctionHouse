import React, {Fragment} from 'react';
import {connect} from 'react-redux';

import Hamburger from 'react-hamburgers';

import AppMobileMenu from '../AppMobileMenu';

import {setEnableClosedSidebar, setEnableMobileMenu, setEnableMobileMenuSmall,} from '../../reducers/ThemeOptions';
import nodeWallet from "../../assets/images/symbol_bold__1080px__white.png";

class HeaderLogo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            mobile: false,
            activeSecondaryMenuMobile: false
        };
    }

    componentDidMount() {
        this.props.setEnableClosedSidebar(true)
    }

    toggleEnableClosedSidebar = () => {
        let {enableClosedSidebar, setEnableClosedSidebar} = this.props;
        setEnableClosedSidebar(!enableClosedSidebar);
    }

    state = {
        openLeft: false,
        openRight: false,
        relativeWidth: false,
        width: 280,
        noTouchOpen: false,
        noTouchClose: false,
    };

    render() {
        let {
            enableClosedSidebar,
        } = this.props;

        const {
        } = this.state;

        return (
            <Fragment>
                <div className="app-header__logo">
                    <a href='/' style={{ textDecoration: 'none'}} className='logo-src'>
                        {/*<div className="logo-src"/>*/}
                        <img
                            style={{ height: '40px', width: '40px' }}
                            src={nodeWallet}
                        />
                        <strong className="ml-2 text-white">  Auction House</strong>
                    </a>
                    <div  className="header__pane ml-auto">
                        <div onClick={this.toggleEnableClosedSidebar}>
                            <Hamburger
                                active={enableClosedSidebar}
                                type="elastic"
                                onClick={() => this.setState({active: !this.state.active})}
                            />
                        </div>
                    </div>
                </div>
                <AppMobileMenu/>
            </Fragment>
        )
    }
}


const mapStateToProps = state => ({
    enableClosedSidebar: state.ThemeOptions.enableClosedSidebar,
    enableMobileMenu: state.ThemeOptions.enableMobileMenu,
    enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

const mapDispatchToProps = dispatch => ({

    setEnableClosedSidebar: enable => dispatch(setEnableClosedSidebar(enable)),
    setEnableMobileMenu: enable => dispatch(setEnableMobileMenu(enable)),
    setEnableMobileMenuSmall: enable => dispatch(setEnableMobileMenuSmall(enable)),

});

export default connect(mapStateToProps, mapDispatchToProps)(HeaderLogo);