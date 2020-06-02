import React,{ useState,Suspense } from 'react';
import { Mic } from 'react-feather';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
const AssistantModal = React.lazy(() => import('./AssistantModal'));
import defaultClasses from './assistantIcon.css';
const AssistantIcon = () => {
		const [isOpen,setIsOpen]=useState(false);
		const [initialRender,setInitialRender]=useState(false);
		const closeModal = () =>{ setIsOpen(false);};
		const toggle = () => { 
				setIsOpen(!isOpen);
				setInitialRender(true);
		};
		const assistantModal = initialRender && (<Suspense fallback={<LoadingIndicator />}>
            <AssistantModal isOpen={isOpen} closeModal={closeModal} />
        </Suspense>) ;

	return (<div><span className={defaultClasses.asIcon}><button type="button" onClick={toggle}><Mic/></button></span>{assistantModal}</div>);
}
export default AssistantIcon;
