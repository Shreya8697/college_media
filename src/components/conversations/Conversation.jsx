import { useEffect, useState } from "react";
import "./conversation.css";
import axios from "axios";
//import Modal from 'react-modal'; // Assuming you're using react-modal for modale

export default function Conversation({ conversations, currentUser, onDelete }) {
  const [user, setUser] = useState(null); // Store user data
  const [lastMessage, setLastMessage] = useState("No messages yet"); // Store the most recent message
  const [showOptions, setShowOptions] = useState(false); // To show or hide delete options
  const PF = process.env.REACT_APP_PUBLIC_FOLDER; // Public folder path
  //const [friends, setFriends] = useState([]); // To store the list of friends
  //const [groupName, setGroupName] = useState(''); // Group name
  const [selectedFriends, setSelectedFriends] = useState([]); // Selected members for the group
 // const [isModalOpen, setIsModalOpen] = useState(false); // For opening/closi

  useEffect(() => {
    // Fetch user and last message
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

            setLastMessage(messagesRes.data.text || "No message yet");
          } catch (err) {
            console.error("Error fetching user or message:", err);
          }
        };

        getUserAndMessage();
      }
    }
  }, [currentUser, conversations]);
  

  // Handle delete conversation
  const handleDelete = async (e) => {
    e.stopPropagation(); // Stop the event from propagating upwards
    try {
      await axios.delete(`/conversations/${conversations._id}`); // API call to delete the conversation
      setShowOptions(false); // Hide options after deletion
      window.location.reload(); // Refresh the window after deletion
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };
  

  // Handle clicking anywhere outside the options
  const handleOutsideClick = () => {
    setShowOptions(false); // Hide options
  };


  useEffect(() => {
    // Fetch the user's friends list
    const getFriends = async () => {
      try {
        const friendsRes = await axios.get(`/users/friends/${currentUser._id}`);
        setFriends(friendsRes.data);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };

    getFriends();
  }, [currentUser]);

  // Handle create group
  // const handleCreateGroup = async () => {
  //   if (!groupName || selectedFriends.length === 0) {
  //     alert("Please provide a group name and select at least one friend.");
  //     return;
  //   }

  //   try {
  //     // Create group conversation with selected friends and current user
  //     const newGroupConversation = {
  //       members: [currentUser._id, ...selectedFriends],
  //       groupName: groupName,
  //     };

  //     await axios.post('/conversations/group', newGroupConversation);
  //     setIsModalOpen(false); // Close the modal after group creation
  //     window.location.reload(); // Reload to show the new group in the conversation list
  //   } catch (err) {
  //     console.error("Error creating group conversation:", err);
  //   }
  // };

  // Handle selecting friends for the group
  const handleFriendSelect = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  
  return (
    <div className="conversation" onClick={handleOutsideClick}>
      <img
        className="conversationImg"
        src={user?.profilePicture ? PF + user.profilePicture : PF + "person/avatar.jpg"}
        alt=""
      />
      <div className="conversationDetails">
        <span className="conversationName">{user?.username}</span>
        <p className="conversationLastMessage">{lastMessage}</p> {/* Show last message */}
      </div>

      {/* Dots Button */}
      <div className="conversationOptions">
        <button
          className="dotsButton"
          onClick={(e) => {
            e.stopPropagation(); // Stop propagation to avoid hiding the options immediately
            setShowOptions(!showOptions);
          }}
        >
          ...
        </button>

        {/* Show Delete and Cancel Options when dots are clicked */}
        {showOptions && (
          <div className="optionsMenu">
            <button className="deleteButton" onClick={handleDelete}>
              Delete
            </button>
            <button
              className="cancelButton"
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(false); // Hide options when cancel is clicked
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
