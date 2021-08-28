import React from 'react'

export default class BookmarkActions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            auctions: [],
        };
        this.refreshInfo = this.refreshInfo.bind(this);
        this.openAuction = this.openAuction.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.toggleAssemblerModal = this.toggleAssemblerModal.bind(this);
    }
}