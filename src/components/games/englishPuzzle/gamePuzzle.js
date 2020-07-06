import React, { Component } from 'react';
import './startPage.scss';
import PropTypes from 'prop-types';
import { Dropdown } from './dropDown/DropDown';
import { Checkbox } from './checkBox/checkBox';
import { WordService } from '../../../services/wordServices';
import { Spinner } from '../../shared/spinner';
import './game-puzzle.scss';
import { GameBoardAction } from './gameBoardAction';
import { ButtonsBlock } from './buttonsGame';
import { ModalResult } from './modalStatistics/modalResult';
import { SettingService } from '../../../services/settingServices';
import { settingsDefault } from '../../../constants/globalConstants';
import { StatisticService } from '../../../services/statisticServices';

export class GamePuzzle extends Component {
    constructor(props) {
        super(props);
        this.statistic = [];
        this.results = {
            know: [],
            dontKnow: [],
        };
        this.state = {
            level: 1,
            page: 1,
            wordCount: 0,
            haveWords: false,
            isCheckBtn: false,
            isContinueBtn: false,
            isDontKnowBtn: true,
            isResultBtn: false,
            isClickedDontKnow: false,
            isAutoPronunciation: true,
            isPicture: true,
            isRoundEnd: false,
            isNext: true,
        };
    }

    componentDidMount() {
        const { haveWords } = this.state;
        if (!haveWords) {
            this.loadSettings();
            this.loadStatistic();
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
        if (!isNext) {
            this.createDataForGame(wordCount);
        }
    }

    loadSettings = async () => {
        this.settings = await SettingService.get();
        const settingsForGame = this.settings.optional.gamePuzzle
            ? JSON.parse(this.settings.optional.gamePuzzle)
            : JSON.parse(settingsDefault.gamePuzzle);
        this.setState({
            level: settingsForGame.level,
            page: settingsForGame.page,
        });
        this.loadWords();
    }

    putSettings = (level, page) => {
        const gameSettings = JSON.stringify({
            level,
            page,
        });
        this.settings.optional.gamePuzzle = gameSettings;
        const settings = SettingService.createObject(this.settings.wordsPerDay, this.settings.optional);
        SettingService.put(settings);
    }

    loadStatistic = async () => {
        this.statistic = await StatisticService.get();
        console.log(this.statistic);
        this.gameStatistic = this.statistic.optional.gamePuzzle ? JSON.parse(this.statistic.optional.gamePuzzle) : [];
    }

    putStatistic = () => {
        const gameStatistic = JSON.stringify(this.gameStatistic);
        this.statistic.optional.gamePuzzle = gameStatistic;
        const statistic = StatisticService.createObject(0, this.statistic.optional);
        console.log(statistic);
        StatisticService.put(statistic);
    }

    addStatisticsData = (level, page) => {
        const options = {
            day: 'numeric',
            month: 'long',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
        };
        const date = new Date();
        const dateString = date.toLocaleString('en', options);

        const statisticsField = `${dateString}:  Level: ${level}, Page: ${page} - I don't know: ${this.results.dontKnow.length}; I know: ${this.results.know.length}`;
        this.gameStatistic.push(statisticsField);
        this.putStatistic();
        // return statisticsField;
        // activeUser.complete.push({ level, page });
        // document.querySelector('.option-container-pages').children[page - 1].classList.add('completed-page');
        // activeUser.statistics.push(statisticsField);
    }

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
        let wordsForGameRound;
        if (isGameWithLevels) {
            wordsForGameRound = (page - 1) % 2 === 0
                ? this.allWords.slice(0, 10)
                : this.allWords.slice(10, 20);
        }
        if (isGameWithUserWords) {
            wordsForGameRound = this.allWords.slice();
        }
        this.sentence = wordsForGameRound[wordCount].textExample.replace(/(<([^>]+)>)/g, '');
        this.sentenceForPuzzle = this.mixWords(this.sentence);
        this.translateSentence = wordsForGameRound[wordCount].textExampleTranslate;
        this.audioSentence = wordsForGameRound[wordCount].audioExample;
        this.image = wordsForGameRound[wordCount].image;
        this.setState({
            sentence: this.sentence,
            sentenceForPuzzle: this.sentenceForPuzzle,
            translateSentence: this.translateSentence,
            audioSentence: this.audioSentence,
            image: this.image,
            isNext: true,
        });
    }

    mixWords = (sentence) => {
        const newSentence = sentence.split(' ');
        const randomSentence = [];
        for (let i = newSentence.length - 1; i >= 0; i -= 1) {
            const randomIndex = this.randomInteger(0, i);
            randomSentence.push(newSentence[randomIndex]);
            newSentence.splice(randomIndex, 1);
        }
        return randomSentence.join(' ');
    }

    getRandomData = (data) => {
        const newData = data.slice();
        const randomData = [];
        for (let i = 9; i >= 0; i -= 1) {
            const randomIndex = this.randomInteger(0, newData.length - 1);
            randomData.push(newData[randomIndex]);
            newData.splice(randomIndex, 1);
        }
        return randomData;
    }

    randomInteger = (min, max) => {
        const rand = min - 0.5 + Math.random() * (max - min + 1);
        return Math.round(rand);
    }

    showButton = (name, boolean) => {
        this.setState({ [name]: boolean });
    }

    clickDontKnow = () => {
        this.setState({ isClickedDontKnow: true });
    }

    getNextWord = (count) => {
        this.setState({
            wordCount: count,
            isCheckBtn: false,
            isContinueBtn: false,
            isDontKnowBtn: true,
            isResultBtn: false,
            isNext: false,
        });
    }

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
                wordCount: 0,
                isCheckBtn: false,
                isContinueBtn: false,
                isDontKnowBtn: true,
                isResultBtn: false,
            });
        }
        if (isGameWithUserWords) {
            this.setState(() => ({
                wordCount: 0,
                isCheckBtn: false,
                isContinueBtn: false,
                isDontKnowBtn: true,
                isResultBtn: false,
                haveWords: false,
            }));
        }
        this.results.know = [];
        this.results.dontKnow = [];
        this.putSettings(level, page);
    }

    checkBoxHandle = (prop) => {
        this.setState((prev) => ({
            [prop]: !prev[prop],
        }));
    }

    addToResults = (result, sentence, audioUrl) => {
        this.results[result].push({ sentence, audioUrl });
    }

    showResults = () => {
        const { level, page } = this.state;
        this.setState({ isRoundEnd: true });
        this.addStatisticsData(level, page);
        console.log(this.statistic)
    }

    handleByNextRound = () => {
        const {
            level,
            page,
        } = this.state;
        this.setState({ isRoundEnd: false });
        if (level === 6 && page === 60) {
            this.selectLevel(1, 1);
        }
        if (page < 60) {
            this.selectLevel(level, parseFloat(page) + 1);
        } else {
            this.selectLevel(level + 1, 1);
        }
        this.results.know = [];
        this.results.dontKnow = [];
    }

    render() {
        const {
            haveWords,
            sentence,
            sentenceForPuzzle,
            translateSentence,
            audioSentence,
            isNext,
            isRoundEnd,
            level,
            page,
            isAutoPronunciation,
            isPicture,
            image,
            isClickedDontKnow,
            wordCount,
            isContinueBtn,
            isCheckBtn,
            isDontKnowBtn,
            isResultBtn,

        } = this.state;
        const {
            isGameWithLevels,
        } = this.props;
        if (haveWords) {
            return (
                <div className="game-puzzle__container">
                    {isRoundEnd && (
                        <ModalResult
                            results={this.results}
                            handleByNextRound={this.handleByNextRound}
                        />
                    )}
                    <div className="game-puzzle__header">
                        {isGameWithLevels && (
                            <Dropdown
                                selectLevel={this.selectLevel}
                                level={level}
                                page={page}
                            />
                        )}
                        <div className="checkbox__options_container">
                            <Checkbox
                                text="Auto pronunciation"
                                checked={isAutoPronunciation}
                                checkBoxHandle={() => this.checkBoxHandle('isAutoPronunciation')}
                            />
                            <Checkbox
                                text="Show Picture"
                                checked={isPicture}
                                checkBoxHandle={() => this.checkBoxHandle('isPicture')}
                            />
                        </div>
                    </div>
                    <div className="game-board">
                        {isPicture && (
                            <div className="image-container">
                                <img src={`https://raw.githubusercontent.com/aidfromdeagland/rslang-data/master/${image}`} alt="img" />
                            </div>
                        )}
                        <div className="game-board__translation">
                            <span>{translateSentence}</span>
                        </div>
                        {isNext ? (
                            <GameBoardAction
                                sentenceForPuzzle={sentenceForPuzzle}
                                correctSentence={sentence}
                                showCheck={this.showCheck}
                                showButton={this.showButton}
                                isClickedDontKnow={isClickedDontKnow}
                            />
                        ) : ''}
                        <ButtonsBlock
                            wordCount={wordCount}
                            isCheckBtn={isCheckBtn}
                            isContinueBtn={isContinueBtn}
                            isDontKnowBtn={isDontKnowBtn}
                            isResultBtn={isResultBtn}
                            correctSentence={sentence}
                            showButton={this.showButton}
                            getNextWord={this.getNextWord}
                            clickDontKnow={this.clickDontKnow}
                            selectLevel={this.selectLevel}
                            level={level}
                            page={page}
                            audioSentence={audioSentence}
                            isAutoPronunciation={isAutoPronunciation}
                            addToResults={this.addToResults}
                            showResults={this.showResults}
                            isRoundEnd={isRoundEnd}
                        />
                    </div>
                    <div className="progress-bar-game">
                        <div className="progress-percent-game" style={{ width: `${(wordCount + 1) * 10}%` }} />
                    </div>
                </div>
            );
        }
        return <Spinner />;
    }
}

GamePuzzle.defaultProps = {
    isGameWithLevels: false,
    isGameWithUserWords: false,
};

GamePuzzle.propTypes = {
    isGameWithLevels: PropTypes.bool,
    isGameWithUserWords: PropTypes.bool,
};
