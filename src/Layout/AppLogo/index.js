import React, {Fragment} from 'react';
import {connect} from 'react-redux';

import Hamburger from 'react-hamburgers';

import AppMobileMenu from '../AppMobileMenu';

import {setEnableClosedSidebar, setEnableMobileMenu, setEnableMobileMenuSmall,} from '../../reducers/ThemeOptions';
import nodeWallet from "../../assets/images/Ergo_auction_house_logo.png";

class HeaderLogo extends React.Component {
    state = {
        openLeft: false,
        openRight: false,
        relativeWidth: false,
        width: 280,
        noTouchOpen: false,
        noTouchClose: false,
    };

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

    render() {
        let {
            enableClosedSidebar,
        } = this.props;

        const {} = this.state;

        return (
            <Fragment>
                <div className="app-header__logo">
                    <a href='/' style={{textDecoration: 'none'}} className='logo-src'>
                        <img
                            style={{height: '40px'}}
                            src={nodeWallet}
                        />
                    </a>
                    <div className="header__pane ml-auto">
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