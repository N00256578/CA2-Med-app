import { useState, useCallback, useMemo } from "react";
import useSWRMutation from "swr/mutation";
import * as api from "../api";
import { AuthContext } from "../contexts/AuthContext";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("User");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const {
    trigger: doLogin,
    isMutating: loginLoading,
    error: loginError,
  } = useSWRMutation("login", api.post);

  const {
    isMutating: registerLoading,
    error: registerError,
    trigger: doRegister,
  } = useSWRMutation("users", api.post);

  const setSession = useCallback((token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("User", JSON.stringify(userData));
  }, []);

  const login = useCallback(
    async (email, password) => {
      try {
        const data = await doLogin({ email, password }); // data bevat token + user info
        const { token, first_name, last_name, email: userEmail } = data;

        setSession(token, { first_name, last_name, email: userEmail });

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [doLogin, setSession]
  );

  const register = useCallback(
    async (data) => {
      try {
        const result = await doRegister(data);
        const { token, first_name, last_name, email } = result;

        setSession(token, { first_name, last_name, email });

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [doRegister, setSession]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("User");
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      error: loginError || registerError,
      loading: loginLoading || registerLoading,
      isAuthed: Boolean(token),
      login,
      logout,
      register,
    }),
    [
      token,
      user,
      loginError,
      loginLoading,
      registerError,
      registerLoading,
      login,
      logout,
      register,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
