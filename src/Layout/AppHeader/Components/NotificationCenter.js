import React,{useState, useEffect} from 'react'
import cx from 'classnames';
import {
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap';

function NotificationCenter(){
    const [unRead ,setUnRead] = useState(false);
    const [modal ,setModal] = useState(false)
    let NotificationList = JSON.parse(localStorage.getItem('notification'));

    useEffect(()=>{
        if(NotificationList === null)
            localStorage.setItem('notification',JSON.stringify({data:[],unread:0}))
    },[])
    
    function toggle() {
        if(NotificationList) NotificationList.unread = 0;
        localStorage.setItem('notification',JSON.stringify(NotificationList))
        setModal(!modal)
    }

    return(
        <>
            <div className="notificationContainer" onClick={()=>setModal(true)}>
                <span className="notificationIcon lnr lnr-alarm">
                </span>
                <div className={cx("notificationBadge", {
                    'd-none': !NotificationList.unread
                })}>
                    {(NotificationList)? NotificationList.unread : null}
                </div>
            </div>
            <Modal
                isOpen={modal}
                >
                <ModalHeader  toggle={toggle}>
                    Notification Center
                </ModalHeader>
                <ModalBody>
                    {(NotificationList.length !== 0)?
                        <>
                            {NotificationList.data.map((data)=>(
                                <div className="notificationItem">
                                    <div className="notificationItemContainer">  
                                        <span class="lnr lnr-checkmark-circle mr-2"></span>
                                        <span>
                                            {data.message}
                                        </span>
                                    </div>
                                    <a target="_blank" href={`${data.link}`} className={cx("notificationItemButton", {
                                            'd-none': !data.link
                                        })}>
                                        <span className="pb-1">
                                            more
                                        </span>
                                        <span class="lnr lnr-exit ml-2"></span>
                                    </a>
                                </div>
                            ))
                            }
                        </>
                        :
                        <div>
                            No Notification Available
                        </div>
                    }
                </ModalBody>
            </Modal>
        </>
    )
}

export default NotificationCenter;