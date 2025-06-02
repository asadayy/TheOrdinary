import React from "react";
import { Link } from "react-router-dom";
import "./Styles/ProductDetailModal.css";

// Define fallback URL for image not found cases
const IMAGE_NOT_FOUND_URL = "/Image Not Found.png";

// Function to get the correct image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return IMAGE_NOT_FOUND_URL;
  }
  
  try {
    // If the image URL is already a full URL, return it as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Use backend static route for consistent image handling
    return `http://localhost:5000/static/${imageUrl}`;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return IMAGE_NOT_FOUND_URL;
  }
};

const slugMap = {
    "Skincare": "skincare",
    "Hair & Body": "hair_body",
    "Sets & Collections": "sets_collections",
    };

    export default function ProductDetailModal({ product, onClose, onAddToCart }) {
    if (!product) return null;

    const categorySlug = slugMap[product.category];

    return (
        <div className="modal-overlay">
        <div className="modal-content">
            <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close Modal"
            >
            ✕
            </button>

            <div className="modal-product-detail">
            <div className="modal-image-container">
                <img
                src={getImageUrl(product.image_url)}
                alt={product.name}
                className="modal-product-image"
                data-original-path={product.image_url}
                onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = IMAGE_NOT_FOUND_URL;
                }}
                />
            </div>

            <div className="modal-product-details">
                <h2 className="product-title">{product.name}</h2>
                <p className="product-description">{product.description}</p>
                <h3 className="product-price">Price: ${product.price}</h3>

                {product.targets?.length > 0 && (
                <>
                    <h4>Targets:</h4>
                    <ul className="product-list">
                    {product.targets.map((target, i) => (
                        <li key={i}>{target}</li>
                    ))}
                    </ul>
                </>
                )}

                {product.key_ingredients?.length > 0 && (
                <>
                    <h4>Key Ingredients:</h4>
                    <ul className="product-list">
                    {product.key_ingredients.map((ingredient, i) => (
                        <li key={i}>{ingredient}</li>
                    ))}
                    </ul>
                </>
                )}

                <div className="modal-actions">
                <button
                    className="modal-buy-btn"
                    onClick={() => onAddToCart(product)}
                >
                    Add to Cart
                </button>
                {categorySlug && (
                    <Link
                    to={`/products/${categorySlug}/${encodeURIComponent(product.name)}`}
                    className="modal-view-full-page-btn"
                    onClick={onClose}
                    >
                    View Full Page
                    </Link>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}
