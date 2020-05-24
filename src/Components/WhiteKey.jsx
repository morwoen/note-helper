import React from 'react';
import BlackKey from './BlackKey';

export default class WhiteKey extends React.Component {
  render() {
    const {
      label,
      clickHandle,
      selected,
      blackKey,
      zIndex,
    } = this.props;

    return (
      <div className="piano__keys--white-container" style={{zIndex: zIndex}}>
        <div className={`piano__keys--white-key key ${selected(label)}`} onClick={() => clickHandle(label)}>
          <span className="note">{label}</span>
        </div>
        {blackKey.length ?
          <BlackKey 
            labels={blackKey}
            selected={(note) => selected(note)}
            clickHandle={(note) => clickHandle(note)}
          />
          :
          null
        }
      </div>
    );
  }
}
