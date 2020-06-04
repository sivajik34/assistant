import React, { useState } from 'react';
import { X as CloseIcon } from 'react-feather';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { Modal } from '@magento/venia-ui/lib/components/Modal';
import defaultClasses from './assistantModal.css';
import Assistant from '../assistant.js';


const AssistantModal = props => {
    const {isMicOn} = props;     
    const [isOpen,SetIsOpen]=useState(false);
    const closeModal =  () => SetIsOpen(false);
    const openModal  =  () => SetIsOpen(true);
    const classes = mergeClasses(defaultClasses, props.classes);
    const rootClass = isOpen ? classes.root_open : classes.root;

    const bodyComponent = (
        <div className={classes.body} key="key">
            <Assistant closeModal={closeModal} openModal={openModal}  isMicOn={isMicOn} />
        </div>
    );

    return (
        <Modal>
            <main className={rootClass}>
                <div className={classes.header}>
                    <span className={classes.headerText}>Voice Assistant</span>
                    <button
                        className={classes.closeButton}
                        onClick={closeModal}
                    >
                        <Icon src={CloseIcon} />
                    </button>
                </div>
                {bodyComponent}
            </main>
        </Modal>
    );
};

export default AssistantModal;
