import { useContext, useRef } from "react";
import "./login.css";
import { loginCall } from "../../apiCalls";
import { AuthContext } from "../../context/AuthContext";
import { CircularProgress } from "@mui/material";
import {  Link} from "react-router-dom";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const { user, isFetching, dispatch } = useContext(AuthContext);

  const handleClick = (e) => {
    e.preventDefault();
    loginCall(
      { email: email.current.value, password: password.current.value },
      dispatch
    );
  };
  
  console.log(user);
  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">College Media</h3>
          <div className="loginDesc">
            Connect with friends and the world around you on College Media.
          </div>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={handleClick}>
            <input
              placeholder="Email Id"
              type="email"
              className="loginInput"
              required
              ref={email}
            />
            <input
              placeholder="Password"
              type="password"
              required
              minLength={"6"}
              className="loginInput"
              ref={password}
            />
            <button className="loginButton" type="submit" disabled={isFetching}>
              {isFetching ? <CircularProgress /> : "Log In"}
            </button>
            <span className="loginForgot">Forgot Password?</span>
            <Link to={`/register`}>
            <button className="loginRegisterButton">
              Create a New Account
            </button></Link>
          </form>
        </div>
      </div>
    </div>
  );
}
