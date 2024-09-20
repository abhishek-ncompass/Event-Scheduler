import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css"

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:3000/user/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data && data.data) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("email", data.data.user.email);
        localStorage.setItem("userId", data.data.user.userid); 
        setSuccess("Login successful!");
        console.log(data.data)
        navigate("/home", { replace: true });
      } else {
        throw new Error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    }
  };

  return (
    <>
      <div className="form-container">
        <p className="title">Login</p>
        <form className="form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            className="input" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            className="input" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <p className="page-link">
            <span className="page-link-label">Forgot Password?</span>
          </p>
          <button className="form-btn">Log in</button>
        </form>
        <p className="sign-up-label">
          Don't have an account?<span className="sign-up-link"><Link to="/signup">Sign up</Link></span>
        </p>
      </div>
    </>
  );
}

export default Login;