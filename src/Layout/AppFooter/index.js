import React, {Fragment} from 'react';
import ergo from "../../assets/images/symbol_bold__1080px__black.svg";
import github from "../../assets/images/GitHub-Mark.png";

class AppFooter extends React.Component {
    render() {


        return (
            <Fragment>
                <div className="app-footer">
                    <div className="app-footer__inner">
                        <div className="app-footer-right">
                            <ul className="nav">
                                <li className="nav-item">
                                    <a target='_blank' href="https://ergoplatform.org/en/" className="nav-link">
                                        <img
                                            className='mr-2'
                                            style={{height: '20px', width: '20px'}}
                                            src={ergo}
                                        />
                                        Ergo Platform
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a target='_blank' href="https://github.com/anon-real/ErgoAuction"
                                       className="nav-link">
                                        <img
                                            className='mr-2'
                                            style={{height: '20px', width: '20px'}}
                                            src={github}
                                        />
                                        Github
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}

export default AppFooter;