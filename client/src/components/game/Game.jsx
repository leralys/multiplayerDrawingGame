import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../App';

import { generateSlug } from 'random-word-slugs';

// import Canvas from '../canvas/Canvas';
import ChooseAndGuess from '../chooseAndGuess/ChooseAndGuess';
import Controls from '../controls/Controls';
import Nav from '../nav/Nav';
import WaitingRoom from '../waitingRoom/WaitingRoom';

import './game.scss';


const easyCategory = 'food';
const mediumCategory = 'animals';
const hardCategory = 'education';

const generateWord = category => {
    const word = generateSlug(1, {
        partsOfSpeech: ['noun'],
        categories: {
            noun: [`${category}`]
        }
    });
    return word;
}

// const [score, setScore] = useState('');
// const [opponent, setOpponent] = useState('');

const Game = () => {
    const { turn, username, roomNo } = useContext(AppContext).user;
    const socket = useContext(AppContext).socket;
    const [startGame, setStartGame] = useState(false);
    const [words, setWords] = useState({
        easy: { word: generateWord(easyCategory), points: 1 },
        medium: { word: generateWord(mediumCategory), points: 3 },
        hard: { word: generateWord(hardCategory), points: 5 }
    });
    const [selectedWord, setSelectedWord] = useState('');
    const [timer, setTimer] = useState('...');

    useEffect(() => {
        // if player comes second - the game starts
        if (turn % 2 === 0) {
            setStartGame(true);
            socket.emit('startNewGame', { roomNo, username });
        } else {
            // wait for another player to join in order to start the game
            socket.on('startNewGame', data => {
                if (data.startNewGame) {
                    setStartGame(true);
                    // send info about this player to the other player in the room
                    socket.emit('userInfo', { username, roomNo });
                }
            });
        }
    }, [turn, setStartGame, roomNo, socket, username]);
    return (
        <div className='game'>
            <Nav selectedWord={selectedWord}
                timer={timer}
            />
            {!startGame || (startGame && turn === 2)
                ? <WaitingRoom startGame={startGame} />
                : <ChooseAndGuess
                    words={words}
                    selectedWord={selectedWord}
                    setSelectedWord={setSelectedWord}
                    timer={timer}
                    setTimer={setTimer} />
            }
            {/* {selectedWord !== '' &&
                <Canvas />
            } */}
            <Controls />
        </div>
    )
}
export default Game;


