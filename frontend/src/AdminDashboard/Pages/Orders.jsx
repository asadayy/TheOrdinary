import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/api.js';
import './Styles/Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        // Filter orders whenever searchTerm changes
        const filtered = orders.filter(order => {
            const nameMatch = order.shippingDetails.name.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = order.status.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || statusMatch;
        });
        setFilteredOrders(filtered);
    }, [searchTerm, orders]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view orders');
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setOrders(response.data);
            setFilteredOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            if (err.response?.status === 401) {
                setError('Please log in to view orders');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to view orders');
            } else {
                setError('Failed to fetch orders. Please try again.');
            }
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to update orders');
                return;
            }

            await axios.put(
                `${API_URL}/api/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }
            );
            fetchOrders(); // Refresh orders after update
        } catch (err) {
            console.error('Error updating order status:', err);
            if (err.response?.status === 401) {
                setError('Please log in to update orders');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to update orders');
            } else {
                setError('Failed to update order status. Please try again.');
            }
        }
    };

    if (loading) return <div className="admin-loading">Loading orders...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-orders">
            <h2>Order Management</h2>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by customer name or order status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="orders-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order Date</th>
                            <th>Customer</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order._id}>
                                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>{order.shippingDetails.name}</td>
                                <td>${order.totalAmount.toFixed(2)}</td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                        className={`status-select status-${order.status}`}
                                    >
                                        <option value="placed">Placed</option>
                                        <option value="dispatched">Dispatched</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        className="view-details-btn"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div className="no-results">No orders found matching your search.</div>
                )}
            </div>

            {selectedOrder && (
                <div className="order-details-modal">
                    <div className="modal-content">
                        <button
                            className="close-modal-btn"
                            onClick={() => setSelectedOrder(null)}
                        >
                            ×
                        </button>
                        <div className="modal-scroll-content">
                            <h3>Order Details</h3>
                            <div className="order-info">
                                <h4>Shipping Information</h4>
                                <p><strong>Name:</strong> {selectedOrder.shippingDetails.name}</p>
                                <p><strong>Email:</strong> {selectedOrder.shippingDetails.email}</p>
                                <p><strong>Address:</strong> {selectedOrder.shippingDetails.address}</p>
                                <p><strong>City:</strong> {selectedOrder.shippingDetails.city}</p>
                                <p><strong>Postal Code:</strong> {selectedOrder.shippingDetails.postalCode}</p>
                                <p><strong>Phone:</strong> {selectedOrder.shippingDetails.phone}</p>
                            </div>
                            <div className="order-products">
                                <h4>Products</h4>
                                <table className="products-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.products.map((product, index) => (
                                            <tr key={index}>
                                                <td>{product.name}</td>
                                                <td>{product.quantity}</td>
                                                <td>${product.price.toFixed(2)}</td>
                                                <td>${(product.price * product.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="order-total">
                                    <strong>Total Amount:</strong> ${selectedOrder.totalAmount.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;