import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext.js";
import "./AuthModal.css";

const AuthModal = () => {
  const { isAuthOpen, setIsAuthOpen, initialAuthForm } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Use effect to set initial form when the modal opens
  useEffect(() => {
    if (isAuthOpen) {
      setIsLogin(initialAuthForm === 'login');
      // Optionally reset initialAuthForm after use
      // setInitialAuthForm(null);
    }
  }, [isAuthOpen, initialAuthForm, setIsLogin]); // Added setIsLogin dependency as recommended by hooks linting rules

  if (!isAuthOpen) return null;

  const handleClose = () => {
    setIsAuthOpen(false);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container">
        <button className="auth-close-btn" onClick={handleClose}>
          ✖
        </button>

        <motion.div
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          {isLogin ? (
            <LoginForm toggleForm={() => setIsLogin(false)} />
          ) : (
            <RegisterForm toggleForm={() => setIsLogin(true)} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

const LoginForm = ({ toggleForm }) => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);

      login(res.data.token); // Uses the context login
      alert("Login successful!");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Login failed";
      alert(errMsg);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <button onClick={toggleForm}>Sign Up</button>
      </p>
    </div>
  );
};

const RegisterForm = ({ toggleForm }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      console.log("Registered:", res.data);
      toggleForm();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Registration failed";
      alert(errMsg);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <button onClick={toggleForm}>Login</button>
      </p>
    </div>
  );
};

export default AuthModal;
