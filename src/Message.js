// Message.js
import React from 'react';
import './styles/message.css';

function Message(props) {
  return (
    <div className='button-toolbar-message'>
      {props.children}
    </div>
  );
}

export default Message;