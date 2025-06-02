import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./AdminLayout.css"; // Import CSS for styling
import Sidebar from "./Component/Sidebar/SIdebar";

function AdminLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`admin-layout ${isCollapsed ? "collapsed" : "expanded"}`}>
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            
            {/* Main content area adjusts dynamically */}
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminLayout;
