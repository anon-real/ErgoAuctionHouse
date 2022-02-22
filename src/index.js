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
import {addNotification, getForKey, isNotifSupported, notifyMe, setForKey, showMsg} from './auction/helpers';
import {handleAll, pendings} from "./auction/assembler";
import {additionalData, auctionNFT} from "./auction/consts";

const store = configureStore();
const rootElement = document.getElementById('root');

function handleUpdates() {
    let updates = getForKey('newUpdates')
    if (!updates.map(up => up.key).includes('twitter')) {
        updates = updates.concat([{
            key: 'twitter'
        }])
        setForKey(updates, 'newUpdates')
        addNotification('We now have an official twitter account. Big things are planned, follow to stay tuned!', 'https://twitter.com/ErgoAuction')
    }
}

const renderApp = (Component) => {
    handleAll().then(res => {})
    handleUpdates()
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

    document.addEventListener('DOMContentLoaded', function() {
        if (!isNotifSupported()) return
        if (!Notification) {
            return;
        }

        if (Notification.permission !== 'granted')
            Notification.requestPermission().then(r => console.log(r));
    });
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
