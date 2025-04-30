import React, { memo, useEffect, useRef } from "react";
import { RootState, useAppDispatch } from "../../store";
import { MessageInput } from "../message-input/MessageInput";
import { ChatMessage } from "../../types/chat";
import "./ChatSection.css";
import { useSelector } from "react-redux";
import { processQueue, togglePause } from "../../store/slices/chatSlice";

interface ChatSectionProps {
  sendMessage: (message: string) => void;
}

const ChatMessageItem = memo(({ message }: { message: ChatMessage }) => (
  <div className={`message ${message.isLocal ? "message-local" : ""}`}>
    <div className="message-header">
      <span className="username">
        {message.isLocal ? "Me" : message.userName}
      </span>
    </div>
    <div className="message-content">
      {message.message}

      {/* <span className="timestamp">
        {new Date(message.timestamp).toLocaleTimeString()}
      </span> */}
    </div>
  </div>
));

export const ChatSection: React.FC<ChatSectionProps> = memo(
  ({ sendMessage }) => {
    const dispatch = useAppDispatch();
    const { messages, messageQueue, paused } = useSelector(
      (state: RootState) => state.chat
    );
    const { isChatConnecting, isChatFailed, isChatConnected ,isChatTokenReceived} = useSelector(
      (state: RootState) => state.appConfig
    );

    const messageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const interval = setInterval(() => {
        if (!paused && messageQueue.length > 0) {
          dispatch(processQueue());
        }
      }, 500);
      return () => clearInterval(interval);
    }, [dispatch, messageQueue.length, paused]);

    useEffect(() => {
      if (!paused) {
        const container = messageContainerRef.current;
        container?.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    }, [messages, paused]);

    const handleScroll = () => {
      const container = messageContainerRef.current;
      if (container) {
        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 10;
        dispatch(togglePause(!isAtBottom));
      }
    };

    return (
      <div className="chat-section">
        {isChatConnected && (
          <>
            <div
              className="messages-container"
              ref={messageContainerRef}
              onScroll={handleScroll}
            >
              {messages.map((message, index) => (
                <ChatMessageItem key={index} message={message} />
              ))}
            </div>
            <MessageInput sendMessage={sendMessage} />
          </>
        )}
        {!isChatTokenReceived && <h1 className="chat-section__info-message">Linking...</h1>}
        {isChatTokenReceived && isChatConnecting && <h1 className="chat-section__info-message">Connecting...</h1>}
        {isChatTokenReceived && isChatFailed && <h1 className="chat-section__info-message">Failed to connect</h1>}
      </div>
    );
  }
);
