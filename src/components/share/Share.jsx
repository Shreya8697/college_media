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
  const [showEmojis, setShowEmojis] = useState(false);
  const [inputText, setInputText] = useState("");
  const emojiPickerRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [loadingLocation, setLoadingLocation] = useState(false); // Loading state when fetching location

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
    setInputText(inputText + e.emoji);
  };

  // Close the emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojis(false);
      }
    };

    if (showEmojis) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojis]);

  // Handle location fetching
  const fetchLocation = async () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        // Fetch location details (reverse geocoding)
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
              lat: latitude,
              lon: longitude,
              format: "json",
            },
          });

          const city = res.data.address.city || res.data.address.town || res.data.address.village || "";
          const state = res.data.address.state || "";
          const country = res.data.address.country || "";

          // Append location to input text in parentheses
          setInputText((prev) => `${prev} (${city}, ${state}, ${country})`);
        } catch (err) {
          console.error("Error fetching location:", err);
        } finally {
          setLoadingLocation(false);
        }
      }, (error) => {
        console.error("Error getting location:", error);
        setLoadingLocation(false);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setPosition({
      x: e.clientX - emojiPickerRef.current.offsetLeft,
      y: e.clientY - emojiPickerRef.current.offsetTop,
    });
  };
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

  // Cancel button handler
  const cancelHandler = () => {
    setInputText("");
    setFile(null);
    setShowEmojis(false);
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
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
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
            <div className="shareOption" onClick={fetchLocation}>
              <Room htmlColor="tomato" className="shareIcon" />
              <span className="ShareOptionText">
                {loadingLocation ? "Fetching..." : "Location"}
              </span>
            </div>
            <div className="shareOption" onClick={() => setShowEmojis(!showEmojis)}>
              <EmojiEmotions htmlColor="goldenrod" className="shareIcon" />
              <span className="ShareOptionText">Feeling</span>
            </div>
          </div>
          {showEmojis && (
            <div className="emojiPicker" ref={emojiPickerRef} onMouseDown={handleMouseDown}
              style={{
                position: "absolute",
                top: "100px",
                left: "100px",
              }}>
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
          {(file || inputText) && (
            <button type="button" className="shareCancelBtn" onClick={cancelHandler}>
              Cancel
            </button>
          )}
          <button className="shareButton" type="submit">Share</button>
        </form>
      </div>
    </div>
  );
}
