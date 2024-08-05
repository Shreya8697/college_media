import "./share.css";
import{PermMedia, Label, Room,EmojiEmotions} from "@mui/icons-material"

export default function Share() {
  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <img
            className="shareProfileImg"
            src="/assets/person/team-1.jpg"
            alt=""
          />
          <input
            placeholder="What's in your mind Shreya"
            className="shareInput"
          />
        </div>
        <hr className="shareHr" />
        <div className="shareBottom">
            <div className="shareOptions">
                <div className="shareOption">
                    <PermMedia htmlColor="green" className="shareIcon"/>
                    <span className="ShareOptionText">Photo or Video</span>
                </div>
                <div className="shareOption">
                    <Label htmlColor="blue" className="shareIcon"/>
                    <span className="ShareOptionText">Tag</span>
                </div>
                <div className="shareOption">
                    <Room htmlColor="tomato" className="shareIcon"/>
                    <span className="ShareOptionText">Location</span>
                </div>
                <div className="shareOption">
                    <EmojiEmotions htmlColor="goldenrod" className="shareIcon"/>
                    <span className="ShareOptionText">Feeling</span>
                </div>
                <button className="shareButton">
                    Share
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
