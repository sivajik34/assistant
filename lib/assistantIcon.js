import React,{useState,Suspense} from 'react';
import { Mic } from 'react-feather';
//import AssistantModal from '../AssistantModal';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
const AssistantModal = React.lazy(() => import('./AssistantModal'));
const AssistantIcon = () => {

const [isOpen,setIsOpen]=useState(false);
const closeModal = () =>{ setIsOpen(false); };
const toggle = () => { setIsOpen(!isOpen);};
const assistantModal = isOpen && (<Suspense fallback={<LoadingIndicator />}>
            <AssistantModal isOpen={isOpen} closeModal={closeModal} />
        </Suspense>) ;

return (<span><button type="button" onClick={toggle}><Mic/></button>{assistantModal}</span>);

}
export default AssistantIcon;
