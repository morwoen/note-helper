import React from 'react';

import MuiAlert from '@material-ui/lab/Alert';
import { Snackbar } from '@material-ui/core';

import Controls from './Containers/Controls';
import MusicSheet from './Containers/MusicSheet';

import './Styles/style.scss';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export const EVENTS = {
  METRONOME: {
    WHOLE_CLICK: 'metronome:wholeClick',
    QUARTER_CLICK: 'metronome:quarterClick',
    EIGHTH_CLICK: 'metronome:eighthClick',
    TRIPLET_CLICK: 'metronome:tripletClick',
    SIXTEENTH_CLICK: 'metronome:sixteenthClick',
    PLAY: 'metronome:play',
    STOP: 'metronome:stop',
  },
  PLAYER: {
    START_OVER: 'player:startOver',
  },
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.metronome = React.createRef();
    this.state = {
      notes: [],
      errorShown: false,
      error: '',
    };

    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') !== -1) {
      if (ua.indexOf('chrome') < 0) {
        this.error('This metronome does\'t work on Safari. Try another browser');
      }
    }
  }

  selectNotes(notes) {
    this.setState({ notes });
  }

  playMetronome() {
    this.setState({
      initialClick: false,
      playing: true,
    });
  }

  stopMetronome() {
    this.setState({
      playing: false,
    });
  }

  play() {
    this.metronome.current.play();
  }

  error(message) {
    this.setState({
      error: message,
      errorShown: true,
    })
  }

  async startOver() {
    if (this.metronome.current.isPlaying()) {
      await this.metronome.current.play();
    }

    document.dispatchEvent(new CustomEvent(EVENTS.PLAYER.START_OVER));
    this.metronome.current.play();
  }

  async clearRows() {
    if (this.metronome.current.isPlaying()) {
      await this.metronome.current.play();
    }
  }

  componentDidMount() {
    document.addEventListener(EVENTS.METRONOME.PLAY, () => this.playMetronome());
    document.addEventListener(EVENTS.METRONOME.STOP, () => this.stopMetronome());
  }

  render() {
    return (
      <div className="App">
        <div className="App__controls">
          <Controls
            metronome={this.metronome}
            selectNotes={(notes) => this.selectNotes(notes)}
            playMetronome={() => this.playMetronome()}
            stopMetronome={() => this.stopMetronome()}
          />
        </div>
        <div className="App__header">
          <MusicSheet
            playing={this.state.playing}
            play={() => this.play()}
            notes={this.state.notes}
            startOver={() => this.startOver()}
            clearRows={() => this.clearRows()}
            error={(message) => this.error(message)}
          />
        </div>
        <Snackbar open={this.state.errorShown} onClose={() => this.setState({ errorShown: false })}>
          <Alert onClose={() => this.setState({ errorShown: false })} severity="error">
            {this.state.error}
          </Alert>
        </Snackbar>
      </div>
    );
  }
}
