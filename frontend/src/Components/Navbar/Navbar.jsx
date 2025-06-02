import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.js";
import { useCart } from "../../Context/CartContext";
import shoppingBag from "../Assets/bag.png";
import chatBot from "../Assets/discord.png";
import logo from "../Assets/logo.png";
import userIcon from "../Assets/user.png"; // Assuming you have a user icon image
import CartDropdown from "../CartDropdown/CartDropdown";
import ChatBotDropdown from "../ChatBotDropdown/ChatBotDropdown";
import "./Navbar.css";

export const Navbar = () => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState("home");
  const { user, logout, openAuthModal } = useAuth(); // Use openAuthModal
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar toggle
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // State for logged-in user menu dropdown
   const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false); // State for login/register dropdown

  const { cartItems } = useCart();
// console.log("Cart items in UI (Navbar):", cartItems);

  // Use openAuthModal with form type
  const handleAuthClick = (formType) => {
    openAuthModal(formType); // Open modal and set initial form
    // Close any open menus when authentication modal is opened
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
    }
     if (isAuthMenuOpen) {
        setIsAuthMenuOpen(false);
     }
  };

  const handleLogoutClick = () => {
    logout();
    // Close any open menus on logout
     if (isUserMenuOpen) {
        setIsUserMenuOpen(false); // Close user menu on logout
     }
     if (isSidebarOpen) {
        setIsSidebarOpen(false); // Close sidebar on logout
     }
     if (isAuthMenuOpen) {
        setIsAuthMenuOpen(false); // Close auth menu on logout
     }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Close other menus when opening/closing sidebar
    if (isUserMenuOpen) {
        setIsUserMenuOpen(false); 
    }
    if (isAuthMenuOpen) {
        setIsAuthMenuOpen(false); 
    }
  };

   const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    // Close other menus when opening/closing user menu
    if (isSidebarOpen) {
        setIsSidebarOpen(false); 
    }
     if (isAuthMenuOpen) {
        setIsAuthMenuOpen(false); 
     }
   };

    const toggleAuthMenu = () => {
        setIsAuthMenuOpen(!isAuthMenuOpen);
        // Close other menus when opening/closing auth menu
        if (isSidebarOpen) {
            setIsSidebarOpen(false); 
        }
         if (isUserMenuOpen) {
            setIsUserMenuOpen(false); 
        }
    };


// Function to get the first name
const getFirstName = (fullName) => {
  if (!fullName) return "";
  const spaceIndex = fullName.indexOf(' ');
  if (spaceIndex === -1) {
    return fullName; // No space found, return the whole name
  } else {
    return fullName.substring(0, spaceIndex); // Return part before the first space
  }
};

 // Helper function to render user/auth icons and dropdowns
  const renderUserAuthIcons = () => (
    <div className="login-cart-chat">
      {/* User Icon or Login/Register Dropdown Toggle */}
      {user ? (
          <div className="user-info-container" style={{ position: 'relative' }}>
              <img 
                  src={userIcon} 
                  alt="User Account" 
                  className="user-icon"
                  onClick={toggleUserMenu}
              />
              {isUserMenuOpen && ( /* Logged-in User Menu Dropdown */
                  <div className="user-menu-dropdown">
                      <div className="welcome-msg">Welcome {getFirstName(user.name)}</div>
                      <button className="logout-btn" onClick={handleLogoutClick}>
                          LOGOUT
                      </button>
                  </div>
              )}
          </div>
      ) : (
           <div className="user-info-container" style={{ position: 'relative' }}>
               <img 
                   src={userIcon} 
                   alt="User Account" 
                   className="user-icon"
                   onClick={toggleAuthMenu} // Toggle login/register menu
               />
               {isAuthMenuOpen && ( /* Login/Register Dropdown */
                   <div className="auth-menu-dropdown">
                       {/* Update onClick to use handleAuthClick with form type */}
                       <button className="dropdown-item" onClick={() => handleAuthClick('login')}>Login</button>
                       <button className="dropdown-item" onClick={() => handleAuthClick('register')}>Register</button>
                   </div>
               )}
           </div>
      )}

      {/* Cart Icon */}
      <div className="cart-wrapper" style={{ position: "relative" }}>
        <img
          src={shoppingBag}
          alt="Shopping Cart"
          className="cart-toggle-icon"
          style={{ height: "24px", cursor: "pointer" }}
          onClick={() => setIsCartOpen(!isCartOpen)}
        />
        <span className="cart-count">{cartItems.length}</span>
        {isCartOpen && (
          <div style={{ position: "absolute", right: 0, top: "110%", zIndex: 100 }}>
            <CartDropdown />
          </div>
        )}
      </div>

      {/* ChatBot */}
      <div className="chat-wrapper" style={{ position: "relative" }}>
        <img
          src={chatBot}
          alt="Chat Bot"
          className="chat-toggle-icon"
          style={{ height: "24px", cursor: "pointer" }}
          onClick={() => setIsChatOpen(!isChatOpen)}
        />
        {isChatOpen && <ChatBotDropdown />}
      </div>
    </div>
  );

  return (
    <div className="navbar-container">

        {/* Fixed Top Bar for Mobile */}
        <div className="navbar-top-fixed">
            {/* Sidebar Toggle Icon (Hamburger) */}
             {/* Conditionally apply 'open' class for animation */}
              <div className={`sidebar-toggle-icon ${isSidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}>
                  <div></div>
                  <div></div>
                  <div></div>
              </div>

            {/* Logo */}
            <div className="nav-logo">
              <img src={logo} alt="Website Logo" />
            </div>

            {/* User/Cart/Chat Icons */}
             {renderUserAuthIcons()}
        </div>

        {/* Main Navbar Content (Horizontal on PC, hidden on Mobile) */}
        <div className="navbar-main">
            {/* Logo - PC Only */}
             <div className="nav-logo">
                <img src={logo} alt="Website Logo" />
             </div>

            {/* Navigation Menu - PC Only */}
            <ul className="nav-menu">
              <li onClick={() => { setMenu("home"); navigate("/"); }}>
                Home {menu === "home" && <span className="active-indicator" />}
              </li>
              <li onClick={() => { setMenu("skincare"); navigate("/skincare"); }}>
                Skincare {menu === "skincare" && <span className="active-indicator" />}
              </li>
              <li onClick={() => { setMenu("hair_body"); navigate("/hair_body"); }}>
                Hair & Body {menu === "hair_body" && <span className="active-indicator" />}
              </li>
              <li onClick={() => { setMenu("sets_collections"); navigate("/sets_collections"); }}>
                Sets & Collections {menu === "sets_collections" && <span className="active-indicator" />}
              </li>
              <li onClick={() => { setMenu("skin_analyzer"); navigate("/skin-analyzer"); }}>
                Skin Analyzer {menu === "skin_analyzer" && <span className="active-indicator" />}
              </li>
              <li onClick={() => { setMenu("about"); navigate("/about"); }}>
                About {menu === "about" && <span className="active-indicator" />}
              </li>
            </ul>

            {/* User/Cart/Chat Icons - PC Only */}
            {renderUserAuthIcons()}
        </div>

        {/* Collapsible Sidebar (Navigation Menu + potentially other items for mobile) */}
        {/* Conditionally apply 'open' class for sidebar */} 
        <div className={`nav-sidebar ${isSidebarOpen ? 'open' : ''}`}>
           <ul className="nav-menu">
            {/* Close sidebar on navigation item click */}
            <li onClick={() => { setMenu("home"); navigate("/"); toggleSidebar(); }}>
              Home {menu === "home" && <span className="active-indicator" />}
            </li>
            <li onClick={() => { setMenu("skincare"); navigate("/skincare"); toggleSidebar(); }}>
              Skincare {menu === "skincare" && <span className="active-indicator" />}
            </li>
            <li onClick={() => { setMenu("hair_body"); navigate("/hair_body"); toggleSidebar(); }}>
              Hair & Body {menu === "hair_body" && <span className="active-indicator" />}
            </li>
            <li onClick={() => { setMenu("sets_collections"); navigate("/sets_collections"); toggleSidebar(); }}>
              Sets & Collections {menu === "sets_collections" && <span className="active-indicator" />}
            </li>
            <li onClick={() => { setMenu("skin_analyzer"); navigate("/skin-analyzer"); toggleSidebar(); }}>
              Skin Analyzer {menu === "skin_analyzer" && <span className="active-indicator" />}
            </li>
            <li onClick={() => { setMenu("about"); navigate("/about"); toggleSidebar(); }}>
              About {menu === "about" && <span className="active-indicator" />}
            </li>
          </ul>
        </div>
    </div>
  );
};
