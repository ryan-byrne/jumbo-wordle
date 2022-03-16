import { useEffect, useState } from 'react';
import './App.css';

import wordList from './wordList.json';
import checkList from './wordList2.json';

const getDayDiff = (from, to) => 
  Math.round((from.setHours(0,0,0,0) - to.setHours(0,0,0,0))/864e5)

const getTodaysWord = () =>
  wordList[getDayDiff(new Date(), new Date(2021, 5, 19))]

/*

1. React state starts as empty object
2. On window load, replace with stored 'jumbo-world-state'

*/

const Tiles = (props) => {

  const prevGuess = props.jumboWordleState.boardState.filter(g=>g!=="")

  return (
    <div className='tile-container'>
      {prevGuess.map((pg,idx)=>
        <div className='tile-row-previous' key={idx}>
          {pg.split("").map((pgc, cidx)=><div key={cidx} className='tile'>{pgc}</div>)}
        </div>
      )}
      <div className='tile-row-guess'>
        {props.guess.split("").map( (c,idx) =>
          <div className='tile' key={idx}>{c}</div>
        )}
        {Array(5-props.guess.length).fill(0).map((gec,gecidx)=><div key={gecidx} className='tile'></div>)}
      </div>
      {Array(6-prevGuess.length).fill(0).map((eg,idx)=>
        <div className='tile-row-empty' key={idx}>
          {Array(5).fill(0).map((egc,cidx)=>
            <div className='tile' key={cidx}></div>
          )}
        </div>
      )}
    </div>
  )
}

const Keyboard = (props) => {

  const KeyLayout = [
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM'
  ]

  return(
    <div className='keyboard-container'>
      {KeyLayout.map((keyRow,idx)=>
        <div className='keyboard-row' key={idx}>
          {keyRow.split('').map(keyChar=>
            <div className='keyboard-key' id={keyChar} key={keyChar} onClick={props.handleSelect}>{keyChar}</div>  
          )}
        </div>  
      )}
      <div>
        <div className='keyboard-special-key' onClick={props.handleDelete}>←</div>
        <div className='keyboard-special-key' onClick={props.handleEnter}>Enter</div>
      </div>
    </div>
  )
}

function App() {

  const [jumboWordleState, setJumboWordleState] = useState(
    JSON.parse(window.localStorage.getItem("jumbo-wordle-state"))?
    JSON.parse(window.localStorage.getItem("jumbo-wordle-state")):
    {
    "boardState":["","","","","",""],
    "evaluations":[null,null,null,null,null,null],
    "rowIndex":0,
    "solution":getTodaysWord(),
    "gameStatus":"IN_PROGRESS",
    "lastPlayedTs":null,
    "lastCompletedTs":null,
    "restoringFromLocalStorage":null,
    "hardMode":false
  });

  const [guess, setGuess] = useState("");
  // Check state on initial page load
  useEffect(()=>{
    
    const storedState = JSON.parse(window.localStorage.getItem("jumbo-wordle-state"))

    if (!storedState){
      window.localStorage.setItem('jumbo-wordle-state', JSON.stringify(jumboWordleState))
    }
    else if ( getDayDiff(new Date(), new Date(storedState.lastCompletedTs)) >= 1){
      // Start new game
      setJumboWordleState({
        ...jumboWordleState,
        "boardState":["","","","","",""],
        "evaluations":[null,null,null,null,null,null],
        "rowIndex":0,
        "solution":getTodaysWord(),
        "gameStatus":"IN_PROGRESS",
      })
    } else {
      setJumboWordleState(storedState)
    }

  },[])

  const handleEnter = () => {
    if ( jumboWordleState.rowIndex === 5 ) {
      console.log(`You are out of guesses today`);
    } else if ( guess.length < 5 ) {
      console.log(`${guess} is not long enough`);
    } else if (!checkList.includes(guess.toLowerCase()) & !wordList.includes(guess.toLowerCase())){
      console.log(`${guess} not in Wordlist`);
    } else {
      var prevGuesses = [...jumboWordleState.boardState];
      var prevEval = [...jumboWordleState.evaluations];
      prevGuesses[jumboWordleState.rowIndex] = guess
      setJumboWordleState({
        ...jumboWordleState,
        rowIndex:jumboWordleState.rowIndex+1,
        boardState:prevGuesses
      })
      setGuess("")
      saveState();
    }
  }

  const saveState = () => window.localStorage.setItem('jumbo-wordle-state', JSON.stringify(jumboWordleState))

  const handleDelete = () => guess.length>0 & jumboWordleState.boardState==='IN_PROGRESS'?null:setGuess(guess.slice(0,guess.length-1))

  const handleSelect = (e) => guess.length<5 & jumboWordleState.gameStatus==='IN_PROGRESS'?setGuess(guess.concat(e.target.id)):null

  return (
    <div className="App">
      <Tiles {...{jumboWordleState, guess}}/>
      <Keyboard {...{handleSelect, handleDelete, handleEnter}}/>
    </div>
  );
}

export default App;
