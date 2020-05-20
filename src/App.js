import React from 'react';
import _ from 'lodash';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import Controls from './Containers/Controls';

import './Styles/style.scss';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.firstBar = React.createRef();
    this.metronome = React.createRef();
    this.state = {
      notes: [],
      rows: [],
      highlightNote: -1,
      highlightRow: 0,
      errorShown: false,
      error: '',
    };

    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') !== -1) {
      if (ua.indexOf('chrome') < 0) {
        this.state.error = 'This metronome does\'t work on Safari. Try another browser';
        this.state.errorShown = true;
      }
    }
  }

  getRandomNote(lastNote) {
    const index = _.random(_.size(this.state.notes) - 1);
    let note = this.state.notes[index];
    if (note === lastNote) {
      note = this.state.notes[(index + 1) % _.size(this.state.notes)];
    }
    return note;
  }

  generateRow(n = 1) {
    if (n < 1) return;

    if (_.isEmpty(this.state.notes)) {
      this.setState({
        errorShown: true,
        error: 'Select at least one note on the piano'
      });
      return;
    }

    const lastNote = _.chain(this.state.rows)
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
      rows: [...this.state.rows, {
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
          highlightRow: Math.max(this.state.highlightRow - 1, 0),
        });
      });
      this.firstBar.current.classList.add('animated', 'fadeOutUp');
    }
  }

  resetRows() {
    this.setState({
      rows: [],
      highlightNote: -1,
      highlightRow: 0,
    });
  }

  selectNotes(notes) {
    this.setState({ notes });
  }

  setNextRow(newRow, nextHighlightedNote, nextHighlightedRow) {
    const initialClick = this.state.initialClick;
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

  play(numRows) {
    this.generateRow(4 - numRows);
    this.setState({
      initialClick: false,
      playing: true,
    });
  }

  stop() {
    this.setState({
      playing: false,
    });
  }

  render() {
    const notes = _.chain(this.state.rows)
      .get(this.state.highlightRow)
      .get('data')
      .size()
      .value();
    const numRows = _.size(this.state.rows);
    let nextHighlightedNote = this.state.highlightNote + 1;
    const newRow = Math.floor(nextHighlightedNote / notes);
    const nextHighlightedRow = this.state.highlightRow + newRow;
    nextHighlightedNote = nextHighlightedNote % notes;

    return (
      <div className="App">
        <div className="App__controls">
          <Controls
            selectNotes={this.selectNotes.bind(this)}
            metronome={this.metronome}
            setNextRow={() => this.setNextRow(newRow, nextHighlightedNote, nextHighlightedRow)}
            play={() => this.play(numRows)}
            stop={this.stop.bind(this)}
          />
        </div>
        <header className="App__header">
          <div className="App__button-row">
            <Button variant="contained" color="primary" onClick={() => {
              if (numRows) {
                this.metronome.current.play();
              } else {
                this.generateRow(4 - numRows);
              }
            }}>
              {numRows ? (this.state.playing ? 'Stop' : 'Play') : 'Generate Notes'}
            </Button>
            <Button variant="contained" color="primary" onClick={async () => {
              if (this.metronome.current.isPlaying()) {
                await this.metronome.current.play();
              }
              this.setState({
                highlightNote: -1,
                highlightRow: 0,
              });
              this.metronome.current.play();
            }}>
              {numRows ? 'Start Over' : 'Generate and Play'}
            </Button>
            <Button variant="contained" color="primary" onClick={async () => {
              if (this.metronome.current.isPlaying()) {
                await this.metronome.current.play();
              }
              this.resetRows();
            }}>
              Clear
            </Button>
          </div>
          <div className="App__note-display--container">
            {this.state.rows.map((row, indexRow) => (
              <div ref={!indexRow && this.firstBar} key={row.id} className="App__note-display--row">
                <span className="App__note-display--clef">&#x1d122;</span>
                {row.data.map((note, indexNote) => {
                  const isCurrent = this.state.highlightRow === indexRow && this.state.highlightNote === indexNote;
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
          </div>
          <Snackbar open={this.state.errorShown} onClose={() => this.setState({ errorShown: false })}>
            <Alert onClose={() => this.setState({ errorShown: false })} severity="error">
              {this.state.error}
            </Alert>
          </Snackbar>
        </header>
      </div>
    );
  }
}
