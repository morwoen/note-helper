import React from 'react';
import _ from 'lodash';
import Metronome from './Metronome';
import Piano from './Piano';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import './App.css';

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

  getRandomNote() {
    const index = _.random(_.size(this.state.notes)-1);
    return this.state.notes[index];
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

    this.setState({
      rows: [...this.state.rows, {
        id: _.uniqueId(),
        data: [
          this.getRandomNote(),
          this.getRandomNote(),
          this.getRandomNote(),
          this.getRandomNote(),
          this.getRandomNote(),
          this.getRandomNote(),
          this.getRandomNote(),
          this.getRandomNote(),
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
        <div className="App-controls">
          <Piano onChange={(notes) => this.setState({ notes })} />
          <Metronome
            ref={this.metronome}
            tempo={120}
            onWholeClick={() => {
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
            }}
            onPlay={() => {
              this.generateRow(4 - numRows);
              this.setState({
                initialClick: false,
                playing: true,
              });
            }}
            onStop={() => {
              this.setState({
                playing: false,
              });
            }}
          />
        </div>
        <header className="App-header">
          <div className="App-button-row">
            <Button variant="contained" color="primary" onClick={() => this.generateRow(4 - numRows)} disabled={this.state.playing}>
              Generate Notes
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
          <div className="App-note-display-container">
            {this.state.rows.map((row, indexRow) => (
              <div ref={!indexRow && this.firstBar} key={row.id} className="App-note-display-row">
                <span className="App-note-display-clef">&#x1d122;</span>
                {row.data.map((note, indexNote) => {
                  const isCurrent = this.state.highlightRow === indexRow && this.state.highlightNote === indexNote;
                  const isNext = nextHighlightedRow === indexRow && nextHighlightedNote === indexNote;
                  return (
                    <div key={indexNote} className="App-note-display-note-container">
                      <div className={`App-note-display-note ${isCurrent && 'highlight'} ${isNext && 'next-highlight'}`}>
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
