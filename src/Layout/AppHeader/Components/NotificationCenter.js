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

    function IconList(stat) {
        switch(stat){
            case 'success':
                return 'text-success lnr lnr-checkmark-circle'
            case 'error':
                return 'text-danger lnr lnr-cross-circle'
            default:
                return 'text-info lnr lnr-question-circle'
        }
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
                <ModalBody className="px-0 pt-0">
                    <div className="notificationModalBody">
                        {(NotificationList !== null)?
                            <>
                                {NotificationList.data.map((data,index)=>(
                                    <div className="notificationItem" key={index}>
                                        <div className="notificationItemContainer">  
                                        <span className={IconList(data.status)}></span>
                                            <span className="ml-2 pr-1">
                                                {data.message}
                                            </span>
                                        </div>
                                        <a target="_blank" href={`${data.link}`} className={cx("notificationItemButton", {
                                                'd-none': !data.link
                                            })}>
                                            <span class="lnr lnr-chevron-right ml-2"></span>
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
                    </div>
                </ModalBody>
            </Modal>
        </>
    )
}

export default NotificationCenter;