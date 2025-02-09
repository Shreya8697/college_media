import "./closefriend.css";
import { Link } from "react-router-dom";

export default function CloseFriend({ user }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  return (
    <li className="sidebarFriend">
      {/* Link to user's profile */}
      <Link to={`/profile/${user.username}`}>
        <img
          className="postProfileImg"
          src={
            user.profilePicture
              ? PF + user.profilePicture
              : PF + "person/avatar.jpg"
          }
          alt={user.username}
        />
      </Link>
      {/* Display user's username */}
      <span className="sidebarFriendName">{user.username}</span>
    </li>
  );
}
