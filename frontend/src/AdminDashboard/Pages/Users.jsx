import React, { useEffect, useState } from 'react';
import EditUserForm from './EditUserForm';
import './Styles/Users.css';

function Users() {
    const [userData, setUserData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalType, setModalType] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token');
            try {
                setLoading(true);
                const url = new URL('http://localhost:5000/api/users');
                if (searchTerm) {
                    url.searchParams.append('search', searchTerm);
                }

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || "Failed to fetch users");
                }

                const data = await response.json();
                setUserData(data);
                setFilteredUsers(data);
                setError('');
            } catch (err) {
                setError(err.message);
                setUserData([]);
                setFilteredUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [searchTerm]);

    useEffect(() => {
        const filtered = userData.filter(user => {
            const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
            const emailMatch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || emailMatch;
        });
        setFilteredUsers(filtered);
    }, [searchTerm, userData]);

    const handleView = (user) => {
        setSelectedUser(user);
        setModalType('view');
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setModalType('edit');
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setModalType('delete');
    };

    const closeModal = () => {
        setSelectedUser(null);
        setModalType('');
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete');
            }

            setUserData(prev => prev.filter(u => u._id !== selectedUser._id));
            setFilteredUsers(prev => prev.filter(u => u._id !== selectedUser._id));
            closeModal();
        } catch (err) {
            alert('Failed to delete user: ' + err.message);
        }
    };

    const handleUserUpdate = (updatedUser) => {
        setUserData(prev =>
            prev.map(user => user._id === updatedUser._id ? updatedUser : user)
        );
        setFilteredUsers(prev =>
            prev.map(user => user._id === updatedUser._id ? updatedUser : user)
        );
        closeModal();
    };

    if (loading) return <div className="admin-loading">Loading users...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-users">
            <h2>User Management</h2>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="users-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Registration Date</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id}>
                                <td>{user._id.slice(0, 6).toUpperCase()}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <span className={`role-badge ${user.isAdmin ? 'admin' : 'customer'}`}>
                                        {user.isAdmin ? 'Admin' : 'Customer'}
                                    </span>
                                </td>
                                <td>
                                    <button className="view-details-btn" onClick={() => handleView(user)}>View</button>
                                    <button className="edit-btn" onClick={() => handleEdit(user)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(user)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="no-results">No users found matching your search.</div>
                )}
            </div>

            {selectedUser && (
                <div className="user-details-modal">
                    <div className="modal-content">
                        <button
                            className="close-modal-btn"
                            onClick={closeModal}
                        >
                            ×
                        </button>
                        <div className="modal-scroll-content">
                            {modalType === 'view' && (
                                <div className="user-details-view">
                                    <h3>User Details</h3>
                                    <div className="user-info">
                                        <p><strong>ID:</strong> {selectedUser._id}</p>
                                        <p><strong>Name:</strong> {selectedUser.name}</p>
                                        <p><strong>Email:</strong> {selectedUser.email}</p>
                                        <p><strong>Role:</strong> {selectedUser.isAdmin ? 'Admin' : 'Customer'}</p>
                                        <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}

                            {modalType === 'edit' && (
                                <EditUserForm
                                    user={selectedUser}
                                    onClose={closeModal}
                                    onUpdate={handleUserUpdate}
                                />
                            )}

                            {modalType === 'delete' && (
                                <div className="delete-confirmation">
                                    <h3>Confirm Delete</h3>
                                    <p>Are you sure you want to delete <strong>{selectedUser.name}</strong>?</p>
                                    <button className="delete-confirm-btn" onClick={confirmDelete}>Yes, Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;
