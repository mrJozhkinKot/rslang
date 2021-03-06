import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatisticService } from '../../../services/statisticServices';
import { statisticsDefault } from '../../../constants/globalConstants';

const Row = ({
    date, win, lose, success,
}) => (
    <div className="row">
        <div>{date}</div>
        <div>{win}</div>
        <div>{lose}</div>
        <div>{success}</div>

    </div>
);
export class TablePuzzle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        };
    }

    componentDidMount() {
        this.loadGameData();
    }

     loadGameData = async () => {
         const { loadStatistics } = this.props;
         this.res = await StatisticService.get();
         const dataGame = this.res.optional.gamePuzzle
             ? JSON.parse(this.res.optional.gamePuzzle)
             : JSON.parse(statisticsDefault.optional.gamePuzzle);
         const data = loadStatistics(dataGame);
         this.setState({
             data,
         });
     }

     render() {
         const data = this.state.data.slice(1);
         const rows = data.map((rowData, index) => (
             <Row
                 key={index}
                 {...rowData}
             />

         ));

         return (
             <div className="table">
                 <div className="table__header">
                     <div>Last Game</div>
                     <div>Correct Answers</div>
                     <div>Wrong Answers</div>
                     <div>% success</div>

                 </div>
                 <div>
                     {rows}
                 </div>
             </div>
         );
     }
}

TablePuzzle.propTypes = {
    loadStatistics: PropTypes.func.isRequired,
};
