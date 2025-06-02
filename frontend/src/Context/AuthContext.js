import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCart } from "./CartContext"; // Ensure correct import path

export const AuthContext = createContext({
  isAuthOpen: false,
  setIsAuthOpen: () => {},
  initialAuthForm: "login", // Add state for initial form type
  setInitialAuthForm: () => {},
  user: null,
  login: () => {},
  logout: () => {},
});

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [initialAuthForm, setInitialAuthForm] = useState("login"); // State to control initial form in modal
  const { handleLogin, handleLogout } = useCart(); // Access cart context methods

  // Add axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        // Check for new access token in response header
        const newToken = response.headers["new-access-token"];
        if (newToken) {
          localStorage.setItem("token", newToken);
          const decoded = jwtDecode(newToken);
          setUser({ id: decoded.id, name: decoded.name, email: decoded.email });
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired and refresh failed
          localStorage.removeItem("token");
          setUser(null);
          handleLogout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [handleLogout]);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, name: decoded.name, email: decoded.email });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      } finally {
        // Ensure modal is closed and form is reset on app load
        setIsAuthOpen(false);
        setInitialAuthForm("login");
      }
    }
  }, []);

  // Function to open modal and set initial form
  const openAuthModal = useCallback((formType) => {
    setInitialAuthForm(formType);
    setIsAuthOpen(true);
  }, []);

  // Login and sync cart
  const login = useCallback(
    async (token) => {
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      setUser({ id: decoded.id, name: decoded.name, email: decoded.email });
      setIsAuthOpen(false); // Close modal on successful login
      setInitialAuthForm("login"); // Reset initial form state
      await handleLogin(token);
      window.location.reload(); // Reload page after successful login
    },
    [handleLogin]
  );

  // Logout and reset cart
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    handleLogout();
    setIsAuthOpen(false); // Close modal on logout
    setInitialAuthForm("login"); // Reset initial form state
    window.location.reload(); // Reload page after logout
  }, [handleLogout]);

  // Memoize context
  const contextValue = useMemo(
    () => ({
      isAuthOpen,
      setIsAuthOpen, // Still provide the original setter if needed elsewhere
      initialAuthForm,
      openAuthModal, // Provide the new function to open and set form
      user,
      login,
      logout,
    }),
    [
      isAuthOpen,
      setIsAuthOpen,
      initialAuthForm,
      openAuthModal,
      user,
      login,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
