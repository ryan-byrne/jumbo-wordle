import { useEffect, useState } from 'react';
import './App.css';

import bugIcon from './img/bug.png';
import checkList from './wordList.json';

const Tiles = (props) => {

  const { boardState, evaluations } = props.gameState;

  return (
    <div className='tile-container'>

      {/* List out the previous guesses */}
      {boardState.filter(g => g !== "").map((pg, idx) =>
        <div className='tile-row-previous' key={idx}>
          {pg.split("").map((pgc, cidx) => <div key={cidx} className={`tile ${evaluations[idx][cidx]}`}>{pgc}</div>)}
        </div>
      )}

      {
        evaluations.filter(e => e !== null).length === 6 ? null :
          <div>
            {/* Row for the current Guess */}
            <div className='tile-row-guess'>
              {props.guess.split("").map((c, idx) =>
                <div className='tile' key={idx}>{c}</div>
              )}
              {Array(5 - props.guess.length).fill(0).map((gec, gecidx) => <div key={gecidx} className='tile'></div>)}
            </div>
            {/* Empty Rows for future guesses */}
            {Array(5 - boardState.filter(g => g !== "").length).fill(0).map((eg, idx) =>
              <div className='tile-row-empty' key={idx}>
                {Array(5).fill(0).map((egc, cidx) =>
                  <div className='tile' key={cidx}></div>
                )}
              </div>
            )}
          </div>
      }


    </div>
  )
}

const Keyboard = (props) => {

  const KeyLayout = [
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM'
  ]

  const { evaluations, boardState } = props.gameState;

  const formats = {}

  // Loop through previous guesses
  boardState.forEach((prevGuess, idx) =>
    prevGuess.split("").forEach((char, cidx) => { // 
      if (formats[char] === 'correct') {
        return
      } else {
        formats[char] = evaluations[idx][cidx]
      }
    })
  )

  const handleRefresh = () => window.location.reload();

  return (
    <div className='keyboard-container'>
      {KeyLayout.map((keyRow, idx) =>
        <div className='keyboard-row' key={idx}>
          {keyRow.split('').map(keyChar =>
            <div className={`keyboard-key ${formats[keyChar]}`} id={keyChar} key={keyChar} onClick={() => props.handleSelect(keyChar)}>{keyChar}</div>
          )}
        </div>
      )}
      <div>
        <div className='keyboard-refresh-key' onClick={handleRefresh}>↺</div>
        <div className='keyboard-special-key' onClick={props.handleDelete}>←</div>
        <div className='keyboard-special-key' onClick={props.handleEnter}>Enter</div>
        <div className='keyboard-bug-key'>
          <a href="mailto:ryanbyrne142@gmail.com?subject=Jumbo Wordle Bug">
            <img src={bugIcon} height="60" alt="bug-icon" />
          </a>
        </div>
      </div>
    </div>
  )
}

const App = () => {

  const [todaysWord, setTodaysWord] = useState();
  const [error, setError] = useState();
  const [gameState, setGameState] = useState();
  const [guess, setGuess] = useState("");

  useEffect(() => {
    setError();
    fetch('/today')
      .then(resp => resp.json())
      .then(data => setTodaysWord(data.solution.toUpperCase()))
      .catch(err => {
        console.error(err);
        setError(err);
      })
  }, []);

  useEffect(() => {
    
    const storedState = JSON.parse(localStorage.getItem('jumbo-wordle-state'));

    if ( !todaysWord ) return
    else if ( !storedState || (storedState.solution !== todaysWord) ) setGameState({
      solution:todaysWord,
      boardState:["","","","",""],
      evaluations:[null,null,null,null,null],
      gameStatus:"IN_PROGRESS",
      rowIndex:0
    })
    else setGameState(storedState);

  }, [todaysWord]);

  useEffect(() =>
    !gameState ? null :
    localStorage.setItem('jumbo-wordle-state', JSON.stringify(gameState)), 
  [gameState]);

  const handleEnter = () => {
    // Check word Validity
    if (gameState.rowIndex === 6) {
      console.log(`You are out of guesses today`);
    } else if (guess.length < 5) {
      console.log(`${guess} is not long enough`);
    } else if (!checkList.includes(guess.toLowerCase())) {
      console.log(`${guess} not in Wordlist`);
    } else {
      // Word is Valid
      const { rowIndex, evaluations, boardState, solution } = gameState;

      boardState[rowIndex] = guess;
      evaluations[rowIndex] = guess.split("").map((char, idx) =>
        char === solution[idx] ? "correct" : solution.split("").includes(char) ? "present" : "absent"
      )

      setGameState({
        ...gameState,
        boardState: boardState,
        evaluations: evaluations,
        rowIndex: rowIndex + 1,
        gameStatus: guess === solution ? "WIN" : rowIndex === 5 ? "FAIL" : "IN_PROGRESS",
        lastPlayedTs: new Date().getTime(),
        lastCompletedTs: guess === solution || rowIndex === 5 ? new Date().getTime() : null
      })

      setGuess("")
    }
  }

  const handleDelete = () => guess.length > 0 & gameState.boardState === 'IN_PROGRESS' ? null : setGuess(guess.slice(0, guess.length - 1))

  const handleSelect = (char) => guess.length < 5 & gameState.gameStatus === 'IN_PROGRESS' ? setGuess(`${guess}${char}`) : null;


  return (
    <div className='App'>
      {
        error ? <div>ERROR: {error.message}</div> :
        !todaysWord ? <div>Loading Today's Word...</div> :
        !gameState ? <div>Loading Game State...</div> :
        <div>
          <Tiles {...{ gameState, guess }} />
          <Keyboard {...{ handleSelect, handleDelete, handleEnter, gameState }} />
        </div>
      }
    </div>
  )
}

export default App;