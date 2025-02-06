import React from "react";
import "../styles/Signin.css"; // Reusing the same CSS file

export default function SignIn() {
  return (
    <div className="container">
        <div className="overlay">
          <div className="popup-signin">
            <button className="close-btn" onClick={() => window.history.back()}>
              ✖
            </button>
            <h1>Create Your Account 🚀</h1>
            <label>Email:</label>
            <input type="email" placeholder="Email" className="input-box" />
            <label>Username:</label>
            <input type="text" placeholder="Username" className="input-box" />
            <label>Password:</label>
            <input type="password" placeholder="Password" className="input-box" />
            <label>Confirm Password:</label>
            <input type="password" placeholder="Confirm Password" className="input-box" />
            <button className="login-btn">Sign In</button>
          </div>
        </div>
      
    </div>
  );
}
