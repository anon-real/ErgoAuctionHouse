import React,{useState, useEffect} from 'react'
import cx from 'classnames';
import {
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap';

function NotificationCenter(){
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
                {(NotificationList)?
                    <div className={cx("notificationBadge", {
                        'd-none': NotificationList.unread === 0
                    })}>
                        {(NotificationList)? NotificationList.unread : null}
                    </div>
                    :
                    null
                }
            </div>
            <Modal
                isOpen={modal}
                >
                <ModalHeader  toggle={toggle}>
                    Notification Center
                </ModalHeader>
                <ModalBody>
                    {(NotificationList !== null)?
                        <>
                            {NotificationList.data.map((data,index)=>(
                                <div className="notificationItem" key={index}>
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
                            <div className={cx({
                                'd-none': NotificationList.data.length !== 0
                            })}>
                                No Notification Available
                            </div>
                        </>
                        :
                        null
                    }
                </ModalBody>
            </Modal>
        </>
    )
}

export default NotificationCenter;