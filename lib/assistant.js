import React,{useEffect,useState} from 'react';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useHistory } from 'react-router-dom';
import { useApolloClient } from '@apollo/react-hooks';
import categoryListQuery from './queries/getCategoryListAssistant.graphql';
import useAssistant from './useAssistant';
import { Mic} from 'react-feather';

const Assistant = props=> {
const {closeModal,openModal,isMicOn} = props;
	const client = useApolloClient();
	const [, { toggleDrawer,closeDrawer,toggleSearch }] = useAppContext();
	let history = useHistory();
	const [result,setResult]=useState("");
	const [blocked, setBlocked] = useState(false);
        const [value,setValue] = useState("");
        const [commandNotMatchText,setCommandNotMatchText]=useState("");
        //const [lang, setLang] = useState('en-US');	
        
        const onEnd = () => {
    	
  	};

  	const onResult = (result) => {
                openModal();
    		setValue(result);
  	};

        const onResultNoMatch = () => {        
        setResult('No match found');
        };  	
        const onCommandMatch = () => {
        closeModal();
        setCommandNotMatchText("");

        };
        const onCommandNotMatch = () => {
         setCommandNotMatchText("sorry,command not matched");       
   
        }
  	const onError = (event) => {
    		if (event.error === 'not-allowed') {
      			setBlocked(true);
    		}
  	};

	const search = (query) => {
                closeDrawer();
                history.push('/search.html?query='+query);                
                        };

	const {listen,listening,stop,supported,addCommands,removeCommands} = useAssistant({ onResult, onResultNoMatch,onCommandMatch,onCommandNotMatch,onEnd, onError });

useEffect(() => {
  	
		var commands={
    			'hello': function() { alert('Hello world!');},
    			'navigation':() => { toggleDrawer('nav'); },
                	'close navigation': () => { closeDrawer(); },
                	'home page' : () => {closeDrawer(); history.push('/'); },
    			'go to *value category': (value) => { closeDrawer();getCategories(value)},
    			'cart': () => {toggleDrawer('cart');},
    			'filter': () => {toggleDrawer('filter');},
                	'search *query':search
  			};

           	addCommands(commands);
               
                return () => { stop();}
	 },[]);
	useEffect(() => { 
			
				if(isMicOn && !listening ) { 
                                        setValue("Speak now");
					listen(); 
				} else { 
					stop(); 
				}
			},[isMicOn]);

	async function getCategories(value) {

	const { data,error} = await client.query({
          query: categoryListQuery,
          variables: { name: value }});
        	if(data && data.categoryList && data.categoryList.length){
                console.log("url key: "+data.categoryList[0].url_key);
                history.push('/'+data.categoryList[0].url_key+ '.html');                                                                                               
               } else {
                console.log('no categories found');          
        	}
	}

	

const toggle = () => { 
return;
			if(listening) { 
              			closeModal();                    		
 			} else{
      				setBlocked(false);
      				listen();
    			};
	};

return (<div><div><span id="transcript" name="transcript">{value}</span></div><div><div>{commandNotMatchText}</div>
            <button disabled={blocked} type="button" onClick={toggle}>
              <Mic/>
            </button></div></div>);	
  
}

export default Assistant;
