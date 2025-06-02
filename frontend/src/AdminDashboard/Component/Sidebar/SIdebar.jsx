import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

// Example image imports
import addProductIcon from "../Assets/add-product-icon.png";
import dashboardIcon from "../Assets/dashboard-icon.png";
import ordersIcon from "../Assets/orders-icon.png";
import productsIcon from "../Assets/products-icon.png";
import sendMailIcon from "../Assets/send-mail-icon.png"; // You may need to add this icon
import sidebarIcon from "../Assets/sidebar-icon.png";
import subscribersIcon from "../Assets/subscribers-icon.png"; // ✅ Add an icon if available
import usersIcon from "../Assets/users-icon.png";


function Sidebar() {
    const location = useLocation(); // Get current route
    const [isOpen, setIsOpen] = useState(true); // Toggle sidebar

    return (
        <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
            {/* Toggle Button */}
            <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                <img src={sidebarIcon} alt="Sidebar"/>
            </button>

            {/* <h2 className="sidebar-title">{isOpen ? "Admin Panel" : ""}</h2> */}

            <nav className="nav-links">
                <Link to="/admin" className={location.pathname === "/admin" ? "active" : ""}>
                    <img src={dashboardIcon} alt="Dashboard" className="nav-icon" />
                    {isOpen && <span>Dashboard</span>}
                </Link>
                <Link to="/admin/products" className={location.pathname === "/admin/products" ? "active" : ""}>
                    <img src={productsIcon} alt="Products" className="nav-icon" />
                    {isOpen && <span>Products</span>}
                </Link>
                <Link to="/admin/products/add" className={location.pathname === "/admin/products/add" ? "active" : ""}>
                    <img src={addProductIcon} alt="Products" className="nav-icon" />
                    {isOpen && <span>Add Product</span>}
                </Link>
                <Link to="/admin/orders" className={location.pathname === "/admin/orders" ? "active" : ""}>
                    <img src={ordersIcon} alt="Orders" className="nav-icon" />
                    {isOpen && <span>Orders</span>}
                </Link>
                <Link to="/admin/users" className={location.pathname === "/admin/users" ? "active" : ""}>
                    <img src={usersIcon} alt="Users" className="nav-icon" />
                    {isOpen && <span>Users</span>}
                </Link>
                <Link to="/admin/subscribers" className={location.pathname === "/admin/subscribers" ? "active" : ""}>
                    <img src={subscribersIcon} alt="Subscribers" className="nav-icon" />
                    {isOpen && <span>Subscribers</span>}
                </Link>
                <Link to="/admin/send-mail" className={location.pathname === "/admin/send-mail" ? "active" : ""}>
                    <img src={sendMailIcon} alt="Send Mail" className="nav-icon" />
                    {isOpen && <span>Send Mail</span>}
                </Link>
            </nav>
        </div>
    );
}

export default Sidebar;
