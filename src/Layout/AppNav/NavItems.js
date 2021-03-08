import React from "react";

export const HistoryNav = [
    {
        icon: 'pe-7s-wristwatch',
        label: 'Auction History',
        to: '#/auction/history',
    },
];

export const ActiveNav = [
    {
        icon: 'pe-7s-volume2',
        label: 'Auctions',
        content: [
            {
                to: '#/auction/active?type=picture',
                label: "Picture NFTs"
            },
            {
                to: '#/auction/active?type=audio',
                label: "Audio NFTs"
            },
            {
                to: '#/auction/active?type=other',
                label: "Other tokens"
            },

        ]
    },
];

export const Home = [
    {
        icon: 'pe-7s-home',
        label: 'Homepage',
        to: '#/home',
    },
];

export const About = [
    {
        icon: 'pe-7s-help1',
        label: 'FAQ',
        to: '#/faq',
    },
];
