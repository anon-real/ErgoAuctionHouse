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
        to: '#/auction/active?type=all'
    },
];

export const MyArtworks = [
    {
        icon: 'pe-7s-diamond',
        label: 'Owned Artworks',
        to: '#/owned'
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
