import { useRef } from "react";
import "./register.css";
import axios from "axios";
import {  Link,useNavigate } from "react-router-dom";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const username = useRef();
  const confirmPassword = useRef();
  const navigate = useNavigate(); // Updated from useHistory to useNavigate

  const handleClick = async (e) => {
    e.preventDefault();
    
    // Clear previous validity messages
    password.current.setCustomValidity("");
    confirmPassword.current.setCustomValidity("");

    if (confirmPassword.current.value !== password.current.value) {
      confirmPassword.current.setCustomValidity("Passwords don't match");
    } else {
      const user = {
        username: username.current.value,
        email: email.current.value,
        password: password.current.value,
      };
      try {
        await axios.post("/auth/register", user);
        navigate("/login"); // Redirect to home or another route after successful registration
      } catch (err) {
        console.log(err);
      }
    }
  };
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
              placeholder="Username"
              required
              ref={username}
              className="loginInput"
            />
            <input
              placeholder="Email Id"
              type="email"
              required
              ref={email}
              className="loginInput"
            />
            <input
              placeholder="Password"
              type="password"
              minLength={6}
              required
              ref={password}
              className="loginInput"
            />
            <input
              placeholder="Confirm Password"
              type="password"
              required
              ref={confirmPassword}
              className="loginInput"
            />
            <button className="loginButton" type="submit">
              Sign Up
            </button>
            <span className="loginForgot">Forgot Password?</span>
            <Link to={`/login`}>
            <button className="loginRegisterButton">Login into Account</button></Link>
          </form>
        </div>
      </div>
    </div>
  );
}
