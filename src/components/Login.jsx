import React from "react";
import "../styles/Login.css";

export default function Login() {
  return (
    <div className="container">
      <div className="overlay">
        <div className="popup">                   
          <button className="close-btn" onClick={() => window.history.back()}>
            ✖
          </button>
          <h1>Welcome Back</h1>
          <label>Username:</label>
          <input type="text" placeholder="Username" className="input-box" />
          <label>Password:</label>
          <input type="password" placeholder="Password" className="input-box" />
          <button className="login-btn">Login</button>
        </div>
      </div>
    </div>
  );
}
