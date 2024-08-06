import "./login.css"

export default function Login() {
  return (
    <div className="login">
        <div className="loginWrapper">
            <div className="loginLeft">
                <h3 className="loginLogo">College Media</h3>
                <div className="spanLoginDesc">
                    Connect with friends and the world around you on College Media.
                </div>
            </div>
            <div className="loginRight">
                <div className="loginBox">
                    <input placeholder="Email Id" className="loginInput"/>
                    <input placeholder="Password" className="loginInput"/>
                    <button className="loginButton">Log in</button>
                    <span className="loginForgot">Forgot Password?</span>
                    <button className="loginRegisterButton">Create a New Account</button>
                </div>
            </div>
        </div>
      
    </div>
  )
}
