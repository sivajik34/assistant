import React,{ useState,Suspense } from 'react';
import { Mic,MicOff} from  'react-feather';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
const AssistantModal = React.lazy(() => import('./AssistantModal'));
import defaultClasses from './assistantIcon.css';
const AssistantIcon = () => {		
		const [initialRender,setInitialRender]=useState(false);
                const [isMicOn,setIsMicOn]=useState(false);
		const toggle = () => { 
		                setIsMicOn(!isMicOn);
				setInitialRender(true);
		};
		const assistantModal = initialRender && (<Suspense fallback={<LoadingIndicator />}>
            <AssistantModal isMicOn={isMicOn} />
        </Suspense>) ;

	return (<div><span className={defaultClasses.asIcon}><button type="button" onClick={toggle}>
{ isMicOn ? <MicOff/> : <Mic/> }
</button></span>{assistantModal}</div>);
}
export default AssistantIcon;
