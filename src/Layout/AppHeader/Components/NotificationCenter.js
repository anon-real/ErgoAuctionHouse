import React, { useState, useEffect, useMemo } from 'react';
import cx from 'classnames';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import moment from "moment";

function NotificationCenter() {
    const [modal, setModal] = useState(false);
    const [unreadBadge, setUnreadBadge] = useState(null);
    let NotificationList = JSON.parse(localStorage.getItem('notification'));

    useEffect(() => {
        if (NotificationList === null)
            localStorage.setItem(
                'notification',
                JSON.stringify({ data: [], unread: 0 })
            );
    }, []);

    function toggle() {
        let NotificationList = JSON.parse(localStorage.getItem('notification'));
        if (NotificationList) NotificationList.unread = 0;
        localStorage.setItem('notification', JSON.stringify(NotificationList));
        setUnreadBadge(null);
        setModal(!modal);
    }

    function ConvertDate(time) {
        return moment(time).format('lll');
    }

    function IconList(stat) {
        switch (stat) {
            case 'success':
                return 'text-success lnr lnr-checkmark-circle';
            case 'error':
                return 'text-danger lnr lnr-cross-circle';
            default:
                return 'text-info lnr lnr-question-circle';
        }
    }

    const badge = useMemo(
        () =>
            unreadBadge ? (
                <div
                    className={cx('notificationBadge', {
                        'd-none': unreadBadge === 0,
                    })}
                >
                    {unreadBadge}
                </div>
            ) : null,
        [unreadBadge]
    );

    setInterval(() => {
        setUnreadBadge(JSON.parse(localStorage.getItem('notification')).unread);
    }, 5000);

    return (
        <>
            <div
                className="notificationContainer"
                onClick={() => setModal(true)}
            >
                <span className="notificationIcon lnr lnr-alarm"></span>
                {badge}
            </div>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Notification Center</ModalHeader>
                <ModalBody className="px-0 pt-0">
                    <div className="notificationModalBody">
                        {NotificationList !== null ? (
                            <>
                                {NotificationList.data
                                    .reverse()
                                    .map((data, index) => (
                                        <div
                                            className="notificationItem"
                                            key={index}
                                            onClick={() =>
                                                window.open(data.link, '_blank')
                                            }
                                        >
                                            <div className="notificationItemContainer">
                                                <span
                                                    className={
                                                        IconList(data.status) +
                                                        ' pt-1'
                                                    }
                                                ></span>
                                                <div className="d-flex flex-column ml-2 pr-1">
                                                    <span className="notificationItemMessage">
                                                        {data.message}
                                                    </span>
                                                    <span className="notificationItemDate">
                                                        {ConvertDate(data.time)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className={cx(
                                                    'notificationItemButton',
                                                    {
                                                        'd-none': !data.link,
                                                    }
                                                )}
                                            >
                                                <span class="lnr lnr-chevron-right ml-2"></span>
                                            </div>
                                        </div>
                                    ))}
                                <div
                                    className={cx('my-auto', {
                                        'd-none':
                                            NotificationList.data.length !== 0,
                                    })}
                                >
                                    No Notification Available
                                </div>
                            </>
                        ) : null}
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
}

export default NotificationCenter;
