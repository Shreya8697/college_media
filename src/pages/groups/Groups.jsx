import "./groups.css";
import Topbar from "../../components/topbar/Topbar";
import Groupconvo from "../../components/groupconvo/Groupconvo"; // Reuse for groups
import GroupMessage from "../../components/groupmsg/Groupmsg";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { EmojiEmotions } from "@mui/icons-material";
import { format, isToday, isYesterday, parseISO } from "date-fns";


export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();
  const [showEmojis, setShowEmojis] = useState(false);
  const emojiPickerRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Initialize socket and handle incoming messages
  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getGroupMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        groupId: data.groupId,
        createdAt: new Date().toISOString(),
      });
    });

    return () => socket.current.disconnect();
  }, []);

  
// Helper function to group messages by date
const groupmsgByDate = (messages) => {
  const grouped = messages.reduce((acc, message) => {
    const date = parseISO(message.createdAt);
    const key = isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MM/dd/yyyy");

    if (!acc[key]) acc[key] = [];
    acc[key].push(message);
    return acc;
  }, {});

  return Object.entries(grouped);
};

  useEffect(() => {
    if (arrivalMessage && currentGroup?._id === arrivalMessage.groupId) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentGroup]);


  useEffect(() => {
    const getGrpConversations = async () => {
      try {
        const res = await axios.get(`/groups/${user._id}`);
        // Ensure no duplicates are added
        const uniqueGroups = Array.from(new Map(res.data.map(group => [group._id, group])).values());
        setGroups(uniqueGroups);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    getGrpConversations();
  }, [user._id]); // Ensure it runs only when `user._id` changes
  
  // Fetch messages for the selected group
  useEffect(() => {
    const getGroupMessages = async () => {
      if (!currentGroup) return;
      try {
        const res = await axios.get(`/group-messages/${currentGroup._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching group messages:", err);
      }
    };
    getGroupMessages();
  }, [currentGroup]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender: user._id,
      text: newMessage,
      groupId: currentGroup._id,
    };

    const receiverId = currentGroup.members.find((member) => member !== user._id);

    socket.current.emit("sendGroupMessage", {
      senderId: user._id,
      groupId: currentGroup._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post("/group-messages", message);
      setMessages((prev) => [...prev, res.data]);
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
  // const handleGroupClick = (group) => setCurrentGroup(group);

  const groupedMessages = groupmsgByDate(messages);

  return (
    <>
      <Topbar />
      <div className="messenger">
        {/* Sidebar */}
        <div className="chatMenuWrapper">
          <input placeholder="Search for groups" className="chatMenuInput" />
          {groups.length > 0 ? (
            groups.map((group) => (
              <div key={group._id} onClick={() => setCurrentGroup(group)}>
                <Groupconvo conversation={group} currentUser={user} />
              </div>
            ))
          ) : (
            <p>No groups available</p>
          )}
        </div>

        {/* Chat Box */}
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentGroup ? (
              <>
                <div className="chatBoxTop">
                  {groupedMessages.map(([date, msgs]) => (
                    <div key={date}>
                      <div className="dateSeparator">{date}</div>
                      {msgs.map((msg) => (
                        <div key={msg._id} ref={scrollRef}>
                          <GroupMessage
                            message={msg}
                            own={msg.sender === user._id}
                            user={user}
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
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <EmojiEmotions
                    onClick={() => setShowEmojis(!showEmojis)}
                    className="emojiIcon"
                  />
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
                  <button className="chatSubmitButton" onClick={handleSendMessage}>Send</button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a group to start chatting.
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
