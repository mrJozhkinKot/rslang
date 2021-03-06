import { backend } from '../constants/globalConstants';
import { User } from '../components/pages/auth/user';
import { ServiceError } from './serviceError';
import { getMemoInfoMiniGames } from './spacedRepetition';

// подробное описание: https://afternoon-falls-25894.herokuapp.com/doc/#
export class WordService {
    static createWordPost(prevDate, nextDate, repeats, debutDate = Date.now(),
        isDifficult = false, isDeleted = false)/*: IWordPost */ {
        return {
            difficulty: 'useless',
            optional: {
                isDifficult,
                isDeleted,
                debutDate,
                prevDate,
                nextDate,
                repeats,
            },
        };
    }

    static createStatisticWordPut(userWord, isCorrect)/*: IWordPost */ {
        const newState = getMemoInfoMiniGames(isCorrect, userWord.optional.repeats,
            userWord.optional.nextDate);
        const updateUserWord = userWord;
        updateUserWord.optional.prevDate = newState.nextRepetitionDate;
        updateUserWord.optional.nextDate = newState.nextRepetitionDate;
        updateUserWord.optional.repeats = newState.repetitions;
        return updateUserWord;
    }

    static async getWords(group, page) {
        const rawResponse = await fetch(`${backend}/words?group=${group}&page=${page}`);
        if (rawResponse.ok) {
            const content = await rawResponse.json();
            return content; // IWord[]
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }

    static async getWordsExt(group, page, maxWordCountInExample, wordsPerPage) {
        // так как мы сами указваем количество записей на странице, то
        // количество страниц в группе уже не 30, а getWordsCount
        const rawResponse = await fetch(`${backend}/words?group=${group}&page=${page}&wordsPerExampleSentenceLTE=${maxWordCountInExample}&wordsPerPage=${wordsPerPage}`);
        if (rawResponse.ok) {
            const content = await rawResponse.json();
            return content; // IWord[]
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }

    static async getWordsPageCount(group, wordsPerExampleSentenceLTE, wordsPerPage) {
        const rawResponse = await fetch(`${backend}/words/count?group=${group}&wordsPerExampleSentenceLTE=${wordsPerExampleSentenceLTE}&wordsPerPage=${wordsPerPage}`);
        if (rawResponse.ok) {
            const content = await rawResponse.json();
            return content.count;
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }

    static async getWord(id) {
        const rawResponse = await fetch(`${backend}/words/${id}`);
        if (rawResponse.ok) {
            const content = await rawResponse.json();
            return content; // IWord
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }

    static async getUserWords() {
        const rawResponse = await fetch(`${backend}/users/${User.userId}/words`, {
            method: 'GET',
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${User.token}`,
                Accept: 'application/json',
            },
        });
        if (rawResponse.ok) {
            const content = await rawResponse.json();
            return content; // IUserWord[]
        }
        if (rawResponse.status === 401) {
            throw new ServiceError('Access token is missing or invalid', rawResponse.status);
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }

    static async getUserWord(id) {
        const rawResponse = await fetch(`${backend}/users/${User.userId}/words/${id}`, {
            method: 'GET',
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${User.token}`,
                Accept: 'application/json',
            },
        });
        if (rawResponse.ok) {
            const content = await rawResponse.json();
            return content; // IUserWord
        }
        if (rawResponse.status === 401) {
            throw new ServiceError('Access token is missing or invalid', rawResponse.status);
        }
        if (rawResponse.status === 404) {
            throw new ServiceError('User\'s word not found', rawResponse.status);
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }

    static async postWord(wordId, word/*: IWordPost */) {
        const rawResponse = await fetch(`${backend}/users/${User.userId}/words/${wordId}`, {
            method: 'POST',
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${User.token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(word),
        });
        if (rawResponse.ok) {
            const content = await rawResponse.json();
            return content; // IUserWord[]
        }
        if (rawResponse.status === 400) {
            throw new ServiceError('Bad request', rawResponse.status);
        }
        if (rawResponse.status === 401) {
            throw new ServiceError('Access token is missing or invalid', rawResponse.status);
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }

    static async putWord(wordId, word/*: IWordPost */) {
        const rawResponse = await fetch(`${backend}/users/${User.userId}/words/${wordId}`, {
            method: 'PUT',
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${User.token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(word),
        });
        if (rawResponse.ok) {
            const content = await rawResponse.json();
            return content;
        }
        if (rawResponse.status === 400) {
            throw new ServiceError('Bad request', rawResponse.status);
        }
        if (rawResponse.status === 401) {
            throw new ServiceError('Access token is missing or invalid', rawResponse.status);
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }

    static async deleteWord(wordId) {
        const rawResponse = await fetch(`${backend}/users/${User.userId}/words/${wordId}`, {
            method: 'DELETE',
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${User.token}`,
                Accept: 'application/json',
            },
        });
        if (rawResponse.ok) {
            return true; // слово удалено, либо слова у пользователя не было
        }
        if (rawResponse.status === 401) {
            throw new ServiceError('Access token is missing or invalid', rawResponse.status);
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }

    static async getUserAggWords(group, filter = '', wordsPerPage = 20) {
        const url = `${backend}/users/${User.userId}/aggregatedWords`
            + `?group=${group}&filter=${JSON.stringify(filter)}&wordsPerPage=${wordsPerPage}`;
        const rawResponse = await fetch(url, {
            method: 'GET',
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${User.token}`,
                Accept: 'application/json',
            },
        });
        if (rawResponse.ok) {
            const content = await rawResponse.json();
            content[0].paginatedResults.map((w) => {
                const word = w;
                // eslint-disable-next-line no-underscore-dangle
                word.id = w._id;
                // eslint-disable-next-line no-underscore-dangle
                delete word._id;
                return word;
            });
            return content; //  IAggWords[]
        }
        if (rawResponse.status === 401) {
            throw new ServiceError('Access token is missing or invalid', rawResponse.status);
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }

    static async getUserAggWord(id) {
        const rawResponse = await fetch(`${backend}/users/${User.userId}/aggregatedWords/${id}`, {
            method: 'GET',
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${User.token}`,
                Accept: 'application/json',
            },
        });
        if (rawResponse.ok) {
            const content = await rawResponse.json();
            return content; // IAggWord
        }
        if (rawResponse.status === 401) {
            throw new ServiceError('Access token is missing or invalid', rawResponse.status);
        }
        if (rawResponse.status === 404) {
            throw new ServiceError('User\'s word not found', rawResponse.status);
        }

        const errorText = await rawResponse.text();
        throw new ServiceError(errorText, rawResponse.status);
    }
}

// interface IWord {
//     id: string,
//     word: string,
//     image: string,
//     audio: string,
//     audioMeaning: string,
//     audioExample: string,
//     textMeaning: string,
//     textExample: string,
//     transcription: string,
//     wordTranslate: string,
//     textMeaningTranslate: string,
//     textExampleTranslate: string,
//     group: number,
//     page: number,
//     wordsPerExampleSentence: number,
// }

// interface IAggWords {
//     paginatedResults: IWord[],
//     totalCount: [ {count: number} ],
// }

// interface IAggWord {
//     id: string,
//     word: string,
//     image: string,
//     audio: string,
//     audioMeaning: string,
//     audioExample: string,
//     textMeaning: string,
//     textExample: string,
//     transcription: string,
//     wordTranslate: string,
//     textMeaningTranslate: string,
//     textExampleTranslate: string,
//     group: 0
//     page: 0
//     wordsPerExampleSentence: 7
//     userWord: IUserWord,
// }

// interface IUserWord {
//     difficulty: string,
//     id: string,
//     optional: IOptional,
//     wordId: string,
// }

// interface IOptional {
//      isDifficult: bool,
//      isDeleted: bool,
//      debutDate: number,
//      prevDate: number,
//      nextDate: number,
//      repeats: number
// }

// interface IWordPost {
//     difficulty: string,
//     optional: IOptional,
// }
