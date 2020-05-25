import React from 'react';
import _ from 'lodash';

import { Button } from '@material-ui/core';

import WhiteKey from '../Components/WhiteKey';

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

const naturals = [
  "C",
  "D",
  "E",
  "F",
  "G",
  "A",
  "B",
]

const accidentals = [
  ["D♭", "C♯"],
  ["E♭", "D♯"],
  [],
  ["G♭", "F♯"],
  ["A♭", "G♯"],
  ["B♭", "A♯"],
  [],
]

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
    const stateChange = _.chain(naturals)
      .keyBy((key) => key)
      .mapValues(() => true)
      .value();

    this.setState(stateChange);
    this.callOnChange(_.extend({}, this.state, stateChange));
  }

  selectAccidentals() {
    const stateChange = _.chain(accidentals.flat())
      .keyBy((key) => key)
      .mapValues(() => true)
      .value();

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
    const stateChange = { [note]: !this.state[note] };
    this.setState(stateChange);
    this.callOnChange(_.extend({}, this.state, stateChange));
  }

  noteStatus = (note) => {
    return this.state[note] ? 'selected' : '';
  }

  render() {
    return (
      <div className="piano">
        <div className="piano__keys">
          {naturals.map((key, index) => {
            return (
              <WhiteKey
                key={key}
                label={key}
                clickHandle={(note) => this.changeNote(note)}
                selected={(note) => this.noteStatus(note)}
                blackKey={accidentals[index]}
                zIndex={naturals.length - index}
              />
            )
          })}
        </div>
        <div className="piano__buttons">
          <Button variant="contained" color="primary" onClick={() => this.selectNaturals()}>
            Select Naturals
          </Button>
          <Button variant="contained" color="primary" onClick={() => this.selectAccidentals()}>
            Select Accidentals
          </Button>
          <Button variant="contained" color="primary" onClick={() => this.clearSelected()}>
            Deselect All
          </Button>
        </div>
      </div>
    );
  }
}