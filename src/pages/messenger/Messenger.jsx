import "./messenger.css";
import Topbar from "../../components/topbar/Topbar";
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/message/Message";
import ChatOnline from "../../components/chatOnline/ChatOnline";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";
import EmojiPicker from 'emoji-picker-react';
import { EmojiEmotions } from "@mui/icons-material";
import { format, isToday, isYesterday, parseISO } from 'date-fns';

// const formatTimestamp = (timestamp) => {
//   try {
//     if (typeof timestamp !== 'string') {
//       throw new Error("Timestamp is not a string");
//     }
//     const date = parseISO(timestamp);
//     if (isToday(date)) {
//       return format(date, "h:mm a");
//     } else if (isYesterday(date)) {
//       return "Yesterday";
//     } else {
//       return format(date, "MMMM d, yy h:mm a");
//     }
//   } catch (error) {
//     console.error("Error formatting timestamp:", error);
//     return timestamp;
//   }
// };



const groupMessagesByDate = (messages) => {
  const grouped = messages.reduce((acc, message) => {
    const date = parseISO(message.createdAt);
    const key = isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MM/dd/yyyy");

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(message);
    return acc;     
  }, {});

  return Object.entries(grouped);
};

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();
  const [showEmojis, setShowEmojis] = useState(false);
  const emojiPickerRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const connectSocket = () => {
      socket.current = io("ws://localhost:8900");
      socket.current.on("getMessage", (data) => {
        setArrivalMessage({
          sender: data.senderId,
          text: data.text,
          createdAt: new Date().toISOString(),
        });
      });
    };

    connectSocket();

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const addUserToSocket = () => {
      socket.current.emit("addUser", user._id);
      socket.current.on("getUser", (users) => {
        setOnlineUsers(
          user.followings.filter((f) => users.some((u) => u.userId === f))
        );
      });
    };

    addUserToSocket();

    return () => {
      socket.current.off("getUser");
    };
  }, [user]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/conversations/" + user._id);
        setConversations(res.data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };
    getConversations();
  }, [user._id]);

  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat) return;
      try {
        const res = await axios.get("/messages/" + currentChat?._id);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    getMessages();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find((member) => member !== user._id);

    socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post("/messages", message);
      setMessages((prevMessages) => [...prevMessages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);     

  const onEmojiClick = (e) => {
    setNewMessage((prev) => prev + e.emoji);
  };

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

  const handleMouseDown = (e) => {
    setDragging(true);
    setPosition({
      x: e.clientX - emojiPickerRef.current.offsetLeft,
      y: e.clientY - emojiPickerRef.current.offsetTop,
    });
  };

  // Handle message deletion
  const handleDeleteMessage = (messageId) => {
    // Emit delete event to the server
    const receiverId = currentChat.members.find((member) => member !== user._id);
    socket.current.emit("deleteMessage", { messageId, receiverId, conversationId: currentChat._id });
    // Remove message from local state for immediate feedback
    setMessages((prevMessages) => prevMessages.filter((message) => message._id !== messageId));
  };

  // Handle message editing
  const handleEditMessage = async (messageId, updatedText) => {
    // Emit edit event to the server
    const receiverId = currentChat.members.find((member) => member !== user._id);
    socket.current.emit("editMessage", { messageId, updatedText, receiverId, conversationId: currentChat._id });
    // Update message in local state for immediate feedback
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message._id === messageId ? { ...message, text: updatedText } : message
      )
    );
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
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, position.x, position.y]);

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input placeholder="Search for friends" className="chatMenuInput" />
            {conversations.map((c) => (
              <div key={c._id} onClick={() => setCurrentChat(c)}>
                <Conversation conversations={c} currentUser={user} />
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {groupedMessages.map(([date, msgs]) => (
                    <div key={date}>
                      <div className="dateSeparator">{date}</div>
                      {msgs.map((m) => (
                        <div ref={scrollRef} key={m._id}>
                          <Message 
                            message={m} 
                            own={m.sender === user._id} 
                            user={user}
                            onDelete={handleDeleteMessage} // Pass the delete handler
                            onEdit={handleEditMessage} // Pass the edit handler
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder="Write something..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  <div className="shareOption" onClick={() => setShowEmojis(!showEmojis)}>
                    <EmojiEmotions htmlColor="goldenrod" className="shareIcon" />
                  </div>
                  {showEmojis && (
                    <div
                      className="emojiPicker"
                      ref={emojiPickerRef}
                      onMouseDown={handleMouseDown}
                      style={{ position: "absolute", top: "100px", left: "100px" }}
                    >
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a conversation to start a chat.
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <ChatOnline
              onlineUsers={onlineUsers}
              currentId={user._id}
              setCurrentChat={setCurrentChat}
            />
          </div>
        </div>
      </div>
    </>
  );
}
  