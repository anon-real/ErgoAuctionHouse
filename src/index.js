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
    if (!updates.map(up => up.key).includes('sigmavalley-start')) {
        updates = updates.concat([{
            key: 'sigmavalley-start'
        }])
        setForKey(updates, 'newUpdates')
        addNotification('SigmaVally\'s second plot sale is now live! Click to see the verified NFTs.', 'https://ergoauctions.org/#/auction/active?type=picture&artist=9gdD4EmYjvKXCzgsQNHVFwcFrQ5vxqCWf6k2i4tFn7zwQhDATo8')
    }
    if (!updates.map(up => up.key).includes('ergold')) {
        updates = updates.concat([{
            key: 'ergold'
        }])
        setForKey(updates, 'newUpdates')
        addNotification(''Ergold is now a supported currency in the ergo auction house.', 'https://explorer.ergoplatform.com/en/token/e91cbc48016eb390f8f872aa2962772863e2e840708517d1ab85e57451f91bed')
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
