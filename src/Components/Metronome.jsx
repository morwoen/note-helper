import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import Play from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';

export default class Metronome extends React.Component {
  static defaultProps = {
    onPlay: _.noop,
    onStop: _.noop,
    onWholeClick: _.noop,
    onQuarterClick: _.noop,
    onEighthClick: _.noop,
    onTripletClick: _.noop,
    onSixteenthClick: _.noop,
  }

  constructor(props) {
    super(props);
    this.state = {
      isPlaying: false,
      masterVolume: +localStorage.getItem('volume') || 0.5,
      tempo: +localStorage.getItem('tempo') || props.tempo || 60,
      pattern: localStorage.getItem('pattern') || 'quarter',
      meter: +localStorage.getItem('meter') || 4,
    };

    this.startTime = 0;              // The start time of the entire sequence.
    this.currentTwelveletNote = 0;        // What note is currently last scheduled?
    this.accentVolume = 1;

    this.quarterVolume = 0.75;
    this.eighthVolume = 0;
    this.sixteenthVolume = 0;
    this.tripletVolume = 0;

    this.lookahead = 25.0;       // How frequently to call scheduling function
    //(in milliseconds)
    this.scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
    // This is calculated from lookahead, and overlaps
    // with next interval (in case the timer is late)
    this.nextNoteTime = 0.0;     // when the next note is due.
    this.noteLength = 0.05;      // length of "beep" (in seconds)
    this.notesInQueue = [];      // the notes that have been put into the web audio,
    // and may or may not have played yet. {note, time}

    this.setPattern(this.state.pattern);

    this.audioContext = new AudioContext();
    this.timerWorker = new Worker("static/js/worker.js");

    this.timerWorker.onmessage = (e) => {
      if (e.data === "tick") {
        this.scheduler();
      } else {
        console.log("message: " + e.data);
      }
    };

    this.timerWorker.postMessage({ "interval": this.lookahead });
  }

  changePattern(pattern) {
    this.setState({ pattern });
    localStorage.setItem('pattern', pattern);
    this.setPattern(pattern);
  }

  setPattern(pattern) {
    if (pattern === 'quarter') {
      this.quarterVolume = 0.75;
      this.eighthVolume = 0;
      this.sixteenthVolume = 0;
      this.tripletVolume = 0;
    } else if (pattern === 'eighth') {
      this.quarterVolume = 0.75;
      this.eighthVolume = 0.75;
      this.sixteenthVolume = 0;
      this.tripletVolume = 0;
    } else if (pattern === 'sixteenth') {
      this.quarterVolume = 0.75;
      this.eighthVolume = 0.75;
      this.sixteenthVolume = 0.75;
      this.tripletVolume = 0;
    } else if (pattern === 'triplet') {
      this.quarterVolume = 0.75;
      this.eighthVolume = 0;
      this.sixteenthVolume = 0;
      this.tripletVolume = 0.75;
    }
  }

  isPlaying() {
    return this.state.isPlaying;
  }

  play() {
    const wasPlaying = this.state.isPlaying;
    const promise = new Promise(resolve => {
      this.setState({ isPlaying: !wasPlaying }, resolve);
    });

    if (!wasPlaying) {
      this.currentTwelveletNote = 0;
      this.nextNoteTime = this.audioContext.currentTime;
      this.timerWorker.postMessage("start");
      this.props.onPlay();
    } else {
      _.each(this.notesInQueue, noteData => {
        if (noteData.callbackTimer) clearTimeout(noteData.callbackTimer);
      });
      this.notesInQueue = [];
      this.timerWorker.postMessage("stop");
      this.props.onStop();
    }
    return promise;
  }

  scheduler() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentTwelveletNote, this.nextNoteTime);
      this.nextTwelvelet();
    }
  }

  nextTwelvelet() {
    const secondsPerBeat = 60.0 / this.state.tempo;
    this.nextNoteTime += 0.08333 * secondsPerBeat;    // Add beat length to last beat time
    this.currentTwelveletNote++;    // Advance the beat number, wrap to zero

    if (this.currentTwelveletNote === this.maxBeats()) {
      this.currentTwelveletNote = 0;
    }
  }

  maxBeats() {
    var beats = (this.state.meter * 12);
    return beats;
  }

  calcVolume(beatVolume) {
    return (beatVolume * this.state.masterVolume);
  }

  scheduleNote(beatNumber, time) {
    // push the note on the queue, even if we're not playing.
    const noteData = {
      note: beatNumber,
      time,
    };
    this.notesInQueue.push(noteData);

    // create oscillator & gainNode & connect them to the context destination
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const accentFrequency = 330;
    const offbeatFrequency = 220;
    const tripletAccentFrequency = 270;

    if (beatNumber % this.maxBeats() === 0) {
      if (this.accentVolume > 0.25) {
        osc.frequency.value = accentFrequency;
        gainNode.gain.value = this.calcVolume(this.accentVolume);
      } else {
        osc.frequency.value = offbeatFrequency;
        gainNode.gain.value = this.calcVolume(this.quarterVolume);
      }
      noteData.callbackTimer = setTimeout(() => {
        this.props.onWholeClick();
      }, (time - this.audioContext.currentTime) * 1000);
    } else if (beatNumber % 12 === 0) { // quarter notes = medium pitch
      osc.frequency.value = this.tripletVolume ? tripletAccentFrequency : offbeatFrequency;
      gainNode.gain.value = this.calcVolume(this.quarterVolume);
      noteData.callbackTimer = setTimeout(() => {
        this.props.onQuarterClick();
      }, (time - this.audioContext.currentTime) * 1000);
    } else if (beatNumber % 6 === 0) {
      osc.frequency.value = offbeatFrequency;
      gainNode.gain.value = this.calcVolume(this.eighthVolume);
      noteData.callbackTimer = setTimeout(() => {
        this.props.onEighthClick();
      }, (time - this.audioContext.currentTime) * 1000);
    } else if (beatNumber % 4 === 0) {
      osc.frequency.value = offbeatFrequency;
      gainNode.gain.value = this.calcVolume(this.tripletVolume);
      noteData.callbackTimer = setTimeout(() => {
        this.props.onTripletClick();
      }, (time - this.audioContext.currentTime) * 1000);
    } else if (beatNumber % 3 === 0) { // other 16th notes = low pitch
      osc.frequency.value = offbeatFrequency;
      gainNode.gain.value = this.calcVolume(this.sixteenthVolume);
      noteData.callbackTimer = setTimeout(() => {
        this.props.onSixteenthClick();
      }, (time - this.audioContext.currentTime) * 1000);
    } else {
      gainNode.gain.value = 0; // keep the remaining twelvelet notes inaudible
    }

    osc.start(time);
    osc.stop(time + this.noteLength);
  }

  render() {
    return (
      <div className="metronome__container">
        <div className="vertical-container">
          <div className="play-button">
            <Fab size="small" color="primary" aria-label="play/pause" onClick={() => this.play()}>
              {this.state.isPlaying ? <Pause /> : <Play />}
            </Fab>
          </div>
          <div className="metronome__bpm--container">
            <Typography variant="h4">
              {this.state.tempo}
            </Typography>
            <div className="subtext">
              <Typography variant="caption" display="block">
                BPM
              </Typography>
            </div>
          </div>
          <Slider
            min={40}
            max={300}
            step={1}
            value={this.state.tempo}
            onChange={(evt, tempo) => {
              this.setState({ tempo });
              localStorage.setItem('tempo', tempo);
            }}
            aria-labelledby="continuous-slider"
          />
          <div className="metronome__volume--container">
            <Grid container spacing={2} >
              <Grid item>
                <VolumeDown />
              </Grid>
              <Grid item xs>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={this.state.masterVolume}
                  onChange={(evt, masterVolume) => {
                    this.setState({ masterVolume });
                    localStorage.setItem('volume', masterVolume);
                  }}
                  aria-labelledby="continuous-slider"
                />
              </Grid>
              <Grid item>
                <VolumeUp />
              </Grid>
            </Grid>
          </div>
        </div>
        <div className="vertical-container">
          <div className="metronome__bpm--container">
            <Typography variant="h4">
              {this.state.meter}
            </Typography>
            <div className="subtext">
              <Typography variant="caption" display="block">
                COUNTS
              </Typography>
            </div>
          </div>
          <Slider
            min={1}
            max={12}
            step={1}
            value={this.state.meter}
            onChange={(evt, meter) => {
              this.setState({ meter });
              localStorage.setItem('meter', meter);
            }}
            aria-labelledby="continuous-slider"
          />
          <div className="button-group">
            <Button variant="contained" color="primary" disabled={this.state.pattern === 'quarter'} onClick={() => this.changePattern('quarter')}>
              <div className="icon icon--quarter"></div>
            </Button>
            <Button variant="contained" color="primary" disabled={this.state.pattern === 'eighth'} onClick={() => this.changePattern('eighth')}>
              <div className="icon icon--eighth"></div>
            </Button>
            <Button variant="contained" color="primary" disabled={this.state.pattern === 'sixteenth'} onClick={() => this.changePattern('sixteenth')}>
              <div className="icon icon--sixteenth"></div>
            </Button>
            <Button variant="contained" color="primary" disabled={this.state.pattern === 'triplet'} onClick={() => this.changePattern('triplet')}>
              <div className="icon icon--triplet"></div>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
