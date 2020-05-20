import React, { Fragment } from 'react';

import Piano from '../Components/Piano';
import Metronome from '../Components/Metronome';

export default class Controls extends React.Component {
  render() {
    const {
      selectNotes,
      metronome,
      setNextRow,
      playMetronome,
      stopMetronome,
    } = this.props;

    return (
      <Fragment>
        <Piano onChange={(notes) => selectNotes(notes)} />
        <Metronome
          ref={metronome}
          tempo={120}
          onWholeClick={setNextRow}
          onPlay={playMetronome}
          onStop={stopMetronome}
        />
      </Fragment>
    );
  }
}
