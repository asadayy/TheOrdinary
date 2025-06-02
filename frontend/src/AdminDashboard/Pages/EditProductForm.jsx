import { useState } from 'react';
import './Styles/EditProductForm.css';

function EditProductForm({ product, onClose, onUpdate }) {
    const [formData, setFormData] = useState({ ...product });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Not authorized');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/products/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to update');
            }

            const updatedProduct = await response.json();
            onUpdate(updatedProduct);
        } catch (err) {
            setError('Error updating product: ' + err.message);
        }
    };

    return (
        <form className="edit-product-form" onSubmit={handleSubmit}>
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
                <label>Category:</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select a category</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Hair & Body">Hair & Body</option>
                    <option value="Sets & Collections">Sets & Collections</option>
                </select>
            </div>

            <div className="form-group">
                <label>Price:</label>
                <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                />
            </div>

            <div className="form-group">
                <label>Description:</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Targets (comma-separated):</label>
                <input
                    type="text"
                    name="targets"
                    value={formData.targets}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Suited To:</label>
                <select
                    name="suitedTo"
                    value={formData.suitedTo}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select skin type</option>
                    <option value="All Skin Types">All Skin Types</option>
                    <option value="Normal">Normal</option>
                    <option value="Dry">Dry</option>
                    <option value="Oily">Oily</option>
                    <option value="Combination">Combination</option>
                </select>
            </div>

            <div className="form-group">
                <label>Key Ingredients (comma-separated):</label>
                <input
                    type="text"
                    name="keyIngredients"
                    value={formData.keyIngredients}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            </div>
        </form>
    );
}

export default EditProductForm;
