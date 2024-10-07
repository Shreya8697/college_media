import { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import EmojiPicker from "emoji-picker-react"; // Ensure correct import
// import { EmojiEmotions } from "@mui/icons-material";
import "./post.css";
import { MoreVert } from "@mui/icons-material";

export default function Post({ post, onDelete, onEdit }) {
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const [showPopup, setShowPopup] = useState(false); // State to show popup
  const [isEditing, setIsEditing] = useState(false); // State to control edit mode
  const [editDesc, setEditDesc] = useState(post.desc); // Store updated description
  const [showEmojis, setShowEmojis] = useState(false); // Toggle emoji picker
  const popupRef = useRef(); // Ref to the popup element
  const emojiPickerRef = useRef(); // Ref to the emoji picker element
  const [dragging, setDragging] = useState(false); // Track if the picker is being dragged
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Emoji picker position
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser._id));
  }, [currentUser._id, post.likes]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`/users?userId=${post.userId}`);
      setUser(res.data);
    };
    fetchUser();
  }, [post.userId]);

  const likeHandler = () => {
    try {
      axios.put("/posts/" + post._id + "/like", { userId: currentUser._id });
    } catch (err) {}
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  const deleteHandler = async () => {
    try {
      await axios.delete(`/posts/${post._id}`, {
        data: { userId: currentUser._id },
      });
      onDelete(post._id); // Call the onDelete callback to remove post from the UI
    } catch (err) {}
  };

  const editHandler = () => {
    setIsEditing(true); // Enable edit mode
    setShowPopup(false); // Close the popup after clicking edit
  };

  const updatePost = async () => {
    console.log(editDesc); // Log the updated description
    try {
      await axios.put(`/posts/${post._id}`, {
        userId: currentUser._id,
        desc: editDesc, // Send updated description
      });
      setIsEditing(false); // Exit edit mode after successful update
      window.location.reload(); // Reload the page after saving the post
    } catch (err) {
      console.error("Error updating post", err);
    }
  };

  const handleMoreVertClick = () => {
    setShowPopup(!showPopup); // Toggle popup visibility
  };

  // Close popup when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false); // Close the popup if clicked outside
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  // Close emoji picker when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
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

  const onEmojiClick = (e) => {
    setEditDesc((prevDesc) => prevDesc + e.emoji); // Append emoji to description
    // setShowEmojis(false); // Hide emoji picker after selection
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`profile/${user.username}`}>
              <img
                className="postProfileImg"
                src={
                  user.profilePicture
                    ? PF + user.profilePicture
                    : PF + "person/avatar.jpg"
                }
                alt=""
              />
            </Link>
            <span className="PostUserName">{user.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postTopRight">
            <MoreVert onClick={handleMoreVertClick} />
            {showPopup && (
              <div className="popupMenu" ref={popupRef}>
                {currentUser._id === post.userId && (
                  <>
                    <button className="popupOption" onClick={editHandler}>
                      Edit
                    </button>
                    <button className="popupOption" onClick={deleteHandler}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="postCenter">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="postEditInput"
              />
              <div className="editButtons">
                <div className="emojiPickerWrapper">
                  {showEmojis && (
                    <div
                      className="emojiPicker"
                      ref={emojiPickerRef}
                      onMouseDown={handleMouseDown}
                      style={{
                        position: "absolute",
                        top: "100px",
                        left: "100px",
                      }}
                    >
                      {" "}
                      {/* Add ref to emoji picker */}
                      <EmojiPicker onEmojiClick={onEmojiClick} />{" "}
                      {/* Emoji picker */}
                    </div>
                  )}
                  <button
                    className="emojiPickerButton"
                    onClick={() => setShowEmojis(!showEmojis)}
                  >
                    😀
                  </button>
                </div>
                <button className="saveButton" onClick={updatePost}>
                  Save
                </button>
                <button
                  className="cancelButton"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <span className="postText">{post.desc}</span>
          )}
          <img className="postImg" src={PF + post.img} alt="" />
        </div>

        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="postLikeIcon"
              src={`${PF}like.png`}
              onClick={likeHandler}
              alt=""
            />
            <img
              className="postHeartIcon"
              src={`${PF}heart.png`}
              onClick={likeHandler}
              alt=""
            />
            <span className="postLikeCounter">{like} people like it</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText">{post.comment} Comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
