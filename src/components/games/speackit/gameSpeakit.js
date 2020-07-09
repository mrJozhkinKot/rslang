import React, { Component } from 'react';
import './startPage.scss';
import PropTypes from 'prop-types';
import { ItemWord } from './itemWord';
import './sass/blocks/card.scss';
import './sass/scaffolding.scss';
import './sass/blocks/cards.scss';
import './sass/blocks/content.scss';
import './sass/blocks/main.scss';
import './sass/blocks/scene.scss';
import question from '../../../assets/images/speakit/question-mark.png';
import { Dropdown } from './dropdown/dropDown';

// import { Dropdown } from './dropDown/DropDown';
// import { Checkbox } from './checkBox/checkBox';
import { WordService } from '../../../services/wordServices';
import { Spinner } from '../../shared/spinner';
// import './game-puzzle.scss';
// import { GameBoardAction } from './gameBoardAction';
// import { ButtonsBlock } from './buttonsGame';
// import { ModalResult } from './modalStatistics/modalResult';
import { SettingService } from '../../../services/settingServices';
import { settingsDefault } from '../../../constants/globalConstants';
// import { StatisticService } from '../../../services/statisticServices';
import { Button } from '../../shared/button';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();
recognition.grammars = speechRecognitionList;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.continuous = false;
recognition.maxAlternatives = 3;

// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// const recognition = new SpeechRecognition()

// recognition.continous = true
// recognition.interimResults = true
// recognition.lang = 'en-US'

export class GameSpeakit extends Component {
    constructor(props) {
        super(props);
        // this.statistic = [];
        // this.results = {
        //     know: [],
        //     dontKnow: [],
        // };
        this.state = {
            level: 1,
            page: 1,
            wordCount: 0,
            haveWords: false,
            dataForGame: [],
            isGameModeTrain: true,
            isClickedCard: false,
            indexClickedCard: null,
            listening: false,
            correctWords: [],

            //     isCheckBtn: false,
            //     isContinueBtn: false,
            //     isDontKnowBtn: true,
            //     isResultBtn: false,
            //     isClickedDontKnow: false,
            //     isAutoPronunciation: true,
            //     isPicture: true,
            //     isRoundEnd: false,
            //     isNext: true,
        };
    }

    componentDidMount() {
        const { haveWords } = this.state;
        if (!haveWords) {
            this.loadSettings();
            // this.loadStatistic();
        }
    }

    componentDidUpdate() {
        const {
            haveWords,
            isNext,
            wordCount,
        } = this.state;
        if (!haveWords) {
            this.loadWords();
        }
        // if (!isNext) {
        //     this.createDataForGame(wordCount);
        // }
    }

    loadSettings = async () => {
        this.settings = await SettingService.get();
        const settingsForGame = this.settings.optional.speakit
            ? JSON.parse(this.settings.optional.speakit)
            : JSON.parse(settingsDefault.optional.speakit);
        this.setState({
            level: settingsForGame.group,
            page: settingsForGame.page,
        });
        this.loadWords();
    }

    putSettings = (level, page) => {
        const { optional } = this.settings;
        const gameSettings = JSON.stringify({
            group: level,
            page,
        });
        optional.speakit = gameSettings;
        const settings = SettingService.createObject(this.settings.wordsPerDay, optional);
        SettingService.put(settings);
    }

    // loadStatistic = async () => {
    //     this.statistic = await StatisticService.get();
    //     this.gameStatistic = this.statistic.optional.gamePuzzle
    //         ? JSON.parse(this.statistic.optional.gamePuzzle)
    //         : [];
    // }

    // putStatistic = () => {
    //     const { optional } = this.statistic;
    //     const gameStatistic = JSON.stringify(this.gameStatistic);
    //     optional.gamePuzzle = gameStatistic;
    //     const statistic = StatisticService.createObject(this.statistic.learnedWords, optional);
    //     StatisticService.put(statistic);
    // }

    // addStatisticsData = (level, page) => {
    //     const options = {
    //         day: 'numeric',
    //         month: 'long',
    //         hour: 'numeric',
    //         minute: 'numeric',
    //         second: 'numeric',
    //         hour12: false,
    //     };
    //     const date = new Date();
    //     const dateString = date.toLocaleString('en', options);
    //     const timeStamp = date.getTime();
    //     const statisticsField = {
    //         date: timeStamp,
    //         group: level,
    //         page,
    //         incorrect: this.results.dontKnow.length,
    //         correct: this.results.know.length,
    //     };
    //     this.gameStatistic.push(statisticsField);
    //     this.putStatistic();
    // }

    loadWords = async () => {
        const {
            isGameWithUserWords,
            isGameWithLevels,
        } = this.props;
        const {
            level,
            page,
            wordCount,
        } = this.state;
        if (isGameWithLevels) {
            const calculatingPage = Math.floor((page - 1) / 2);
            const calculatingLevel = level - 1;
            this.allWords = await WordService.getWords(calculatingLevel, calculatingPage);
        }
        if (isGameWithUserWords) {
            const data = await WordService.getUserWords();
            this.allWords = this.getRandomData(data);
        }
        this.createDataForGame(wordCount);
        this.setState({ haveWords: true });
    }

    createDataForGame = (wordCount) => {
        const {
            isGameWithUserWords,
            isGameWithLevels,
        } = this.props;
        const {
            page,
        } = this.state;
        let dataForGameRound;
        if (isGameWithLevels) {
            dataForGameRound = (page - 1) % 2 === 0
                ? this.allWords.slice(0, 10)
                : this.allWords.slice(10, 20);
        }
        if (isGameWithUserWords) {
            dataForGameRound = this.allWords.slice();
        }

        console.log(dataForGameRound)
        this.filterData = dataForGameRound.map((data) => ({
            word: data.word,
            wordTranslate: data.wordTranslate,
            wordAudio: data.audio,
            wordTranscription: data.transcription,
            wordId: data.id,
            wordImage: data.image,
        }));
        console.log(this.filterData)
        // this.wordsTranslate = dataForGameRound.map((data) => data.wordTranslate);
        // this.wordsAudio = dataForGameRound.map((data) => data.audio);
        // this.wordsTranscription = dataForGameRound.map((data) => data.transcription);
        // this.sentence = wordsForGameRound[wordCount].textExample.replace(/(<([^>]+)>)/g, '');
        // this.sentenceForPuzzle = this.mixWords(this.sentence);
        // this.translateSentence = wordsForGameRound[wordCount].textExampleTranslate;
        // this.audioSentence = wordsForGameRound[wordCount].audioExample;
        // this.image = wordsForGameRound[wordCount].image;
        this.setState({
            dataForGame: this.filterData,
            // sentence: this.sentence,
            // sentenceForPuzzle: this.sentenceForPuzzle,
            // translateSentence: this.translateSentence,
            // audioSentence: this.audioSentence,
            // image: this.image,
            // isNext: true,
        });
    }

    // mixWords = (sentence) => {
    //     const newSentence = sentence.split(' ');
    //     const randomSentence = [];
    //     for (let i = newSentence.length - 1; i >= 0; i -= 1) {
    //         const randomIndex = this.randomInteger(0, i);
    //         randomSentence.push(newSentence[randomIndex]);
    //         newSentence.splice(randomIndex, 1);
    //     }
    //     return randomSentence.join(' ');
    // }

    // getRandomData = (data) => {
    //     const newData = data.slice();
    //     const randomData = [];
    //     for (let i = 9; i >= 0; i -= 1) {
    //         const randomIndex = this.randomInteger(0, newData.length - 1);
    //         randomData.push(newData[randomIndex]);
    //         newData.splice(randomIndex, 1);
    //     }
    //     return randomData;
    // }

    // randomInteger = (min, max) => {
    //     const rand = min - 0.5 + Math.random() * (max - min + 1);
    //     return Math.round(rand);
    // }

    // showButton = (name, boolean) => {
    //     this.setState({ [name]: boolean });
    // }

    // clickDontKnow = () => {
    //     this.setState({ isClickedDontKnow: true });
    // }

    // getNextWord = (count) => {
    //     this.setState({
    //         wordCount: count,
    //         isCheckBtn: false,
    //         isContinueBtn: false,
    //         isDontKnowBtn: true,
    //         isResultBtn: false,
    //         isNext: false,
    //     });
    // }

    selectLevel = (level, page) => {
        const {
            isGameWithUserWords,
            isGameWithLevels,
        } = this.props;
        if (isGameWithLevels) {
            this.setState({
                level,
                page,
                haveWords: false,
                correctWords: [],
                isGameModeTrain: true,
                listening: false,
                isClickedCard: false,
                // wordCount: 0,
            }, this.handleListening);
        }
        if (isGameWithUserWords) {
            this.setState(() => ({
                // wordCount: 0,
                haveWords: false,
                correctWords: [],
                isGameModeTrain: true,
                listening: false,
                isClickedCard: false,
            }), this.handleListening);
        }
        // this.results.know = [];
        // this.results.dontKnow = [];
        this.putSettings(level, page);
    }

    // checkBoxHandle = (prop) => {
    //     this.setState((prev) => ({
    //         [prop]: !prev[prop],
    //     }));
    // }

    // addToResults = (result, sentence, audioUrl) => {
    //     this.results[result].push({ sentence, audioUrl });
    // }

    // showResults = () => {
    //     const { level, page } = this.state;
    //     this.setState({ isRoundEnd: true });
    //     this.addStatisticsData(level, page);
    // }

    // handleByNextRound = () => {
    //     const {
    //         level,
    //         page,
    //     } = this.state;
    //     this.setState({ isRoundEnd: false });
    //     if (level === 6 && page === 60) {
    //         this.selectLevel(1, 1);
    //     }
    //     if (page < 60) {
    //         this.selectLevel(level, parseFloat(page) + 1);
    //     } else {
    //         this.selectLevel(level + 1, 1);
    //     }
    //     this.results.know = [];
    //     this.results.dontKnow = [];
    // }

    handleClickCard = (index, audioUrl, imageUrl, translate) => {
        console.log('asd')
        this.setState({
            isClickedCard: true,
            indexClickedCard: index,
            activeAudioUrl: `https://raw.githubusercontent.com/aidfromdeagland/rslang-data/master/${audioUrl}`,
            activeImageUrl: `https://raw.githubusercontent.com/aidfromdeagland/rslang-data/master/${imageUrl}`,
            activeTranslate: translate,
        });
    }

    changeGameMode = () => {
        this.setState((prev) => ({
            isGameModeTrain: !prev.isGameModeTrain,
            listening: !prev.listening,
            correctWords: [],
            isClickedCard: false,
        }), this.handleListening);
        // this.handleListening();
    }

    handleListening = () => {
        this.setState({
            isClickedCard: false,
            indexClickedCard: null,
            activeAudioUrl: null,
            activeImageUrl: null,
            activeTranslate: null,
        });

        // console.log('listening?', this.state.listening)

        if (this.state.listening) {
            recognition.start()
            recognition.onend = () => {
                // console.log("...continue listening...")
                recognition.start()
            }
        } else {
            recognition.stop()
            recognition.onend = () => {
                // console.log("Stopped listening per click")
            }
        }

        // recognition.onstart = () => {
        // console.log("Listening!")
        // }

        let finalTranscript = ''
        recognition.onresult = event => {
            let interimTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                console.log(transcript)
                this.setState({ speakWord: transcript });
                this.checkWords(transcript);


                if (event.results[i].isFinal) finalTranscript += transcript + ' ';
                else interimTranscript += transcript;
            }


            const transcriptArr = finalTranscript.split(' ')
            const stopCmd = transcriptArr.slice(-3, -1)

            if (stopCmd[0] === 'stop' && stopCmd[1] === 'listening') {
                recognition.stop()
                recognition.onend = () => {
                    const finalText = transcriptArr.slice(0, -3).join(' ')
                }
            }
        }


        recognition.onerror = event => {
            console.log("Error occurred in recognition: " + event.error)
        };
    }

    checkWords = (word) => {
        // const wordsData = this.state.dataForGame.map((data) => data.word);
        const correctWords = this.state.correctWords.slice();
        this.state.dataForGame.forEach((wordData) => {
            if (wordData.word.toLowerCase() === word.toLowerCase()) {
                correctWords.push(word.toLowerCase());
                this.setState({
                    correctWords,
                    activeImageUrl: `https://raw.githubusercontent.com/aidfromdeagland/rslang-data/master/${wordData.wordImage}`,
                    isClickedCard: true,
                    activeTranslate: wordData.wordTranslate,
                });
            }
        });
    }

    render() {
        const {
            haveWords,
            dataForGame,
            indexClickedCard,
            isClickedCard,
            activeAudioUrl,
            activeImageUrl,
            activeTranslate,
            correctWords,
            //     sentence,
            //     sentenceForPuzzle,
            //     translateSentence,
            //     audioSentence,
            //     isNext,
            //     isRoundEnd,
            level,
            page,
            isGameModeTrain,
            speakWord,
            //     isAutoPronunciation,
            //     isPicture,
            //     image,
            //     isClickedDontKnow,
            //     wordCount,
            //     isContinueBtn,
            //     isCheckBtn,
            //     isDontKnowBtn,
            //     isResultBtn,

        } = this.state;
        const {
            isGameWithLevels,
        } = this.props;
        if (haveWords) {
            return (
                <div>
                    <div className="game-speakit__header">
                        {isGameWithLevels && (
                            <Dropdown
                                selectLevel={this.selectLevel}
                                level={level}
                                page={page}
                            />
                        )}
                    </div>
                    <div className="content">
                        <span className="content__points"> </span>
                        <ul className="cards-container">
                            <li className="scene">
                                <img className="scene__image" alt="image" src={isClickedCard ? activeImageUrl : question} />
                                <p className={isGameModeTrain ? 'scene__translation' : 'scene__translation scene__translation_game'}>{activeTranslate}</p>
                            </li>
                            {dataForGame.map((wordData, index) => (
                                <ItemWord
                                    key={wordData.wordId}
                                    wordData={wordData}
                                    // onClick={() => this.handleClickCard(index)}
                                    cardIndex={index}
                                    indexClickedCard={indexClickedCard}
                                    isClickedCard={isGameModeTrain ? isClickedCard : null}
                                    handleClickCard={this.handleClickCard}
                                    activeAudioUrl={activeAudioUrl}
                                    activeImageUrl={activeImageUrl}
                                    isGameModeTrain={isGameModeTrain}
                                    speakWord={speakWord}
                                    correctWords={correctWords}
                                />
                            ))}
                        </ul>
                        <Button
                            className="button content__button content__button_speak"
                            title={isGameModeTrain ? 'speak' : 'on air'}
                            onClick={this.changeGameMode}
                        />
                    </div>
                </div>
            );
        }
        return <Spinner />;
    }
}
