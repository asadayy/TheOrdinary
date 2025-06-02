import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/api.js';
import './Styles/Dashboard.css';

function Dashboard() {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalUsers: 0,
        pendingOrders: 0,
        deliveredOrders: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch orders for sales and pending orders
                const ordersRes = await fetch(`${API_URL}/api/orders`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const orders = await ordersRes.json();

                // Fetch users count
                const usersRes = await fetch(`${API_URL}/api/users`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const users = await usersRes.json();

                // Calculate total sales
                const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

                // Count pending orders
                const pendingOrders = orders.filter(order => order.status === 'placed').length;

                // Count delivered orders
                const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

                // Get recent activity (last 5 orders)
                const recentOrders = orders
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map(order => ({
                        type: 'order',
                        message: `Order #${order._id.slice(-6)} ${order.status}`,
                        date: new Date(order.createdAt)
                    }));

                setStats({
                    totalSales: totalSales.toFixed(2),
                    totalUsers: users.length,
                    pendingOrders,
                    deliveredOrders
                });

                setRecentActivity(recentOrders);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="loading">Loading dashboard data...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p>Overview of key admin statistics and metrics.</p>
            </header>

            {/* Dashboard Stats */}
            <div className="dashboard-cards">
                <div className="dashboard-card">
                    <h3>Total Sales</h3>
                    <p>${stats.totalSales}</p>
                </div>

                <div className="dashboard-card">
                    <h3>Total Users</h3>
                    <p>{stats.totalUsers}</p>
                </div>

                <div className="dashboard-card">
                    <h3>Pending Orders</h3>
                    <p>{stats.pendingOrders}</p>
                </div>

                <div className="dashboard-card">
                    <h3>Delivered Orders</h3>
                    <p>{stats.deliveredOrders}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-summary">
                <div className="summary-item">
                    <h4>Recent Activity</h4>
                    <ul>
                        {recentActivity.map((activity, index) => (
                            <li key={index}>
                                {activity.message}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;