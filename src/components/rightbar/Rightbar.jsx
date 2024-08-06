import "./rightbar.css";
import { Users } from "../../dummyData";
import Online from "../online/Online";

export default function Rightbar({profile}) {
  const HomeRightbar=()=>{
    return(
      <>
      <div className="birthdayContainer">
          <img className="birthdayImg" src="assets/gift.png" alt="" />
          <span className="birthdayText">
            <b>Shreya Gupta </b>and <b>3 other friends</b> have a birthday
            today.
          </span>
        </div>
        <img className="rightbarAd" src="assets/ad.jpg" alt="" />
        <h4 className="rightbarTitle">Online Friends</h4>
        <ul className="righbarFriendList">
          {Users.map(u=>(
            <Online key={u.id} user={u}/>
          ))}
        </ul>
      </>
    );
  };
  const ProfileRightbar=()=> {
    return(
      <>
      <h4 className="rightbarTitle">User Information </h4>
      <div className="rightbarInfo">
        <div className="rightbarInfoItem">
          <span className="rightbarInfoKey">City:</span>
          <span className="rightbarInfoValue">Andheri</span>
        </div>
        <div className="rightbarInfoItem">
          <span className="rightbarInfoKey">From:</span>
          <span className="rightbarInfoValue">India</span>
        </div>
        <div className="rightbarInfoItem">
          <span className="rightbarInfoKey">Relationship:</span>
          <span className="rightbarInfoValue">Single</span>
        </div>
      </div>
      <h4 className="rightbarTitle">User Friends</h4>
      <div className="rightbarFollowings">
        <div className="rightbarfollowing">
          <img src="assets/person/team-1.jpg" alt="" className="rightbarFollowingImg" />
          <span className="rightbarFollowingName">Sachin kashyap</span>
        </div>
        <div className="rightbarfollowing">
          <img src="assets/person/team-3a.png" alt="" className="rightbarFollowingImg" />
          <span className="rightbarFollowingName">Sarita kashyap</span>
        </div>
        <div className="rightbarfollowing">
          <img src="assets/person/team-4a.png" alt="" className="rightbarFollowingImg" />
          <span className="rightbarFollowingName">Shreyash gupta</span>
        </div>
        <div className="rightbarfollowing">
          <img src="assets/person/team-6.jpg" alt="" className="rightbarFollowingImg" />
          <span className="rightbarFollowingName">Saurabh kashyap</span>
        </div>
        <div className="rightbarfollowing">
          <img src="assets/person/team-7a.jpg" alt="" className="rightbarFollowingImg" />
          <span className="rightbarFollowingName">Govinda kashyap</span>
        </div>
        <div className="rightbarfollowing">
          <img src="assets/person/team-1.jpg" alt="" className="rightbarFollowingImg" />
          <span className="rightbarFollowingName">Rounak Gupta</span>
        </div>
      </div>
      </>
    )
  }
  return (
    <div className="rightbar">
      <div className="righbarWrapper">
        <ProfileRightbar/>
      </div>
    </div>
  );
  
}
