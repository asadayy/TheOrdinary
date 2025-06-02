import { useState } from 'react';
import './Styles/EditUserForm.css'; // Create if needed

function EditUserForm({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        isAdmin: user.isAdmin || false,
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update user');
            }

            const updatedUser = await response.json();
            onUpdate(updatedUser); // Pass updated user back to parent
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form className="edit-user-form" onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}

            <div className="form-group">
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>
                    <input
                        type="checkbox"
                        name="isAdmin"
                        checked={formData.isAdmin}
                        onChange={handleChange}
                    />
                    Admin
                </label>
            </div>

            <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            </div>
        </form>
    );
}

export default EditUserForm;
