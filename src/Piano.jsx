import React from 'react';
import _ from 'lodash';
import Button from '@material-ui/core/Button';

import './Piano.css';

const initialState = {
  "C": true,
  "C♯": false,
  "D♭": false,
  "D": true,
  "D♯": false,
  "E♭": false,
  "E": true,
  "F": true,
  "F♯": false,
  "G♭": false,
  "G": true,
  "G♯": false,
  "A♭": false,
  "A": true,
  "A♯": false,
  "B♭": false,
  "B": true,
};

export default class Piano extends React.Component {
  static defaultProps = {
    onChange: _.noop,
  };

  constructor(props) {
    super(props);

    let previousNotes = [];

    try {
      previousNotes = JSON.parse(localStorage.getItem('notes'));
    } catch {
      // dont care
    }

    let startingState = {};
    if (_.isEmpty(previousNotes)) {
      _.extend(startingState, initialState);
    } else {
      _.extend(startingState, _.mapValues(initialState, () => false), _.chain(previousNotes)
        .keyBy(x => x)
        .mapValues(() => true)
        .value());
    }

    this.state = startingState;
    this.callOnChange(startingState);
  }

  clearSelected() {
    const stateChange = _.mapValues(this.state, () => false);
    this.setState(stateChange);
    this.callOnChange(stateChange);
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
      "C♯": true,
      "D♭": true,
      "D♯": true,
      "E♭": true,
      "F♯": true,
      "G♭": true,
      "G♯": true,
      "A♭": true,
      "A♯": true,
      "B♭": true,
    };
    this.setState(stateChange);
    this.callOnChange(_.extend({}, this.state, stateChange));
  }

  callOnChange(state) {
    const selectedNotes = _.chain(state)
      .pickBy()
      .keys()
      .value();
    this.props.onChange(selectedNotes);
    localStorage.setItem('notes', JSON.stringify(selectedNotes));
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
              <div className={`flat ${this.state['D♭'] && 'selected'}`} onClick={this.changeNote('D♭')}>
                <span className="note">D♭</span>
              </div>
              <div className={`sharp ${this.state['C♯'] && 'selected'}`} onClick={this.changeNote('C♯')}>
                <span className="note">C♯</span>
              </div>
            </div>
            <div className="black-key d">
              <div className={`flat ${this.state['E♭'] && 'selected'}`} onClick={this.changeNote('E♭')}>
                <span className="note">E♭</span>
              </div>
              <div className={`sharp ${this.state['D♯'] && 'selected'}`} onClick={this.changeNote('D♯')}>
                <span className="note">D♯</span>
              </div>
            </div>
            <div className="black-key f">
              <div className={`flat ${this.state['G♭'] && 'selected'}`} onClick={this.changeNote('G♭')}>
                <span className="note">G♭</span>
              </div>
              <div className={`sharp ${this.state['F♯'] && 'selected'}`} onClick={this.changeNote('F♯')}>
                <span className="note">F♯</span>
              </div>
            </div>
            <div className="black-key g">
              <div className={`flat ${this.state['A♭'] && 'selected'}`} onClick={this.changeNote('A♭')}>
                <span className="note">A♭</span>
              </div>
              <div className={`sharp ${this.state['G♯'] && 'selected'}`} onClick={this.changeNote('G♯')}>
                <span className="note">G♯</span>
              </div>
            </div>
            <div className="black-key a">
              <div className={`flat ${this.state['B♭'] && 'selected'}`} onClick={this.changeNote('B♭')}>
                <span className="note">B♭</span>
              </div>
              <div className={`sharp ${this.state['A♯'] && 'selected'}`} onClick={this.changeNote('A♯')}>
                <span className="note">A♯</span>
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