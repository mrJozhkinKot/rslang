import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './wordList.scss';
import { VocabularyWord } from './word';

export class WordList extends Component {
    constructor(props) {
        super(props);
        this.state = { words: props.words };
    }

    removeWordHandler = (wordId) => {
        this.setState((prevState) => ({
            words: prevState.words.filter((word) => word.id !== wordId),
        }));
    }

    render() {
        const { words } = this.state;
        const { settings, isSpecial } = this.props;
        return words
            ? (
                <ul className="vocabulary__words">
                    { words.map(
                        (word) => (
                            <VocabularyWord
                                word={word}
                                key={word.id}
                                settings={settings}
                                isSpecial={isSpecial}
                                removeWordHandler={this.removeWordHandler}
                            />
                        ),
                    ) }
                </ul>
            )
            : null;
    }
}

WordList.defaultProps = {
    isSpecial: false,
};

WordList.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    settings: PropTypes.object.isRequired,
    words: PropTypes.arrayOf(PropTypes.object).isRequired,
    isSpecial: PropTypes.bool,
};
