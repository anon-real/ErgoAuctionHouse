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
    currentHeight, getBoxesForAsset,
    handlePendingBids,
    unspentBoxesFor,
} from './auction/explorer';
import {showMsg} from './auction/helpers';
import {bidFollower} from "./auction/assembler";
import {additionalData, auctionNFT} from "./auction/consts";
import {ttest} from "./auction/serializer";

const store = configureStore();
const rootElement = document.getElementById('root');

const renderApp = (Component) => {
    ttest()
    function updateDataInput() {
        getBoxesForAsset(auctionNFT)
            .then((res) => (additionalData['dataInput'] = res.items[0]))
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
    }, 15000);

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
