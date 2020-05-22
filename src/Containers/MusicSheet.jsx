import React, { Fragment } from 'react';
import _ from 'lodash';

import { Button } from '@material-ui/core';

import { EVENTS } from '../App';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.firstBar = React.createRef();
    this.state = {
      rows: [],
      highlightNote: -1,
      highlightRow: 0,
    }
  }

  getRandomNote(lastNote) {
    const {
      notes
    } = this.props;
    const index = _.random(_.size(notes) - 1);
    let note = notes[index];
    if (note === lastNote) {
      note = notes[(index + 1) % _.size(notes)];
    }
    return note;
  }

  generateRow(n = 1) {
    const {
      notes,
      error,
    } = this.props;
    const {
      rows,
      highlightRow,
    } = this.state;

    if (n < 1) return;

    if (_.isEmpty(notes)) {
      error('Select at least one note on the piano');
      return;
    }

    const lastNote = _.chain(rows)
      .last()
      .get('data')
      .last()
      .value();

    const note0 = this.getRandomNote(lastNote);
    const note1 = this.getRandomNote(note0);
    const note2 = this.getRandomNote(note1);
    const note3 = this.getRandomNote(note2);
    const note4 = this.getRandomNote(note3);
    const note5 = this.getRandomNote(note4);
    const note6 = this.getRandomNote(note5);
    const note7 = this.getRandomNote(note6);

    this.setState({
      rows: [...rows, {
        id: _.uniqueId(),
        data: [
          note0,
          note1,
          note2,
          note3,
          note4,
          note5,
          note6,
          note7,
        ],
      }],
    }, () => {
      this.generateRow(n-1);
    });

    if (this.firstBar.current && _.size(this.state.rows) > 4) {
      this.firstBar.current.addEventListener('animationend', () => {
        this.setState({
          rows: this.state.rows.slice(1),
          highlightRow: Math.max(highlightRow - 1, 0),
        });
      });
      this.firstBar.current.classList.add('animated', 'fadeOutUp');
    }
  }

  setNextNote() {
    const {
      initialClick
    } = this.state;

    const {
      newRow,
      nextHighlightedRow,
      nextHighlightedNote,
    } = this.getCurrentRowInformation();

    if (!initialClick) {
      this.setState({
        initialClick: true,
      });
    } else {
      if (newRow) {
        this.generateRow();
      }
      this.setState({
        highlightNote: nextHighlightedNote || 0,
        highlightRow: nextHighlightedRow || 0,
      });
    }
  }

  renderRows(nextHighlightedRow, nextHighlightedNote) {
    const {
      rows,
      highlightRow,
      highlightNote,
    } = this.state;

    return (
      <Fragment>
        {rows.map((row, indexRow) => (
          <div ref={!indexRow && this.firstBar} key={row.id} className="App__note-display--row">
            <span className="App__note-display--clef">&#x1d122;</span>
            {row.data.map((note, indexNote) => {
              const isCurrent = highlightRow === indexRow && highlightNote === indexNote;
              const isNext = nextHighlightedRow === indexRow && nextHighlightedNote === indexNote;
              return (
                <div key={indexNote} className="App__note-display--note-container">
                  <div className={`App__note-display--note ${isCurrent && 'highlight'} ${isNext && 'next-highlight'}`}>
                    {note}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </Fragment>
    );
  }

  resetRows() {
    this.setState({
      rows: [],
      highlightNote: -1,
      highlightRow: 0,
      initialClick: false,
    });

    this.props.clearRows();
  }

  resetPosition() {
    const {
      rows
    } = this.state;

    if(rows.length < 1) {
      this.generateRow(4);
    }

    this.setState({
      highlightNote: -1,
      highlightRow: 0,
      initialClick: false,
    });
  }

  getCurrentRowInformation() {
    const {
      rows,
      highlightRow,
      highlightNote,
    } = this.state;

    const notes = _.chain(rows)
      .get(highlightRow)
      .get('data')
      .size()
      .value();
    const numRows = _.size(rows);
    let nextHighlightedNote = highlightNote + 1;
    const newRow = Math.floor(nextHighlightedNote / notes);
    const nextHighlightedRow = highlightRow + newRow;
    nextHighlightedNote = nextHighlightedNote % notes;

    return {
      numRows,
      nextHighlightedRow,
      nextHighlightedNote,
      newRow,
    }
  }

  handleMetronomePlay() {
    const {
      numRows,
    } = this.getCurrentRowInformation();

    this.generateRow(4 - numRows);
    this.setState({
      initialClick: false,
    });
  }

  componentDidMount() {
    document.addEventListener(EVENTS.PLAYER.START_OVER, () => this.resetPosition());
    document.addEventListener(EVENTS.METRONOME.WHOLE_CLICK, () => this.setNextNote());
    document.addEventListener(EVENTS.METRONOME.PLAY, () => this.handleMetronomePlay());
  }

  render() {
    const {
      play,
      playing,
      startOver,
    } = this.props;

    const {
      numRows,
      nextHighlightedRow,
      nextHighlightedNote,
    } = this.getCurrentRowInformation();

    return (
      <Fragment>
        <div className="App__button-row">
          <Button variant="contained" color="primary" onClick={() => {
            if(numRows) {
              play();
            } else {
              this.generateRow(4);
            }
          }}>
            {numRows ? (playing ? 'Stop' : 'Play') : 'Generate Notes'}
          </Button>
          <Button variant="contained" color="primary" onClick={startOver}>
            {numRows ? 'Start Over' : 'Generate and Play'}
          </Button>
          <Button variant="contained" color="primary" onClick={() => this.resetRows()}>
            Clear
          </Button>
        </div>
        <div className="App__note-display--container">
          {this.renderRows(nextHighlightedRow, nextHighlightedNote)}
        </div>
      </Fragment>
    );
  }
}
