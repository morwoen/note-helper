import React, { Fragment } from 'react';

import { Button } from '@material-ui/core';

export default class App extends React.Component {
  render() {
    const {
      play,
      playing,
      numRows,
      startOver,
      clearRows,
      renderRows,
    } = this.props;
    return (
      <Fragment>
        <div className="App__button-row">
          <Button variant="contained" color="primary" onClick={play}>
            {numRows ? (playing ? 'Stop' : 'Play') : 'Generate Notes'}
          </Button>
          <Button variant="contained" color="primary" onClick={startOver}>
            {numRows ? 'Start Over' : 'Generate and Play'}
          </Button>
          <Button variant="contained" color="primary" onClick={clearRows}>
            Clear
          </Button>
        </div>
        <div className="App__note-display--container">
          {renderRows()}
        </div>
      </Fragment>
    );
  }
}
