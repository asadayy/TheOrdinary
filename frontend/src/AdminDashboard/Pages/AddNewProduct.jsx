import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Styles/AddNewProduct.css";
import { API_URL } from "../../config/api";

const AddNewProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const skinTypes = ["All Skin Types", "Normal", "Dry", "Oily", "Combination"];
  const categories = ["Skincare", "Hair & Body", "Sets & Collections"];

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    targets: "",
    suitedTo: "",
    keyIngredients: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPG, JPEG, or PNG)");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData object for file upload
      const productFormData = new FormData();
      productFormData.append("name", formData.name);
      productFormData.append("category", formData.category);
      productFormData.append("price", formData.price);
      productFormData.append("description", formData.description);
      productFormData.append("targets", formData.targets);
      productFormData.append("suitedTo", formData.suitedTo);
      productFormData.append("keyIngredients", formData.keyIngredients);
      productFormData.append("image", formData.image);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      await axios.post(
        `${API_URL}/api/products`,
        productFormData,
        config
      );

      setSuccess("Product added successfully!");
      setFormData({
        name: "",
        category: "",
        price: "",
        description: "",
        targets: "",
        suitedTo: "",
        keyIngredients: "",
        image: null,
      });
      setImagePreview(null);

      // Redirect to products list after 2 seconds
      setTimeout(() => {
        navigate("/admin/products");
      }, 2000);
    } catch (error) {
      setError(
        error.response?.data?.message || "Error adding product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., The Nightly Set"
          />
        </div>

        <div className="form-group">
          <label>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Price ($):</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="e.g., 25.00"
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="e.g., A nighttime regimen to hydrate, brighten and target signs of aging."
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
            placeholder="e.g., Signs of Aging, Dryness, Dullness"
          />
        </div>

        <div className="form-group">
          <label>Suited To:</label>
          <select
            name="suitedTo"
            value={formData.suitedTo}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">Select skin type</option>
            {skinTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
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
            placeholder="e.g., Hyaluronic Acid, Retinol, Vitamin C"
          />
        </div>

        <div className="form-group">
          <label>Product Image:</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept=".jpg,.jpeg,.png"
            required
            className="file-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddNewProduct; 