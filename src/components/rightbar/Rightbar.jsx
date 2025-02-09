import "./rightbar.css";
import { Users } from "../../dummyData";
import Online from "../online/Online";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Rightbar({ user }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [friends, setFriends] = useState([]);
  const { user: currentUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false); // State for edit mode
  const [editUser, setEditUser] = useState({
    city: "",
    from: "",
    relationship: 0,
  });

  // Update editUser state when user prop changes
  useEffect(() => {
    if (user) {
      setEditUser({
        city: user.city || "",
        from: user.from || "",
        relationship: user.relationship || 0,
      });
    }
  }, [user]);

  // Fetch friends when user changes
  useEffect(() => {
    if (user?._id) {
      const getFriends = async () => {
        try {
          const friendList = await axios.get("/users/friends/" + user._id);
          setFriends(friendList.data);
        } catch (err) {
          console.log(err);
        }
      };
      getFriends();
    }
  }, [user]);

  // Toggle edit mode
  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission to update user info
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`/users/${currentUser._id}`, {
        userId: currentUser._id,
        city: editUser.city,
        from: editUser.from,
        relationship: editUser.relationship,
      });
      setIsEditing(false); // Exit edit mode after update

      window.location.reload()
      // Optionally trigger a state update to reflect changes without reloading the page
      // Instead of `window.location.reload()`, re-fetch or update the local user state
    } catch (err) {
      console.log(err);
    }
  };

  const HomeRightbar = () => {
    return (
      <>
        <div className="birthdayContainer">
          <img className="birthdayImg" src={`${PF}gift.png`} alt="" />
          <span className="birthdayText">
            <b>Shreya Gupta</b> and <b>3 other friends</b> have a birthday
            today.
          </span>
        </div>
        <img className="rightbarAd" src={`${PF}ad.jpg`} alt="" />
        <h4 className="rightbarTitle">Online Friends</h4>
        <ul className="righbarFriendList">
          {Users.map((u) => (
            <Online key={u.id} user={u} />
          ))}
        </ul>
      </>
    );
  };

  const ProfileRightbar = () => (
    <>
      <h4 className="rightbarTitle">User Information</h4>
      <div className="rightbarInfo">
        {!isEditing ? (
          <>
            <div className="rightbarInfoItem">
              <span className="rightbarInfoKey">City:</span>
              <span className="rightbarInfoValue">{user?.city || "N/A"}</span>
            </div>
            <div className="rightbarInfoItem">
              <span className="rightbarInfoKey">From:</span>
              <span className="rightbarInfoValue">{user?.from || "N/A"}</span>
            </div>
            <div className="rightbarInfoItem">
              <span className="rightbarInfoKey">Relationship:</span>
              <span className="rightbarInfoValue">
                {user?.relationship === 1
                  ? "Single"
                  : user?.relationship === 2
                  ? "Married"
                  : user?.relationship === 3
                  ? "Other"
                  : "N/A"}
              </span>
            </div>
            {user?.username === currentUser.username && (
              <button className="rightbarEditButton" onClick={handleEditClick}>
                Edit
              </button>
            )}
          </>
        ) : (
          <form className="editForm" onSubmit={handleSubmit}>
            <div className="rightbarInfoItem">
              <span className="rightbarInfoKey">City:</span>
              <input
                type="text"
                name="city"
                value={editUser.city}
                onChange={handleChange}
              />
            </div>
            <div className="rightbarInfoItem">
              <span className="rightbarInfoKey">From:</span>
              <input
                type="text"
                name="from"
                value={editUser.from}
                onChange={handleChange}
              />
            </div>
            <div className="rightbarInfoItem">
              <span className="rightbarInfoKey">Relationship:</span>
              <select
                name="relationship"
                value={editUser.relationship}
                onChange={handleChange}
              >
                <option value="1">Single</option>
                <option value="2">Married</option>
                <option value="3">Other</option>
              </select>
            </div>
            <div>
              <button type="submit" className="rightbarUpdateButton">
                Update
              </button>
              <button
                type="button"
                className="rightbarCancelButton"
                onClick={handleEditClick}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <h4 className="rightbarTitle">User Friends</h4>
      <div className="rightbarFollowings">
        {friends.map((friend) => (
          <Link
            to={`/profile/${friend.username}`}
            style={{ textDecoration: "none" }}
            key={friend._id}
          >
            <div className="rightbarFollowing">
              <img
                src={
                  friend.profilePicture
                    ? PF + friend.profilePicture
                    : PF + "person/avatar.jpg"
                }
                alt={friend.username}
                className="rightbarFollowingImg"
              />
              <div className="rightbarFollowingName">{friend.username}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <div className="rightbar">
      <div className="righbarWrapper">
        {user ? <ProfileRightbar /> : <HomeRightbar />}
      </div>
    </div>
  );
}
