import React, {Fragment} from 'react';
import HistoryBox from './historyBox';
import {Row} from 'react-bootstrap';

export default class ShowHistories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boxes: props.boxes,
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({boxes: nextProps.boxes})
    }

    render() {
        return (
            <Fragment>
                <Row>
                    {this.state.boxes.map((box) => {
                        return <HistoryBox box={box}/>;
                    })}
                </Row>
            </Fragment>
        );
    }
}
