/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { WordList } from './wordList';
import { MEDIA_PREFIX_URL } from '../../../constants/globalConstants';
import { Repository } from './repository';
import { MAX_COUNT_QUEST_WORDS } from './constants';
import { tryExecute } from './utils';

export class AudioCallGame extends Component {
    constructor(props) {
        super(props);
        this.repository = new Repository(props.repositoryState);
        this.state = { selectedWord: false, pressNumber: undefined, round: this.getRound() };
        this.result = [];
    }

    componentDidMount() {
        this.handleSpeak();
        let isPressed = false;

        this.keydown = (e) => {
            if (isPressed) {
                return;
            }
            isPressed = true;
            this.handleKeyPress(e);
        };
        this.keyup = () => { isPressed = false; };
        document.addEventListener('keydown', this.keydown);
        document.addEventListener('keyup', this.keyup);
    }

    componentDidUpdate() {
        if (this.state.selectedWord || this.state.pressNumber) {
            return;
        }
        this.handleSpeak();
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keydown);
        document.removeEventListener('keyup', this.keyup);
    }

    getRound() {
        return {
            word: this.repository.getWord(),
            gameWords: this.repository.getWordsForGame(),
            audio: this.repository.getAudio(),
            background: this.repository.getBackgroundProgress(),
        };
    }

    addResult(word, isCorrect) {
        this.result.push({ word, isCorrect });
    }

    handleSelectWord(word, isCorrect) {
        this.addResult(word, isCorrect);
        this.setState({ selectedWord: true });
        // сохранить статистику
    }

    handleSpeak() {
        this.state.round.audio.play();
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (this.state.selectedWord) {
                this.handleNextWord();
            } else {
                this.handleSelectWord(this.state.round.word, false);
            }
        } else if (e.key > 0 && e.key <= MAX_COUNT_QUEST_WORDS) {
            e.preventDefault();
            this.setState({ pressNumber: Number(e.key) });
        }
    }

    handleNextWord() {
        if (!this.repository.increment()) {
            this.props.endGame(this.result);
            return;
        }

        tryExecute(async () => {
            this.setState({ selectedWord: false, pressNumber: undefined, round: this.getRound() });
        }, this.props.errorFunction);
    }

    render() {
        const { round, selectedWord, pressNumber } = this.state;
        return (
            <div className="audio-call" style={{ background: round.background }}>
                <span
                    className={`audio-call__word-image ${selectedWord ? 'audio-call__word-image_show' : ''}`}
                    style={{ backgroundImage: `url("${MEDIA_PREFIX_URL + this.state.round.word.image}")` }}
                />
                <div className={`audio-call__quest ${selectedWord ? 'audio-call__quest_show' : ''}`}>
                    <span className="audio-call__dinamic" onMouseDown={() => this.handleSpeak()} tabIndex="0" role="button"> </span>
                    <span className="audio-call__quest-word">{this.state.round.word.word}</span>
                </div>
                <WordList
                    words={round.gameWords}
                    wordId={round.word.id}
                    selected={(isCorrect) => this.handleSelectWord(round.word, isCorrect)}
                    selectCorrect={selectedWord}
                    pressNumber={pressNumber}
                />
                {this.state.selectedWord
                    ? <button className="audio-call__button" type="button" onClick={() => this.handleNextWord()}>→→→</button>
                    : <button className="audio-call__button" type="button" onClick={() => this.handleSelectWord(round.word, false)}>don&apos;t know</button>}
            </div>
        );
    }
}

AudioCallGame.propTypes = {
    repositoryState: PropTypes.shape({
        currentSettings: PropTypes.shape({
            group: PropTypes.number,
            page: PropTypes.number,
        }),
    }).isRequired,
    endGame: PropTypes.func.isRequired,
    errorFunction: PropTypes.func.isRequired,
};