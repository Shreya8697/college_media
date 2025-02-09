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
import React, { useState, useEffect } from "react";
import axios from "axios";


export default function Sidebar() {

  const [users, setUsers] = useState([]);

  // Fetch all users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Assuming you have an endpoint '/users/all' to fetch all users
        const res = await axios.get("/users/all");
        setUsers(res.data); // Set the fetched users into the state
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  
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
            <Link to="/groups" style={{ textDecoration: "none", color: "inherit" }}>
              <Groups className="sidebarIcon"/>
              <span className="sidebarlistItemText">Groups</span>
              </Link>
            </li>
            <li className="sidebarListItem">
              <Event className="sidebarIcon"/>
              <span className="sidebarlistItemText">Test Event</span>
            </li>
          </ul>
          <button className="sidebarButton">Show More</button>
          <hr className="sidebarHr"/>
          <ul className="sidebarFriendList">
          {users.map((user) => (
            <CloseFriend key={user._id} user={user} />
          ))}
        </ul>
        </div>
    </div>
  );
}