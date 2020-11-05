import React from 'react';
import ReactDOM from 'react-dom';
// import registerServiceWorker from './registerServiceWorker';
import {unregister} from './registerServiceWorker';

import {HashRouter} from 'react-router-dom';
import './assets/base.css';
import Main from './AuctionPages/Main';
import configureStore from './config/configureStore';
import {Provider} from 'react-redux';
import {
    auctionNFT,
    dataInputAddress,
    additionalData,
    handlePendingBids,
    unspentBoxesFor, currentHeight,
} from './auction/explorer';
import {showMsg} from './auction/helpers';
import {bidFollower} from "./auction/assembler";

const store = configureStore();
const rootElement = document.getElementById('root');

const renderApp = (Component) => {
    function updateDataInput() {
        unspentBoxesFor(dataInputAddress)
            .then((res) => {
                return res.filter(
                    (box) =>
                        box.assets.length > 0 &&
                        box.assets[0].tokenId === auctionNFT
                );
            })
            .then((res) => (additionalData['dataInput'] = res[0]))
            .catch(() =>
                showMsg(
                    'Could not load data input from explorer...',
                    false,
                    true
                )
            );
    }

    updateDataInput();
    setInterval(() => {
        currentHeight().then(height => {
            handlePendingBids(height);
        })
    }, 60000);
    setInterval(() => {
        updateDataInput();
    }, 120000);
    setInterval(() => {
        bidFollower();
    }, 20000);

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
