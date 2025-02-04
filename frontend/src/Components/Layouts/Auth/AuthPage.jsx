import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AuthPage.css";
import Login from "./User/Login";
import Register from "./User/Register";

const AuthPage = ({ onLoginSuccess, isMemberLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false); // Flag to toggle sign-up/login form for user
  const [registerData, setRegisterData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // Set initial state based on the route
  useEffect(() => {
    if (location.pathname === "/register") {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [location.pathname]);

  const toggleForm = () => {
    setIsSignUp((prevState) => !prevState
  
  );
  };

  const handleRegisterSuccess = (email, password) => {
    setRegisterData({ email, password });
    setIsSignUp(false);
    navigate("/login"); // After registration success, navigate to user login
  };

  return (
    <div className="background">
    <div className={`auth-container ${isSignUp ? "active" : ""}`}>
      <div className="form-container sign-in-container">
        {isMemberLogin ? (
          <MemberLogin onLoginSuccess={onLoginSuccess} /> 
        ) : (
          <Login onLoginSuccess={onLoginSuccess} preFillData={registerData} /> 
        )}
      </div>

      {/* Only show sign-up container if it's not member login */}
      {!isMemberLogin && (
        <div className="form-container sign-up-container">
          <Register onRegisterSuccess={handleRegisterSuccess} />
        </div>
      )}

      <div className="overlay">
        <h1>{isMemberLogin ? "Welcome Back, Member!" : "Welcome Back!"}</h1>
        <p>
          {isMemberLogin
            ? "Members can log in here, no sign-up available."
            : "If you already have an account, please log in here."}
        </p>
        {/* Only show the toggle button if it's not member login */}
        {!isMemberLogin && (
          <button onClick={toggleForm}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        )}
      </div>
    </div>
    </div>
  );
 
};

export default AuthPage;