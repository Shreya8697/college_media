import "./groupmsg.css";
import { format } from "date-fns"; // Import format from date-fns
import { useState, useEffect, useRef } from "react";
import axios from "axios"; // Axios for API calls
import { io } from "socket.io-client"; // Import Socket.IO client
import EmojiPicker from 'emoji-picker-react'; // Import emoji picker

export default function Groupmsg({ groupId, message, own, user, onDelete, onUpdate}) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [isEditing, setIsEditing] = useState(false);
  const [newMessageText, setNewMessageText] = useState(message.text);
  const [isClicked, setIsClicked] = useState(false);
  const [isEdited, setIsEdited] = useState(message.isEdited || false);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ x: 0, y: 0 });
  // const [messages, setMessages] = useState([]); // State to store all group messages
  const messageRef = useRef(null);
  const inputRef = useRef(null);
  const socket = useRef();
  // const [senderName, setSenderName] = useState("Unknown Sender"); // State to store the sender's name

  const formatTime = (date) => {
    return format(new Date(date), "h:mm a");
  };


  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("editMessage", (data) => {
      if (data.messageId === message._id) {
        setNewMessageText(data.updatedText);
        setIsEdited(true);
      }
    });
    socket.current.on("deleteMessage", (data) => {
      if (data.messageId === message._id) {
        onDelete(message._id);
      }
    });
    return () => {
      socket.current.disconnect();
      socket.current.off("editMessage");
      socket.current.off("deleteMessage");
    };
  }, [message._id, onDelete]);

  

  // // Fetch sender details
  // useEffect(() => {
  //   const fetchSender = async () => {
  //     if (message.senderId) {
  //       try {
  //         const response = await axios.get(`/users/${message.senderId}`);
  //         setSenderName(response.data.name);
  //       } catch (error) {
  //         console.error("Error fetching sender details:", error);
  //       }
  //     }
  //   };
  //   fetchSender();
  // }, [message.senderId]);

  const handleEditClick = () => {
    setIsEditing(true);
    setShowEmojiPicker(true);
    setTimeout(() => inputRef.current.focus(), 100);
  };

  // const fetchMessages = async () => {
  //   try {
  //     const response = await axios.get(`/group-messages/${groupId}`);
  //     const messagesWithSenderDetails = await Promise.all(
  //       response.data.map(async (msg) => {
  //         try {
  //           const userResponse = await axios.get(`/users/${msg.senderId}`);
  //           return { ...msg, sender: userResponse.data };
  //         } catch (err) {
  //           console.error(`Error fetching details for user ID ${msg.senderId}:`, err);
  //           return { ...msg, sender: { name: "Unknown Sender" } };
  //         }
  //       })
  //     );
  //     setMessages(messagesWithSenderDetails);
  //   } catch (error) {
  //     console.error("Error fetching group messages:", error);
  //   }
  // };
  
  const handleSaveClick = async () => {
    if (newMessageText.trim() === "") {
      alert("Message cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`/group-messages/${message._id}`, {
        text: newMessageText,
        isEdited: true,
      });
      onUpdate(res.data);

      socket.current.emit("editMessage", {
        messageId: message._id,
        updatedText: newMessageText,
        receiverId: message.receiverId,
        conversationId: message.conversationId,
      });

      setNewMessageText(res.data.text);
      setIsEditing(false);
      setIsClicked(false);
      setShowEmojiPicker(false);
    } catch (err) {
      console.error("Error updating message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this message?");
    if (confirmDelete) {
      try {
        await axios.delete(`/group-messages/${message._id}`);
        onDelete(message._id);

        socket.current.emit("deleteMessage", {
          messageId: message._id,
          receiverId: message.receiverId,
          conversationId: message.conversationId,
        });
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewMessageText(message.text);
    setShowEmojiPicker(false);
  };

  const handleMessageClick = () => {
    if (own) {
      setIsClicked((prev) => !prev);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessageText((prev) => prev + emoji.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setIsClicked(false);
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [messageRef]);

  const handleMouseDown = (e) => {
    const startX = e.clientX - emojiPickerPosition.x;
    const startY = e.clientY - emojiPickerPosition.y;

    const handleMouseMove = (moveEvent) => {
      setEmojiPickerPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={messageRef}
      className={own ? "message own" : "message"}
      onClick={handleMessageClick}
    >
      <div className="messageTop">
        <img
          className="messageImg"
          src={user?.profilePicture ? PF + user.profilePicture : PF + "person/avatar.jpg"}
          alt=""
        />
        <span className="messageSenderName">{user.username}</span> {/* Updated to use senderName */}
        {isEditing ? (
          <>
            <input
              className="editMessageInput"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              ref={inputRef}
              disabled={loading}
            />
            {showEmojiPicker && (
              <div
                className="emojiPickerContainer"
                style={{
                  position: "absolute",
                  left: emojiPickerPosition.x,
                  top: emojiPickerPosition.y,
                  cursor: "move",
                }}
                onMouseDown={handleMouseDown}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  disableSearchBar
                  groupNames={{ smileys_people: "Smileys & People" }}
                />
              </div>
            )}
          </>
        ) : (
          <p className="messageText">{message?.text || "No message text available"}</p>
        )}
      </div>
      <div className="messageBottom">
        {isEdited && <span className="editedMessageText">This message is edited.</span>}
        {message?.createdAt ? formatTime(message.createdAt) : "Time not available"}
      </div>
      {own && isClicked && (
        <div className="messageActions">
          {isEditing ? (
            <>
              <button className="saveBtn" onClick={handleSaveClick} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
              <button className="cancelBtn" onClick={handleCancelClick}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="editBtn" onClick={handleEditClick}>
                Edit
              </button>
              <button className="deleteBtn" onClick={handleDeleteClick}>
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
