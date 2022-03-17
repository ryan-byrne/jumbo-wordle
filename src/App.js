import { useEffect, useState } from 'react';
import './App.css';

import wordList from './wordList.json';
import checkList from './wordList2.json';

const getDayDiff = (from, to) => 
  Math.round((from.setHours(0,0,0,0) - to.setHours(0,0,0,0))/864e5)

const getTodaysWord = () =>
  wordList[getDayDiff(new Date(), new Date(2021, 5, 19))].toUpperCase()

const initialState = {
  "boardState":["","","","","",""],
  "evaluations":[null,null,null,null,null,null],
  "rowIndex":0,
  "solution":getTodaysWord(),
  "gameStatus":"IN_PROGRESS",
  "lastPlayedTs":null,
  "lastCompletedTs":null,
  "restoringFromLocalStorage":null,
  "hardMode":false
}

/*

1. React state starts as empty object
2. On window load, replace with stored 'jumbo-world-state'

*/

const Tiles = (props) => {

  const {boardState, evaluations} = props.jumboWordleState;

  return (
    <div className='tile-container'>
      {boardState.filter(g=>g!=="").map((pg,idx)=>
        <div className='tile-row-previous' key={idx}>
          {pg.split("").map((pgc, cidx)=><div key={cidx} className={`tile ${evaluations[idx][cidx]}`}>{pgc}</div>)}
        </div>
      )}
      <div className='tile-row-guess'>
        {props.guess.split("").map( (c,idx) =>
          <div className='tile' key={idx}>{c}</div>
        )}
        {Array(5-props.guess.length).fill(0).map((gec,gecidx)=><div key={gecidx} className='tile'></div>)}
      </div>
      {Array(5-boardState.filter(g=>g!=="").length).fill(0).map((eg,idx)=>
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

  const {evaluations, boardState} = props.jumboWordleState;

  const formats = {}

  boardState.map( (prevGuess, idx) =>
    prevGuess.split("").map( (char, cidx) =>
      formats[char] = evaluations[idx][cidx]
    )
  )

  console.log(formats);

  return(
    <div className='keyboard-container'>
      {KeyLayout.map((keyRow,idx)=>
        <div className='keyboard-row' key={idx}>
          {keyRow.split('').map(keyChar=>
            <div className={`keyboard-key ${formats[keyChar]}`} id={keyChar} key={keyChar} onClick={formats[keyChar]!=='absent'?props.handleSelect:null}>{keyChar}</div>  
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

  const [jumboWordleState, setJumboWordleState] = useState(initialState);
  const [guess, setGuess] = useState("");

  useEffect(()=>{
    // Check initial state on page load
    const storedState = JSON.parse(window.localStorage.getItem("jumbo-wordle-state"));
  
    if ( !storedState || storedState.solution !== getTodaysWord() ){
      setJumboWordleState( jumboWordleState => ({
        ...jumboWordleState,
        "boardState":["","","","","",""],
        "evaluations":[null,null,null,null,null,null],
        "rowIndex":0,
        "solution":getTodaysWord(),
        "gameStatus":"IN_PROGRESS",
      }))
    } else {
      setJumboWordleState(storedState);
    }

  },[])

  useEffect(()=>window.localStorage.setItem("jumbo-wordle-state", JSON.stringify(jumboWordleState)),[jumboWordleState])

  const handleEnter = () => {
    // Check word Validity
    if ( jumboWordleState.rowIndex === 5 ) {
      console.log(`You are out of guesses today`);
    } else if ( guess.length < 5 ) {
      console.log(`${guess} is not long enough`);
    } else if (!checkList.includes(guess.toLowerCase()) & !wordList.includes(guess.toLowerCase())){
      console.log(`${guess} not in Wordlist`);
    } else {
      // Word is Valid
      const {rowIndex, evaluations, boardState, solution} = jumboWordleState;

      boardState[rowIndex] = guess;
      evaluations[rowIndex] = guess.split("").map( (char, idx) =>
        char===solution[idx]?"correct":solution.split("").includes(char)?"present":"absent"
      )

      setJumboWordleState({
        ...jumboWordleState,
        boardState:boardState,
        evaluations:evaluations,
        rowIndex:rowIndex+1,
        gameStatus:guess===solution?"WIN":rowIndex===5?"FAIL":"IN_PROGRESS",
        lastPlayedTs: new Date().getTime(),
        lastCompletedTs:guess===solution||rowIndex===5?new Date().getTime():null
      })

      setGuess("")
    }
  }

  const handleDelete = () => guess.length>0 & jumboWordleState.boardState==='IN_PROGRESS'?null:setGuess(guess.slice(0,guess.length-1))

  const handleSelect = (e) => guess.length<5 & jumboWordleState.gameStatus==='IN_PROGRESS'?setGuess(guess.concat(e.target.id)):null

  return (
    <div className="App">
      <Tiles {...{jumboWordleState, guess}}/>
      <Keyboard {...{handleSelect, handleDelete, handleEnter, jumboWordleState}}/>
    </div>
  );
}

export default App;
