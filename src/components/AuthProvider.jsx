import { useState } from "react";
import axios from "@/config/api";
import { AuthContext } from "@/contexts/AuthContext";

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    console.log("Decoded token:", decoded);

    if (!decoded) {
      console.log("Token could not be decoded");
      return true;
    }

    if (!decoded.exp) {
      console.log("Token has no expiration, treating as valid");
      return false; // If no expiration, treat as valid
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp < currentTime;

    console.log("Token expiration check:", {
      exp: decoded.exp,
      currentTime: currentTime,
      expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
      isExpired: isExpired,
    });

    return isExpired;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

// Auth Provider component to wrap the app and provide auth state
// children is a prop that represents the nested components
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    console.log("Initializing auth - saved token exists:", !!savedToken);

    if (savedToken) {
      // Check if token is expired
      if (isTokenExpired(savedToken)) {
        console.log("Token is expired, removing from localStorage");
        localStorage.removeItem("token");
        return null;
      }
      console.log("Token is valid, using it");
      return savedToken;
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    // Initialize user from token if it exists and is valid
    const savedToken = localStorage.getItem("token");
    if (savedToken && !isTokenExpired(savedToken)) {
      const decoded = decodeToken(savedToken);
      return decoded
        ? {
            email: decoded.email,
            first_name: decoded.first_name,
            last_name: decoded.last_name,
          }
        : null;
    }
    return null;
  });

  const onLogin = async (email, password) => {
    const options = {
      method: "POST",
      url: "/login",
      data: {
        email,
        password,
      },
    };

    try {
      let response = await axios.request(options);
      console.log(response.data);
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      setUser({
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
      });
    } catch (err) {
      console.log(err.response.data.msg);
      return err.response.data;
    }
  };
  const onLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };
  // Function to check if current token is valid
  const checkTokenValidity = () => {
    if (!token) {
      console.log("No token available");
      return false;
    }
    if (isTokenExpired(token)) {
      // Token is expired, log out the user
      console.log("Token expired, logging out");
      onLogout();
      return false;
    }
    console.log("Token is valid");
    return true;
  };

  const value = {
    token,
    user,
    onLogin,
    onLogout,
    checkTokenValidity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
