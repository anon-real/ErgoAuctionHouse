import React, {Fragment} from 'react';
import {connect} from 'react-redux';

import Hamburger from 'react-hamburgers';

import cx from 'classnames';

import {faEllipsisV,} from '@fortawesome/free-solid-svg-icons';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {Button} from 'reactstrap';

import {setEnableMobileMenu, setEnableMobileMenuSmall,} from '../../reducers/ThemeOptions';

class AppMobileMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    toggleMobileSidebar = () => {
        const {enableMobileMenu, setEnableMobileMenu} = this.props;
        setEnableMobileMenu(!enableMobileMenu);
    }


    toggleMobileSmall = () => {
        const {enableMobileMenuSmall, setEnableMobileMenuSmall} = this.props;
        setEnableMobileMenuSmall(!enableMobileMenuSmall);
    }

    render() {
        const { enableMobileMenu, enableMobileMenuSmall } = this.props;
        return (
            <Fragment>
                <div className="app-header__mobile-menu">
                    <div onClick={this.toggleMobileSidebar}>
                        <Hamburger
                            active={enableMobileMenu}
                            type="elastic"
                            onClick={this.toggleMobileSidebar}
                        />
                    </div>
                </div>
                <div className="app-header__menu">
                    <span onClick={this.toggleMobileSmall}>
                        <Button size="sm"
                                className={cx("btn-icon btn-icon-only", {active: enableMobileMenuSmall})}
                                color="primary"
                                onClick={this.toggleMobileSmall}>
                            <div className="btn-icon-wrapper"><FontAwesomeIcon icon={faEllipsisV}/></div>
                        </Button>
                    </span>
                </div>
            </Fragment>
        )
    }
}


const mapStateToProps = state => ({
    closedSmallerSidebar: state.ThemeOptions.closedSmallerSidebar,
    enableMobileMenu: state.ThemeOptions.enableMobileMenu,
    enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

const mapDispatchToProps = dispatch => ({

    setEnableMobileMenu: enable => dispatch(setEnableMobileMenu(enable)),
    setEnableMobileMenuSmall: enable => dispatch(setEnableMobileMenuSmall(enable)),

});

export default connect(mapStateToProps, mapDispatchToProps)(AppMobileMenu);