import Rightbar from "../../components/rightbar/Rightbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/topbar/Topbar";
import Feed from "../../components/feed/Feed";
import "./profile.css";

export default function Profile() {
  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
                <div className="profileCover">
                    <img className="profileCoverImg" 
                    src="assets/post/A1.png" 
                    alt="" />
                    <img
                    className="profileUserImg"
                    src="assets/person/team-4a.png"
                    alt=""
                    />
                </div>
                <div className="profileInfo">
                    <h4 className="profileInfoName">Shreya Gupta</h4>
                    <span className="profileInfoDesc">Hey there!!!!!!!!</span>
                </div>
          </div>
          <div className="profileRightBottom">
            <Feed />
            <Rightbar profile/>
          </div>
        </div>
      </div>
    </>
  );
}
