import React, { Fragment } from 'react';

import Piano from '../Components/Piano';
import Metronome from '../Components/Metronome';

export default class Controls extends React.Component {
  render() {
    const {
      selectNotes,
      metronome,
      setNextRow,
      play,
      stop,
    } = this.props;

    return (
      <Fragment>
        <Piano onChange={selectNotes} />
        <Metronome
          ref={metronome}
          tempo={120}
          onWholeClick={setNextRow}
          onPlay={play}
          onStop={stop}
        />
      </Fragment>
    );
  }
}
