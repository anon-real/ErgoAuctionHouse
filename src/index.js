import React from 'react';
import ReactDOM from 'react-dom';
// import registerServiceWorker from './registerServiceWorker';
import {unregister} from './registerServiceWorker';

import {HashRouter} from 'react-router-dom';
import './assets/base.css';
import Main from './AuctionPages/Main';
import configureStore from './config/configureStore';
import {Provider} from 'react-redux';
import {currentHeight, getBoxesForAsset,} from './auction/explorer';
import {showMsg} from './auction/helpers';
import {handleAll, pendings} from "./auction/assembler";
import {additionalData, auctionNFT} from "./auction/consts";

const store = configureStore();
const rootElement = document.getElementById('root');

const renderApp = (Component) => {
    handleAll().then(res => {})
    setInterval(() => {
        handleAll().then(res => {})
    }, 60000);

    ReactDOM.render(
        <Provider store={store}>
            <HashRouter>
                <Component/>
            </HashRouter>
        </Provider>,
        rootElement
    );
};

renderApp(Main);

if (module.hot) {
    module.hot.accept('./AuctionPages/Main', () => {
        const NextApp = require('./AuctionPages/Main').default;
        renderApp(NextApp);
    });
}
unregister();

// registerServiceWorker();
