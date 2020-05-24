import React, { Fragment } from 'react';

import Piano from '../Containers/Piano';
import Metronome from '../Containers/Metronome';

export default class Controls extends React.Component {
  render() {
    const {
      selectNotes,
      metronome,
      playMetronome,
      stopMetronome,
    } = this.props;

    return (
      <Fragment>
        <Piano onChange={(notes) => selectNotes(notes)} />
        <Metronome
          ref={metronome}
          tempo={120}
          onPlay={playMetronome}
          onStop={stopMetronome}
        />
      </Fragment>
    );
  }
}
