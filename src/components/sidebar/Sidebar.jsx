import "./sidebar.css";
import {RssFeed} from "@mui/icons-material";
import {Notes} from "@mui/icons-material";
import {QuestionAnswer} from "@mui/icons-material";
import {Task} from "@mui/icons-material";
import {Bookmarks} from "@mui/icons-material";
import {Chat} from "@mui/icons-material";
import {Groups} from "@mui/icons-material";
import {Event} from "@mui/icons-material";
import { Users } from "../../dummyData";
import CloseFriend from "../closeFriend/CloseFriend";
import { Link } from "react-router-dom";



export default function Sidebar() {
  return (
    <div className="sidebar">
        <div className="siderbarWrapper">
          <ul className="sidebarList">
            <li className="sidebarListItem">
            <Link to="/" style={{ textDecoration: "none", color:"inherit"}}>
              <RssFeed className="sidebarIcon"/>
              <span className="sidebarlistItemText">Feed</span>
              </Link>
            </li>
            <li className="sidebarListItem">
              <Notes className="sidebarIcon"/>
              <span className="sidebarlistItemText">Notes</span>
            </li>
            <li className="sidebarListItem">
              <QuestionAnswer className="sidebarIcon"/>
              <span className="sidebarlistItemText">Questions</span>
            </li>
            <li className="sidebarListItem">
              <Task className="sidebarIcon"/>
              <span className="sidebarlistItemText">Assignment</span>
            </li>
            <li className="sidebarListItem">
              <Bookmarks className="sidebarIcon"/>
              <span className="sidebarlistItemText">Bookmarks</span>
            </li>
            <li className="sidebarListItem">
            <Link to="/messenger" style={{ textDecoration: "none", color: "inherit" }}>
              <Chat className="sidebarIcon"/>
              <span className="sidebarlistItemText">Chats</span>
            </Link>
            </li>
            <li className="sidebarListItem">
              <Groups className="sidebarIcon"/>
              <span className="sidebarlistItemText">Groups</span>
            </li>
            <li className="sidebarListItem">
              <Event className="sidebarIcon"/>
              <span className="sidebarlistItemText">Test Event</span>
            </li>
          </ul>
          <button className="sidebarButton">Show More</button>
          <hr className="sidebarHr"/>
          <ul className="sidebarFriendList">
            {Users.map((u) => (
              <CloseFriend key={u.id} user={u}/>
            ))}
          </ul>
        </div>
    </div>
  );
}