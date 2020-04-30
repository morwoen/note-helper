import React from 'react';
import _ from 'lodash';
// import ScheduledMetronome from './Metronome';
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
    this.state = {
      notes: [],
      rows: [],
      errorShown: false,
      error: '',
    };
  }

  getRandomNote() {
    const index = _.random(_.size(this.state.notes)-1);
    return this.state.notes[index];
  }

  generateRow(n = 1) {
    if (n === 0) return;

    if (_.isEmpty(this.state.notes)) {
      this.setState({
        errorShown: true,
        error: 'Select at least one note on the piano'
      });
      return;
    }
    this.setState({ rows: [...this.state.rows, {
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
    }]}, () => {
      this.generateRow(n-1);
    });

    if (this.firstBar.current && _.size(this.state.rows) > 4) {
      this.firstBar.current.addEventListener('animationend', () => {
        this.setState({
          rows: this.state.rows.slice(1),
        });
      });
      this.firstBar.current.classList.add('animated', 'fadeOutUp');
    }
  }

  resetRows() {
    this.setState({ rows: [] });
  }

  startGeneration() {
    clearInterval(this.interval);
    this.generateRow(4);
    this.interval = setInterval(() => {
      this.generateRow();
    }, 3000);
  }

  stopGeneration() {
    clearInterval(this.interval);
    this.resetRows();
  }

  render() {
    return (
      <div className="App">
        <div className="App-piano">
          <Piano onChange={(notes) => this.setState({ notes })} />
        </div>
        <header className="App-header">
          <div className="App-button-row">
            <Button variant="contained" color="primary" onClick={() => this.generateRow()}>
              Generate 8 bars
            </Button>
            <Button variant="contained" color="primary" onClick={() => this.startGeneration()}>
              Generate Continuously
            </Button>
            <Button variant="contained" color="primary" onClick={() => this.stopGeneration()}>
              Clear
            </Button>
          </div>
          <div className="App-note-display-container">
            {this.state.rows.map((row, index) => (
              <div ref={!index && this.firstBar} key={row.id} className="App-note-display-row">
                <span className="App-note-display-clef">&#x1d122;</span>
                {row.data.map((note, indexNote) => (
                  <div key={indexNote} className="App-note-display-note">{note}</div>
                ))}
              </div>
            ))}
          </div>
          <Snackbar open={this.state.errorShown} autoHideDuration={6000} onClose={() => this.setState({ errorShown: false })}>
            <Alert onClose={() => this.setState({ errorShown: false })} severity="error">
              {this.state.error}
            </Alert>
          </Snackbar>
        </header>
      </div>
    );
  }
}
