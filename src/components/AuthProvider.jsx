import { useState } from "react";
import axios from "@/config/api";
import { AuthContext } from "@/contexts/AuthContext";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    console.log("Initializing auth - saved token exists:", !!savedToken);

    return savedToken;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      console.log("Initializing auth - saved user exists");
      return JSON.parse(savedUser);
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
      let loggedInUser = {
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
      };
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (err) {
      console.log(err.response.data.msg);
      return err.response.data;
    }
  };

  const onLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };


  const value = {
    token,
    user,
    onLogin,
    onLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
