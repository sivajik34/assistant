  import {
  useRef,
  useEffect,
  useState,
  useCallback
} from 'react';

  // Get the SpeechRecognition object, while handling browser prefixes
   window.SpeechRecognition = window.SpeechRecognition ||
                          window.webkitSpeechRecognition ||
                          window.mozSpeechRecognition ||
                          window.msSpeechRecognition ||
                          window.oSpeechRecognition;

  // Check browser support
  // This is done as early as possible, to make it as fast as possible for unsupported browsers
  //if (!SpeechRecognition) {
    //return null;
  //}

  var commandsList = [];   
  //var debugState = false;
  var debugStyle = 'font-weight: bold; color: #00f;';
  
  

  // The command matching code is a modified version of Backbone.Router by Jeremy Ashkenas, under the MIT license.
  var optionalParam = /\s*\((.*?)\)\s*/g;
  var optionalRegex = /(\(\?:[^)]+\))\?/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-{}[\]+?.,\\^$|#]/g;
  var commandToRegExp = function(command) {
    command = command
      .replace(escapeRegExp, '\\$&')
      .replace(optionalParam, '(?:$1)?')
      .replace(namedParam, function(match, optional) {
        return optional ? match : '([^\\s]+)';
      })
      .replace(splatParam, '(.*?)')
      .replace(optionalRegex, '\\s*$1?\\s*');
    return new RegExp('^' + command + '$', 'i');
  };

 

  

  const useAssistant = (props = {}) =>  {
    const {
    onEnd = () => {},
    onResult = () => {},
    onResultNoMatch = () =>{},
    onCommandMatch = () => {},
    onCommandNotMatch=() => {},
    onError = () => {}
  } = props;
  const recognition = useRef(null);
  const [listening, setListening] = useState(false);
  const [debugState,setDebugState] = useState(true);
  const supported = !!window.SpeechRecognition;

var running =false;
  // method for logging in developer console when debug mode is on
  var logMessage = (text, extraParameters) => {
    if (text.indexOf('%c') === -1 && !extraParameters) {
      console.log(text);
    } else {
      console.log(text, extraParameters || debugStyle);
    }
  };

  
  var registerCommand = (command, callback, originalPhrase) => {
    commandsList.push({ command, callback, originalPhrase });
    if (debugState) {
      logMessage(
        'Command successfully loaded: %c' + originalPhrase,
        debugStyle
      );
    }
  };

  var parseResults = (results) => {    
    var commandText;
    // go over each of the 5 results and alternative results received (we have set maxAlternatives to 5 above)
    for (let i = 0; i < results.length; i++) {
      // the text recognized
      commandText = results[i].trim();
      if (debugState) {
        logMessage('Speech recognized: %c' + commandText, debugStyle);
      }
      onResult(commandText);
      // try and match recognized text to one of the commands on the list
      for (let j = 0, l = commandsList.length; j < l; j++) {
        var currentCommand = commandsList[j];
        var result = currentCommand.command.exec(commandText);
        if (result) {
          var parameters = result.slice(1);
          if (debugState) {
            logMessage(
              'command matched: %c' + currentCommand.originalPhrase,
              debugStyle
            );
            if (parameters.length) {
              logMessage('with parameters', parameters);
            }
          }
          // execute the matched command
          currentCommand.callback.apply(this, parameters);
          onCommandMatch();
          return true;
        }
      }
    }
    onCommandNotMatch();
    return false;

  };

   const handleError = (event) => {
    if (event.error === 'not-allowed') {
      recognition.current.onend = () => {};
      setListening(false);
    }
    onError(event);
  };

   const  listen = (args ={}) => {

      if (listening) return;
    const {
      lang = 'en-US', interimResults = false, continuous = false, maxAlternatives = 5, grammars
    } = args;
    setListening(true);
       recognition.current.lang = lang;
    recognition.current.interimResults = interimResults;
    recognition.current.onresult = (event) => {

        var SpeechRecognitionResult = event.results[event.resultIndex];
        var results = [];
        for (let k = 0; k < SpeechRecognitionResult.length; k++) {
          results[k] = SpeechRecognitionResult[k].transcript;
        }
  parseResults(results);
  
  };
    recognition.current.onerror = handleError;
    recognition.current.onnomatch = function() { 
  console.log('Speech not recognized'); 
  onResultNoMatch();
}
    recognition.current.continuous = window.location.protocol === 'http:';
    recognition.current.maxAlternatives = maxAlternatives;
    if (grammars) {
      recognition.current.grammars = grammars;
    }
    // SpeechRecognition stops automatically after inactivity
    // We want it to keep going until we tell it to stop
    recognition.current.onend = () => recognition.current.start();
    recognition.current.start();
    };

   const  stop = () => {
        if (!listening) return;
    recognition.current.onresult = () => {};
    recognition.current.onend = () => {};
    recognition.current.onerror = () => {};
    setListening(false);
    recognition.current.stop();
    onEnd();
  };

    /**
     * Turn on the output of debug messages to the console. Ugly, but super-handy!
     *
     * @param {boolean} [newState=true] - Turn on/off debug messages
     * @method debug
     */
   const debug = (newState = true)=>{
      setDebugState(newState);
    };

  useEffect(() => {
    if (!supported) 
     return;
   recognition.current = new window.SpeechRecognition();
  }, []);

    
   const addCommands = (commands) => {
      var cb;

      //initIfNeeded();

      for (let phrase in commands) {
        if (commands.hasOwnProperty(phrase)) {
          cb = root[commands[phrase]] || commands[phrase];
          if (typeof cb === 'function') {
            // convert command to regex then register the command
            registerCommand(commandToRegExp(phrase), cb, phrase);
          } else if (typeof cb === 'object' && cb.regexp instanceof RegExp) {
            // register the command
            registerCommand(
              new RegExp(cb.regexp.source, 'i'),
              cb.callback,
              phrase
            );
          } else {
            if (debugState) {
              logMessage('Can not register command: %c' + phrase, debugStyle);
            }
            continue;
          }
        }
      }
    };

    
  const  removeCommands = (commandsToRemove) => {
      if (commandsToRemove === undefined) {
        commandsList = [];
      } else {
        commandsToRemove = Array.isArray(commandsToRemove) ? commandsToRemove : [commandsToRemove];
        commandsList = commandsList.filter(command => {
          for (let i = 0; i < commandsToRemove.length; i++) {
            if (commandsToRemove[i] === command.originalPhrase) {
              return false;
            }
          }
          return true;
        });
      }
    };

     
   
return {
    listen,
    listening,
    stop,
    supported,
    addCommands,
    removeCommands
  };

      };

export default useAssistant;

