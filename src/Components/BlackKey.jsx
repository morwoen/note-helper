import React from 'react';

export default class BlackKey extends React.Component {
  render() {
    const {
      labels,
      selected,
      clickHandle,
    } = this.props;

    return (
      <div className="piano__keys--black-container">
        <div className={`piano__keys--black-key key ${selected(labels[0])}`} onClick={() => clickHandle(labels[0])}>
          <span className="note">{labels[0]}</span>
        </div>
        <div className={`piano__keys--black-key key ${selected(labels[1])}`} onClick={() => clickHandle(labels[1])}>
          <span className="note">{labels[1]}</span>
        </div>
      </div>
    );
  }
}
