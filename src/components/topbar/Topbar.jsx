import "./topbar.css";
import {Search, Person, Chat, Notifications} from "@mui/icons-material";

const Topbar = () => {
  return (
    <div className="topbarContainer">
        <div className="topbarLeft">
            <span className="logo">College Media</span>
        </div>
        <div className="topbarCenter">
            <div className="searchbar">
                <Search className="searchIcon"/>
                <input placeholder="Search for Students Notes and Document" className="serachInput" />
            </div>
        </div>
        <div className="topbarRight">
            <div className="topbarLinks">
                <span className="topbarLink">HomePage</span>
                <span className="topbarLink">TimeLline</span>
            </div>
            <div className="topbarIcons">
                <div className="topbarIconItem">
                    <Person/>
                    <span className="topbarIconBadge">1</span>
                </div>
                <div className="topbarIconItem">
                    <Chat/>
                    <span className="topbarIconBadge">3</span>
                </div>
                <div className="topbarIconItem">
                    <Notifications/>
                    <span className="topbarIconBadge">1</span>
                </div>
            </div>
            <img src="/assets/person/team-1.jpg" alt="" className="topbarImage" />
        </div>
    </div>
  )
}

export default Topbar