import { useEffect, useState } from "react";
import "./conversation.css";
import axios from "axios";

export default function Conversation({ conversations, currentUser }) {
  const [user, setUser] = useState(null); // Store user data
  const [lastMessage, setLastMessage] = useState("No messages yet"); // Store the most recent message
  const PF = process.env.REACT_APP_PUBLIC_FOLDER; // Public folder path

  useEffect(() => {
    // Check if conversations and currentUser are defined
    if (conversations && currentUser) {
      const friendId = conversations.members.find((m) => m !== currentUser._id);
      
      if (friendId) {
        const getUserAndMessage = async () => {
          try {
            // Fetch the friend/user details
            const userRes = await axios.get("/users", {
              params: { userId: friendId },
            });

            setUser(userRes.data);

            // Fetch the most recent message in the conversation
            const messagesRes = await axios.get(`/messages/latest`, {
              params: { conversationId: conversations._id },
            });

            setLastMessage(messagesRes.data.text || "No message yet"); // Set the last message
          } catch (err) {
            console.error("Error fetching user or message:", err);
          }
        };

        getUserAndMessage();
      }
    }
  }, [currentUser, conversations]);

  return (
    <div className="conversation">
      <img
        className="conversationImg"
        src={
          user?.profilePicture
            ? PF + user.profilePicture
            : PF + "person/avatar.jpg"
        }
        alt=""
      />
      <div className="conversationDetails">
        <span className="conversationName">{user?.username}</span>
        <p className="conversationLastMessage">{lastMessage}</p> {/* Show last message */}
      </div>
    </div>
  );
}
