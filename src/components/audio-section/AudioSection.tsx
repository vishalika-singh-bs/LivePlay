import "./AudioSection.css";
import AudioIcon from "../../assets/icons/live.svg";

export const AudioSection = () => {
  return (
    <div className="audio-section">
      <div className="audio-placeholder">
        <img src={AudioIcon} alt="Audio Mode" className="audio-icon" />
      </div>
    </div>
  );
};
