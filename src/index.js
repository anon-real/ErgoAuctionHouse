import React from 'react';
import ReactDOM from 'react-dom';
// import registerServiceWorker from './registerServiceWorker';
import { unregister } from './registerServiceWorker';

import { HashRouter } from 'react-router-dom';
import './assets/base.css';
import Main from './AuctionPages/Main';
import configureStore from './config/configureStore';
import { Provider } from 'react-redux';
import { handlePendingBids } from './auction/explorer';
import {unspentBoxes} from "./auction/nodeWallet";

const store = configureStore();
const rootElement = document.getElementById('root');

const renderApp = (Component) => {
    setInterval(handlePendingBids, 60000);
    ReactDOM.render(
        <Provider store={store}>
            <HashRouter>
                <Component />
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
