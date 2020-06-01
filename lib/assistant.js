import React,{useEffect,useState} from 'react';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useHistory } from 'react-router-dom';
import { useApolloClient } from '@apollo/react-hooks';
import categoryListQuery from './queries/getCategoryListAssistant.graphql';
import useAssistant from './useAssistant';
import { Mic,MicOff } from 'react-feather';



const Assistant = props=> {
const {closeModal} = props;
	const client = useApolloClient();
	const [, { toggleDrawer,closeDrawer,toggleSearch }] = useAppContext();
	let history = useHistory();
	const [result,setResult]=useState("");
	const [blocked, setBlocked] = useState(false);
        const [value,setValue] = useState("");
        //const [lang, setLang] = useState('en-US');	
        
        const onEnd = () => {
    		// You could do something here after listening has finished
  	};

  	const onResult = (result) => {
    		setValue(result);
  	};

        const onResultNoMatch = () => {
        
        setResult('No match found');

        }

  	

  	const onError = (event) => {
    		if (event.error === 'not-allowed') {
      			setBlocked(true);
    		}
  	};

	const search = (query) => {
                closeDrawer();
                history.push('/search.html?query='+query);
                stop();
                closeModal();
        };

	const {listen,listening,stop,supported,addCommands,removeCommands} = useAssistant({ onResult, onResultNoMatch,onEnd, onError });

useEffect(() => {
  	
		var commands={
    			'hello': function() { alert('Hello world!');stop();closeModal();},
    			'navigation':() => { toggleDrawer('nav'); stop();closeModal();},
                	'close navigation': () => { closeDrawer(); stop();closeModal();},
                	'home page' : () => {closeDrawer(); history.push('/'); stop();closeModal();},
    			'go to *value category': (value) => { closeDrawer();getCategories(value)},
    			'cart': () => {toggleDrawer('cart');stop();closeModal();},
    			'filter': () => {toggleDrawer('filter');stop();closeModal();},
                	'search *query':search
  			};

           	addCommands(commands);
               // listen();
	 },[]);

	async function getCategories(value) {
	const { data,error} = await client.query({
          query: categoryListQuery,
          variables: { name: value },                                                                                                                                           });
        	if(data && data.categoryList && data.categoryList.length){
                console.log("url key: "+data.categoryList[0].url_key);
                history.push('/'+data.categoryList[0].url_key+ '.html');
                stop();
                closeModal();
                
                                                                                                                          
               } else {
                console.log('no categories found');          
        	}
	}

	

	const toggle = listening
    ? stop
    : () => {
      setBlocked(false);
      listen();
    };


return (<div><div><span id="transcript" name="transcript">{value}</span></div><div>
            <button disabled={blocked} type="button" onClick={toggle}>
              {listening ? <MicOff/> : <Mic/>}
            </button></div></div>);	
  
}

export default Assistant;
