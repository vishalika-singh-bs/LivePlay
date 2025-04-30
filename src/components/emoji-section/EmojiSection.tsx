import React, { useState, useEffect, useRef } from "react";
import "./EmojiSection.css";

import Emoji1 from "../../assets/emojis/good_luck.png";
import Emoji2 from "../../assets/emojis/i_vote_no.png";
import Emoji3 from "../../assets/emojis/i_vote_yes.png";
import Emoji4 from "../../assets/emojis/i_won.png";
import Emoji5 from "../../assets/emojis/i_am_confused.png";
import Emoji6 from "../../assets/emojis/i_am_following.png";
import Emoji7 from "../../assets/emojis/lmao.png";
import Emoji8 from "../../assets/emojis/love_it.png";
import Emoji9 from "../../assets/emojis/mind_blowing.png";
import Emoji10 from "../../assets/emojis/on_fire.png";
import Emoji11 from "../../assets/emojis/shocked.png";
import Emoji12 from "../../assets/emojis/wow.png";
import Emoji13 from "../../assets/emojis/you_got_this.png";
import Emoji14 from "../../assets/emojis/you_are_amazing.png";

const emojis = [
  { id: "1", src: Emoji1, title: "GOOD_LUCK" },
  { id: "2", src: Emoji2, title: "I_VOTE_NO" },
  { id: "3", src: Emoji3, title: "I_VOTE_YES" },
  { id: "4", src: Emoji4, title: "I_WON" },
  { id: "5", src: Emoji5, title: "I_AM_CONFUSED" },
  { id: "6", src: Emoji6, title: "I_AM_FOLLOWING" },
  { id: "7", src: Emoji7, title: "LMAO" },
  { id: "8", src: Emoji8, title: "LOVE_IT" },
  { id: "9", src: Emoji9, title: "MIND_BLOWNING" },
  { id: "10", src: Emoji10, title: "ON_FIRE" },
  { id: "11", src: Emoji11, title: "SHOCKED" },
  { id: "12", src: Emoji12, title: "WOW" },
  { id: "13", src: Emoji13, title: "YOU_GOT_THIS" },
  { id: "14", src: Emoji14, title: "YOU_ARE_AMAZING" },
];

interface EmojiSectionProps {
  onEmojiSelected: (emoji: string) => void;
  closeEmojiModal: () => void;
  isOpen: boolean;
  onLockStatusChange?: (isLocked: boolean) => void;
}

export const EmojiSection: React.FC<EmojiSectionProps> = ({ 
  onEmojiSelected, 
  closeEmojiModal,
  isOpen: isOpenProp,
  onLockStatusChange
}) => {
  const [isEmojiSelectionDisabled, setIsEmojiSelectionDisabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [timer, setTimer] = useState(5);

  const openTimeoutRef = useRef<number | null>(null);
  const emojiSelectionTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Notify parent when lock status changes
  useEffect(() => {
    if (onLockStatusChange) {
      onLockStatusChange(isLocked);
    }
  }, [isLocked, onLockStatusChange]);

  // Handle when isOpen prop changes
  useEffect(() => {
    if (isOpenProp && !isLocked) {
      openTimeoutRef.current = setTimeout(() => {
        closeEmojiModal();
      }, 3000);
      setIsEmojiSelectionDisabled(true);
      emojiSelectionTimeoutRef.current = setTimeout(() => {
        setIsEmojiSelectionDisabled(false);
      }, 500);
    }
  }, [isOpenProp, isLocked, closeEmojiModal]);

  const handleEmojiClick = (emoji: string) => {
    if (isEmojiSelectionDisabled) {
      return;
    }
    clearTimeout(openTimeoutRef.current ?? undefined);
    onEmojiSelected(emoji.trim());
    closeEmojiModal();
    setIsLocked(true);
    setTimer(5);
  };

  // Countdown logic
  useEffect(() => {
    if (isLocked) {
      console.log("Timer: ", timer);
      countdownIntervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 1) {
            return prevTimer - 1;
          } else {
            clearInterval(countdownIntervalRef.current ?? undefined);
            setIsLocked(false);
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      clearInterval(countdownIntervalRef.current ?? undefined);
    };
  }, [isLocked]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeout(openTimeoutRef.current ?? undefined);
      clearTimeout(emojiSelectionTimeoutRef.current ?? undefined);
      clearInterval(countdownIntervalRef.current ?? undefined);
    };
  }, []);
  
  return (
    <div className="emoji-section">
    {isOpenProp && (
      <div className="emoji-panel">
        {emojis.map((emoji) => (
          <div 
            key={emoji.id} 
            className="emoji-items" 
            onClick={() => handleEmojiClick(emoji.title)}
          >
            <img
              src={emoji.src}
              className="emoji-image"
            />
          </div>
        ))}
      </div>
    )}
  </div>
  );
};