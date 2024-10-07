import { useContext, useState, useRef, useEffect } from "react";
import "./share.css";
import { PermMedia, Label, Room, EmojiEmotions, Cancel } from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import EmojiPicker from 'emoji-picker-react';

export default function Share() {
  const { user } = useContext(AuthContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [file, setFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false); // Toggle emoji picker
  const [inputText, setInputText] = useState(""); // Manage text input including emoji
  const emojiPickerRef = useRef(); // Ref for emoji picker element
  const [dragging, setDragging] = useState(false); // Track if the picker is being dragged
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Emoji picker position

  // Handle form submission
  const submitHandler = async (e) => {
    e.preventDefault();
    
    const newPost = {
      userId: user._id,
      desc: inputText, // Send the text input with emojis as the description
    };
  
    if (file) {
      const data = new FormData();
      const fileName = Date.now() + file.name;
      data.append("name", fileName);
      data.append("file", file);
      newPost.img = fileName;
      
      try {
        await axios.post("/upload", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    }
  
    try {
      await axios.post("/posts", newPost);
      window.location.reload();
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  // Handle emoji selection
  const onEmojiClick = (e) => {
    setInputText(inputText + e.emoji); // Correctly append the emoji to the inputText
  };

  // Close the emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojis(false); // Close emoji picker if clicked outside
      }
    };

    if (showEmojis) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup event listener
    };
  }, [showEmojis]);
  const handleMouseDown = (e) => {
    setDragging(true);
    setPosition({
      x: e.clientX - emojiPickerRef.current.offsetLeft,
      y: e.clientY - emojiPickerRef.current.offsetTop,
    });
  };

  // Add mousemove and mouseup events globally
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        const newX = e.clientX - position.x;
        const newY = e.clientY - position.y;
        emojiPickerRef.current.style.left = `${newX}px`;
        emojiPickerRef.current.style.top = `${newY}px`;
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, position.x, position.y]);

  //function to handle cancle button
  const cancelHandler = () => {
    setInputText(""); // Clear the text input
    setFile(null);    // Clear the selected file
    setShowEmojis(false); // Close the emoji picker if open
  };
  

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <img
            className="shareProfileImg"
            src={
              user.profilePicture
                ? PF + user.profilePicture
                : PF + "person/avatar.jpg"
            }
            alt=""
          />
          <input
            placeholder={"What's in your mind " + user.username + " ?"}
            className="shareInput"
            value={inputText} // Bind input text to state
            onChange={(e) => setInputText(e.target.value)} // Update state on input change
            required
          />
        </div>
        <hr className="shareHr" />
        {file && (
          <div className="shareImageContainer">
            <img className="shareImg" src={URL.createObjectURL(file)} alt=""/>
            <Cancel className="shareCancelImg" onClick={() => setFile(null)} />
          </div>
        )}
        <form className="shareBottom" onSubmit={submitHandler}>
          <div className="shareOptions">
            <label htmlFor="file" className="shareOption">
              <PermMedia htmlColor="green" className="shareIcon" />
              <span className="ShareOptionText">Photos</span>
              <input
                style={{ display: "none" }}
                type="file"
                id="file"
                accept=".png,.jpg,.pdf,.jpeg"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            <div className="shareOption">
              <Label htmlColor="blue" className="shareIcon" />
              <span className="ShareOptionText">Tag</span>
            </div>
            <div className="shareOption">
              <Room htmlColor="tomato" className="shareIcon" />
              <span className="ShareOptionText">Location</span>
            </div>
            <div className="shareOption" onClick={() => setShowEmojis(!showEmojis)}>
              <EmojiEmotions htmlColor="goldenrod" className="shareIcon" />
              <span className="ShareOptionText">Feeling</span>
            </div>
          </div>
          {showEmojis && (
            <div className="emojiPicker" ref={emojiPickerRef}onMouseDown={handleMouseDown}
            style={{
              position: "absolute",
              top: "100px",
              left: "100px",
            }}> {/* Add ref to emoji picker */}
              <EmojiPicker onEmojiClick={onEmojiClick} /> {/* Emoji picker */}
            </div>
          )}
          {/* Conditionally render the Cancel button */}
          {(file || inputText) && (
            <button 
              type="button" 
              className="shareCancelBtn" 
              onClick={cancelHandler}
            >
              Cancel
            </button>
          )}
          <button className="shareButton" type="submit">Share</button>
        </form>
      </div>
    </div>
  );
}
