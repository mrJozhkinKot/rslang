import React, { Component } from 'react';
import './startPage.scss';
import './game-puzzle.scss';
import { Button } from '../../shared/button';

let audio;
let audioPlay;
export class ButtonsBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPlayingAudio: false,
        };
    }

    handleCheck = () => {
        const correctSentence = this.props.correctSentence.split(' ');
        document.querySelectorAll('.completed').forEach((word) => {
            word.classList.remove('correct-word');
            word.classList.remove('un-correct-word');
        });
        document.querySelectorAll('.completed').forEach((word, index) => {
            if (word.textContent === correctSentence[index]) {
                word.classList.add('correct-word');
                return;
            }
            word.classList.add('un-correct-word');
        });

        if (document.querySelectorAll('.correct-word').length === correctSentence.length) {
            document.querySelectorAll('.correct-word').forEach((word) => {
                word.onmousedown = () => false;
            });
            this.props.showButton('isContinueBtn', true);
            this.props.showButton('isCheckBtn', false);
            const urlAudio = `https://raw.githubusercontent.com/aidfromdeagland/rslang-data/master/${this.props.audioSentence}`;
            if (this.props.isAutoPronunciation) {
                this.handlePlayAudio(urlAudio);
            }
            this.props.addToResults('know', this.props.correctSentence, urlAudio);
            if (this.props.wordCount === 9) {
                this.props.showButton('iResultBtn', true);
            }
        } else {
            this.props.showButton('isDontKnowBtn', true);
        }
    }

    handleContinue = () => {
        if (audioPlay) {
            audioPlay.then(() => {
                audio.pause();
            });
        }
        this.props.showButton('isDontKnowBtn', true);
        this.props.showButton('isContinueBtn', false);
        this.props.showButton('isCheckBtn', false);
        if (this.props.wordCount < 9) {
            this.props.getNextWord(this.props.wordCount + 1);
        }
        if (this.props.wordCount === 9) {
            this.props.showResults();
        }
    }

    handleDontKnow = () => {
        document.querySelector('.puzzle-container-sentence').innerHTML = '';
        document.querySelector('.puzzle-pieces').innerHTML = '';

        this.props.correctSentence.split(' ').map((word) => {
            const wordPuzzle = `<div class="drag-word completed"><span class="word-text">${word}</span></div>`;
            document.querySelector('.puzzle-container-sentence').insertAdjacentHTML('beforeend', wordPuzzle);
        });
        this.props.showButton('isContinueBtn', true);
        const urlAudio = `https://raw.githubusercontent.com/aidfromdeagland/rslang-data/master/${this.props.audioSentence}`;
        if (this.props.isAutoPronunciation) {
            this.handlePlayAudio(urlAudio);
        }
        this.props.showButton('isDontKnowBtn', false);
        this.props.showButton('isCheckBtn', false);
        this.props.addToResults('dontKnow', this.props.correctSentence, urlAudio);
    }

    handlePlayAudio = (url) => {
        if (audioPlay) {
            audioPlay.then(() => {
                audio.pause();
                audio = new Audio(url);
                audioPlay = audio.play();
                audio.onplaying = () => {
                    this.setState({ isPlayingAudio: true });
                };
                audio.onended = () => {
                    this.setState({ isPlayingAudio: false });
                };
                audio.onpause = () => {
                    this.setState({ isPlayingAudio: false });
                };
            });
        } else {
            audio = new Audio(url);
            audioPlay = audio.play();
            audio.onplaying = () => {
                this.setState({ isPlayingAudio: true });
            };
            audio.onended = () => {
                this.setState({ isPlayingAudio: false });
            };
            audio.onpause = () => {
                this.setState({ isPlayingAudio: false });
            };
        }
    }

    render() {
        const { isPlayingAudio } = this.state;
        return (
            <div className="game-board__btn-block">
                {this.props.isCheckBtn && <Button className="check-sentence puzzle-btn button" title="Check" onClick={this.handleCheck} />}
                {this.props.isDontKnowBtn && <Button className="dont-know-sentence puzzle-btn button" title="Don\'t know" onClick={this.handleDontKnow} />}
                {this.props.isContinueBtn && <Button className="continue-sentence puzzle-btn button" title="Continue" onClick={this.handleContinue} />}
                {this.props.isResultBtn && <Button className="puzzle-result puzzle-btn button" title="Results" />}
                <button
                    className={isPlayingAudio ? "dynamic-btn playing" : "dynamic-btn"}
                    onClick={() => this.handlePlayAudio(`https://raw.githubusercontent.com/aidfromdeagland/rslang-data/master/${this.props.audioSentence}`)}
                />
            </div>
        );
    }
}
