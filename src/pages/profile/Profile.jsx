import Rightbar from "../../components/rightbar/Rightbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/topbar/Topbar";
import Feed from "../../components/feed/Feed";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // To handle navigation
import "./profile.css";
import { useParams } from "react-router";
import { AuthContext } from "../../context/AuthContext";

export default function Profile() {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [user, setUser] = useState({});
  const [followed, setFollowed] = useState(false); 
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State to control edit mode
  const [newCoverPicture, setNewCoverPicture] = useState(null);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const username = useParams().username;

  const { user: currentUser } = useContext(AuthContext); // Current logged-in user
  const navigate = useNavigate(); // Navigation hook

  // Fetch user data from backend
  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`/users?username=${username}`);
      setUser(res.data);
      // Check if the current user follows this user
      setFollowed(res.data.followers.includes(currentUser._id));
    };
    fetchUser();
  }, [username, currentUser._id]);

  // Follow/Unfollow button handler
  const handleFollowClick = async () => {
    setIsFollowing(true);
    try {
      if (followed) {
        await axios.put(`/users/${user._id}/unfollow`, {
          userId: currentUser._id,
        });
      } else {
        await axios.put(`/users/${user._id}/follow`, {
          userId: currentUser._id,
        });
      }
      setFollowed(!followed);
    } catch (err) {
      console.log(err);
    } finally {
      setIsFollowing(false);
    }
  };

  // Message button handler - starts a conversation and redirects
  const handleMessageClick = async () => {
    try {
      // Check if a conversation already exists between the two users
      const res = await axios.get(`/conversations/find/${currentUser._id}/${user._id}`);
      if (!res.data) {
        // If no conversation exists, create one
        await axios.post("/conversations", {
          senderId: currentUser._id,
          receiverId: user._id,
        });
      }
      // Redirect to the messaging page
      navigate(`/messenger?userId=${user._id}`);
    } catch (err) {
      console.log(err);
    }
  };

  // Toggle edit mode
  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  // Handle image uploads and update user profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (newCoverPicture) {
      formData.append("coverPicture", newCoverPicture);
    }
    if (newProfilePicture) {
      formData.append("profilePicture", newProfilePicture);
    }
    formData.append("userId", currentUser._id); // Include user ID

    try {
      await axios.put(`/users/${currentUser._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Refresh user data
      const res = await axios.get(`/users?username=${username}`);
      setUser(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsEditing(false); // Exit edit mode
    }
  };

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <img
                className="profileCoverImg"
                src={user.coverPicture ? PF + user.coverPicture : PF + "person/back.png"}
                alt=""
              />
              <img
                className="profileUserImg"
                src={user.profilePicture ? PF + user.profilePicture : PF + "person/avatar.jpg"}
                alt=""
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{user.username}</h4>
              <span className="profileInfoDesc">{user.desc}</span>
              {user.username === currentUser.username && ( // Show edit button for current user
                <>
                  <button 
                    className="rightbarFollowButton" 
                    onClick={handleEditClick}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </>
              )}
              {isEditing && (
                <form onSubmit={handleUpdate} className="editForm">
                  <input
                    type="file"
                    onChange={(e) => setNewCoverPicture(e.target.files[0])}
                    accept="image/*"
                    placeholder="Select new cover picture"
                  />
                  <input
                    type="file"
                    onChange={(e) => setNewProfilePicture(e.target.files[0])}
                    accept="image/*"
                    placeholder="Select new profile picture"
                  />
                  <button type="submit">Update</button>
                </form>
              )}
              {user.username !== currentUser.username && ( // Show follow/unfollow button for other users
                <>
                  <button 
                    className="rightbarFollowButton" 
                    onClick={handleFollowClick} 
                    disabled={isFollowing}
                  >
                    {followed ? "Unfollow" : "Follow"}
                  </button>

                  {followed && ( // Show "Message" button only if followed
                    <button 
                      className="rightbarMessageButton" 
                      onClick={handleMessageClick}
                    >
                      Message
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="profileRightBottom">
            <Feed username={username} />
            <Rightbar user={user} />
          </div>
        </div>
      </div>
    </>
  );
}
