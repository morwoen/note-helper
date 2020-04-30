import React from 'react';
import _ from 'lodash';
import Button from '@material-ui/core/Button';

import './Piano.css';

const initialState = {
  "C": false,
  "C#": false,
  "Db": false,
  "D": false,
  "D#": false,
  "Eb": false,
  "E": false,
  "F": false,
  "F#": false,
  "Gb": false,
  "G": false,
  "G#": false,
  "Ab": false,
  "A": false,
  "A#": false,
  "Bb": false,
  "B": false,
};

export default class Piano extends React.Component {
  static defaultProps = {
    onChange: _.noop,
  };

  constructor(props) {
    super(props);
    this.state = initialState;
  }

  clearSelected() {
    this.setState(initialState);
    this.callOnChange(initialState);
  }

  selectNaturals() {
    const stateChange = {
      "C": true,
      "D": true,
      "E": true,
      "F": true,
      "G": true,
      "A": true,
      "B": true,
    };
    this.setState(stateChange);
    this.callOnChange(_.extend({}, this.state, stateChange));
  }

  selectAccidentals() {
    const stateChange = {
      "C#": true,
      "Db": true,
      "D#": true,
      "Eb": true,
      "F#": true,
      "Gb": true,
      "G#": true,
      "Ab": true,
      "A#": true,
      "Bb": true,
    };
    this.setState(stateChange);
    this.callOnChange(_.extend({}, this.state, stateChange));
  }

  callOnChange(state) {
    this.props.onChange(_.chain(state)
      .pickBy()
      .keys()
      .value());
  }

  changeNote = (note) => {
    return () => {
      const stateChange = { [note]: !this.state[note] };
      this.setState(stateChange);
      this.callOnChange(_.extend({}, this.state, stateChange));
    };
  }

  render() {
    return (
      <div className="piano-container">
        <div className="piano">
          <div className="black-keys">
            <div className="black-key c">
              <div className={`flat ${this.state['Db'] && 'selected'}`} onClick={this.changeNote('Db')}>
                <span className="note">Db</span>
              </div>
              <div className={`sharp ${this.state['C#'] && 'selected'}`} onClick={this.changeNote('C#')}>
                <span className="note">C#</span>
              </div>
            </div>
            <div className="black-key d">
              <div className={`flat ${this.state['Eb'] && 'selected'}`} onClick={this.changeNote('Eb')}>
                <span className="note">Eb</span>
              </div>
              <div className={`sharp ${this.state['D#'] && 'selected'}`} onClick={this.changeNote('D#')}>
                <span className="note">D#</span>
              </div>
            </div>
            <div className="black-key f">
              <div className={`flat ${this.state['Gb'] && 'selected'}`} onClick={this.changeNote('Gb')}>
                <span className="note">Gb</span>
              </div>
              <div className={`sharp ${this.state['F#'] && 'selected'}`} onClick={this.changeNote('F#')}>
                <span className="note">F#</span>
              </div>
            </div>
            <div className="black-key g">
              <div className={`flat ${this.state['Ab'] && 'selected'}`} onClick={this.changeNote('Ab')}>
                <span className="note">Ab</span>
              </div>
              <div className={`sharp ${this.state['G#'] && 'selected'}`} onClick={this.changeNote('G#')}>
                <span className="note">G#</span>
              </div>
            </div>
            <div className="black-key a">
              <div className={`flat ${this.state['Bb'] && 'selected'}`} onClick={this.changeNote('Bb')}>
                <span className="note">Bb</span>
              </div>
              <div className={`sharp ${this.state['A#'] && 'selected'}`} onClick={this.changeNote('A#')}>
                <span className="note">A#</span>
              </div>
            </div>
          </div>
          <div className="white-keys">
            <div className={`white-key ${this.state.C && 'selected'}`} onClick={this.changeNote('C')}>
              <span className="note">C</span>
            </div>
            <div className={`white-key ${this.state.D && 'selected'}`} onClick={this.changeNote('D')}>
              <span className="note">D</span>
            </div>
            <div className={`white-key ${this.state.E && 'selected'}`} onClick={this.changeNote('E')}>
              <span className="note">E</span>
            </div>
            <div className={`white-key ${this.state.F && 'selected'}`} onClick={this.changeNote('F')}>
              <span className="note">F</span>
            </div>
            <div className={`white-key ${this.state.G && 'selected'}`} onClick={this.changeNote('G')}>
              <span className="note">G</span>
            </div>
            <div className={`white-key ${this.state.A && 'selected'}`} onClick={this.changeNote('A')}>
              <span className="note">A</span>
            </div>
            <div className={`white-key ${this.state.B && 'selected'}`} onClick={this.changeNote('B')}>
              <span className="note">B</span>
            </div>
          </div>
        </div>
        <div className="piano-buttons">
          <div>
            <Button variant="contained" color="primary" onClick={() => this.selectNaturals()}>
              Select Naturals
            </Button>
          </div>
          <div>
            <Button variant="contained" color="primary" onClick={() => this.selectAccidentals()}>
              Select Accidentals
            </Button>
          </div>
          <div>
            <Button variant="contained" color="primary" onClick={() => this.clearSelected()}>
              Deselect All
            </Button>
          </div>
        </div>
      </div>
    );
  }
}