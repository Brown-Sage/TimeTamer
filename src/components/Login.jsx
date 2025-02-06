import React, { useState } from "react";
import "../styles/Login.css";

export default function Login() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="container">
      <button className="open-btn" onClick={() => setIsOpen(true)}>
        Open Login
      </button>

      {isOpen && (
        <div className="overlay">
           <div className="popup">                   
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ✖
            </button>
            <h1>Welcome Back 😊</h1>
            <label>Username:</label>
            <input type="text" placeholder="Username" className="input-box" />
            <label>Password:</label>
            <input type="password" placeholder="Password" className="input-box" />
            <button className="login-btn">Login</button>
          </div>
        </div>
      )}
    </div>
  );
}
