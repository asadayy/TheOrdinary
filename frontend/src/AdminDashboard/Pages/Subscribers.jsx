import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/api.js';
import './Styles/Subscribers.css';

function Subscribers() {
    const [subscribers, setSubscribers] = useState([]);
    const [filteredSubscribers, setFilteredSubscribers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubscribers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/subscribers`);
                setSubscribers(response.data);
                setFilteredSubscribers(response.data);
                setError('');
            } catch (err) {
                console.error(err);
                setError('Failed to fetch subscribers');
                setSubscribers([]);
                setFilteredSubscribers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscribers();
    }, []);

    useEffect(() => {
        const filtered = subscribers.filter(sub =>
            sub.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSubscribers(filtered);
    }, [searchTerm, subscribers]);

    if (loading) return <div className="admin-loading">Loading subscribers...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-subscribers">
            <h2>Newsletter Subscribers</h2>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="subscribers-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Email</th>
                            <th>Subscribed At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubscribers.map((sub, index) => (
                            <tr key={sub._id}>
                                <td>{index + 1}</td>
                                <td>{sub.email}</td>
                                <td>{new Date(sub.subscribedAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredSubscribers.length === 0 && (
                    <div className="no-results">No subscribers found matching your search.</div>
                )}
            </div>
        </div>
    );
}

export default Subscribers;
