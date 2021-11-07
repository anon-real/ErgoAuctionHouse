import React, {Fragment} from 'react';

import PageTitle from '../../Layout/AppMain/PageTitle';
import Faq from 'react-faq-component';
import {additionalData} from "../../auction/consts";

const data = {
    rows: [
        {
            title: 'What is the auction fee?',
            content: `If an auction is finished and has a winner, 2%
            of the final bid will go to the Ergo Auction House as compensation for its services and further development.`,
        },
        {
            title: 'What is the start fee?',
            content: `To prevent spams and reduce scams, there is a starting fee of 0.1 ERG for auctions.`
        },
        {
            title: 'How can I mint artworks',
            content: 'Setup your wallet first, then go to Owned Artworks section and click on Create Artwork.',
        },
        {
            title: 'What is the fee for minting an artwork?',
            content: 'There is no fee for minting new artworks.',
        },
        {
            title: 'I get "Not enough balance in the Yoroi wallet!"',
            content: 'If you think the message is not right, try to open your wallet and wait a few seconds for the transaction table to get updated. If you have some pending transactions, you should wait for them to be mined first.' +
                ' If the issue remains unresolved, send all your funds to one of your addresses and wait for it to be mined.',
        },
        {
            title: 'What tokens can I auction?',
            content: 'You can auction any token that you think is valuable somehow. Whether it is Artwork NFT, PoW-backed NFTs or it is representing some business shares, etc.',
        },
        {
            title: 'How do I know I can trust the Ergo Auction House?',
            content:
                'Ergo Auction House is community-driven and open source.' +
                'The code, smart contracts and proxy contract are all audited and verifiable by all.'
        },
        {
            title: 'When is my wallet info used?',
            content:
                'Your wallet info will be used only when you confirm starting an auction or placing a bid on an existing one.',
        },
        {
            title: 'What happens to my funds when I place a bid?',
            content:
                'Your ERGs or any other currencies, will be locked in the auction smart contract. If you win the auction,' +
                'they will be sent to the seller in the same transaction that will send you your NFT/token. If you get outbidded,' +
                ' your funds will be immediately returned to your wallet.',
        },
        {
            title: 'What happens if I start an auction but no one else bids?',
            content:
                'You\'ll receive your token back while not being charged with any fees (other than the starting fee).',
        },
    ],
};

export default class Faqs extends React.Component {
    render() {
        return (
            <Fragment>
                <div>
                {/*<PageTitle*/}
                {/*    heading="FAQ"*/}
                {/*    subheading=""*/}
                {/*    icon="pe-7s-attention icon-gradient bg-night-fade"*/}
                {/*/>*/}
                <Faq
                    data={data}
                    styles={{
                        bgColor: '#fff',
                        titleTextColor: '#48482a',
                        rowTitleColor: '#444457',
                        rowTitleTextSize: 'large',
                        rowContentColor: '#48484a',
                        rowContentTextSize: '16px',
                        rowContentPaddingTop: '10px',
                        rowContentPaddingBottom: '10px',
                        rowContentPaddingLeft: '50px',
                        rowContentPaddingRight: '150px',
                        arrowColor: 'black',
                    }}
                />
                </div>
            </Fragment>
        );
    }
}
