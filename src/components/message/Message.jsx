import "./message.css";
import { format } from "date-fns"; // Import format from date-fns
import { useState, useEffect, useRef } from "react";
import axios from "axios"; // Axios for API calls
import { io } from "socket.io-client"; // Import Socket.IO client
import EmojiPicker from 'emoji-picker-react'; // Import emoji picker

export default function Message({ message, own, user, onDelete, onUpdate }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [isEditing, setIsEditing] = useState(false); // Track if the message is being edited
  const [newMessageText, setNewMessageText] = useState(message.text); // For editing message text
  const [isClicked, setIsClicked] = useState(false); // Track if the message has been clicked
  const [isEdited, setIsEdited] = useState(message.isEdited || false); // Track if the message has been edited
  const [loading, setLoading] = useState(false); // Loading state for save action
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Track visibility of the emoji picker
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ x: 0, y: 0 }); // Track position of emoji picker
  const messageRef = useRef(null); // Reference to the message element
  const inputRef = useRef(null); // Ref to the input field
  const socket = useRef(); // Socket reference

  const formatTime = (date) => {
    return format(new Date(date), "h:mm a"); // Format time in 12-hour format with AM/PM
  };

  // Connect to the socket server
  useEffect(() => {
    socket.current = io("ws://localhost:8900"); // Replace with your socket server URL

    // Listen for edit and delete message events
    socket.current.on("editMessage", (data) => {
      if (data.messageId === message._id) {
        setNewMessageText(data.updatedText); // Update the message text
        setIsEdited(true); // Mark the message as edited
      }
    });

    socket.current.on("deleteMessage", (data) => {
      if (data.messageId === message._id) {
        onDelete(message._id); // Call onDelete to remove message from list
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.current.disconnect(); // Disconnect socket
      socket.current.off("editMessage"); // Remove event listener
      socket.current.off("deleteMessage"); // Remove event listener
    };
  }, [message._id, onDelete]);

  // Handle Edit Button click to toggle editing mode
  const handleEditClick = () => {
    setIsEditing(true);
    setShowEmojiPicker(true); // Show emoji picker when editing starts
    setTimeout(() => inputRef.current.focus(), 100); // Focus the input when editing starts
  };

  // Handle Save (after editing)
  const handleSaveClick = async () => {
    if (newMessageText.trim() === "") {
      alert("Message cannot be empty."); // Prevent empty message
      return;
    }

    setLoading(true); // Set loading state to true
    try {
      const res = await axios.put(`/messages/${message._id}`, {
        text: newMessageText,
        isEdited: true,  // Mark message as edited
      });
      onUpdate(res.data); // Update the message in the parent component

      // Emit edit message event through socket
      socket.current.emit("editMessage", {
        messageId: message._id,
        updatedText: newMessageText,
        receiverId: message.receiverId, // Pass the receiverId if needed
        conversationId: message.conversationId, // Pass conversationId if needed
      });

      // Clear the input text
      setNewMessageText(res.data.text); // Reset to the updated text

      // Exit edit mode and hide buttons
      setIsEditing(false);
      setIsClicked(false); 
      setShowEmojiPicker(false); // Hide emoji picker after saving
    } catch (err) {
      console.error("Error updating message:", err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handle Delete Button click
  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this message?"); // Confirmation dialog
    if (confirmDelete) {
      try {
        await axios.delete(`/messages/${message._id}`);
        onDelete(message._id); // Notify parent to remove message from list

        // Emit delete message event through socket
        socket.current.emit("deleteMessage", {
          messageId: message._id,
          receiverId: message.receiverId, // Pass the receiverId if needed
          conversationId: message.conversationId, // Pass conversationId if needed
        });
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewMessageText(message.text); // Reset the message text when cancelling
    setShowEmojiPicker(false); // Hide emoji picker on cancel
  };

  // Handle message click to show Edit/Delete buttons
  const handleMessageClick = () => {
    if (own) {
      setIsClicked((prev) => !prev); // Toggle the visibility of Edit/Delete buttons
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setNewMessageText((prev) => prev + emoji.emoji); // Append selected emoji to the message text
  };

  // Detect clicks outside the message element
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setIsClicked(false); // Hide Edit/Delete buttons if clicked outside
        setShowEmojiPicker(false); // Hide emoji picker if clicked outside
      }
    };

    // Add event listener for clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [messageRef]);

  // Handle dragging of emoji picker
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
      ref={messageRef} // Attach ref to the message div
      className={own ? "message own" : "message"}
      onClick={handleMessageClick} // Handle message click
    >
      <div className="messageTop">
        <img
          className="messageImg"
          src={
            user?.profilePicture
              ? PF + user.profilePicture
              : PF + "person/avatar.jpg"
          }
          alt=""
        />
        {isEditing ? (
          <>
            <input
              className="editMessageInput"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              ref={inputRef} // Focus input when editing
              disabled={loading} // Disable input while loading
            />
            {showEmojiPicker && (
              <div 
                className="emojiPickerContainer" 
                style={{
                  position: 'absolute', 
                  left: emojiPickerPosition.x, 
                  top: emojiPickerPosition.y,
                  cursor: 'move' // Change cursor style to indicate drag capability
                }} 
                onMouseDown={handleMouseDown} // Allow dragging the emoji picker
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  disableSearchBar
                  groupNames={{ smileys_people: 'Smileys & People' }} // Customize group names as needed
                />
              </div>
            )}
          </>
        ) : (
          <p className="messageText">
            {message?.text || "No message text available"}
          </p>
        )}
      </div>
      <div className="messageBottom">
        {isEdited && <span className="editedMessageText">This message is edited.</span>}
        {message?.createdAt ? formatTime(message.createdAt) : "Time not available"}
      </div>
      {own && isClicked && ( // Show Edit/Delete buttons only if the message is clicked
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
