import React, { useState, useCallback, useRef, memo } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import './MessageInput.css';
interface MessageInputProps {
  sendMessage:any
}

export const MessageInput: React.FC<MessageInputProps> = memo(({sendMessage}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  }, [message, sendMessage]);

  const onEmojiClick = useCallback((emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }, []);

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Begin chatting..."
            className="message-input"
          />
          <button
            type="button"
            className="emoji-button"
            onClick={toggleEmojiPicker}
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
});
