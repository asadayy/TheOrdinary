import axios from "axios"; // Import axios
import API_URL from "../config/api.js";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import StarRating from "../Components/StarRating/StarRating";
import RatingForm from "../Components/RatingForm/RatingForm";
import ReviewList from "../Components/ReviewList/ReviewList";
import "./Styles/ProductDetail.css"; // Create a separate CSS file for styling

// Define fallback URL for image not found cases
const IMAGE_NOT_FOUND_URL = "/Image Not Found.png";

// Function to get the correct image URL
const getImageUrl = (imageUrl) => {
  try {
    if (!imageUrl) {
      return IMAGE_NOT_FOUND_URL;
    }

    // If the image URL is already a full URL, return it as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Use backend static route for consistent image handling
    return `${API_URL}/static/${imageUrl}`;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return IMAGE_NOT_FOUND_URL;
  }
};

// Map route slugs to real DB category names (ensure this matches your backend's category names)
const categoryMap = {
    skincare: "Skincare",
    hair_body: "Hair & Body",
    sets_collections: "Sets & Collections",
};

const ProductDetail = () => {
  const { category, productName } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const { addToCart } = useCart();

  // Fetch product reviews
  const fetchProductReviews = async (productId) => {
    if (!productId) return;
    
    try {
      setReviewsLoading(true);
      const response = await axios.get(`${API_URL}/api/ratings/reviews/${productId}`);
      setReviews(response.data.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Handle successful rating submission
  const handleRatingSubmitted = async () => {
    // Refresh product data to get updated ratings
    if (product && product._id) {
      try {
        const { data } = await axios.get(`${API_URL}/api/products/${product._id}`);
        setProduct(data);
        // Also refresh reviews
        fetchProductReviews(product._id);
      } catch (error) {
        console.error('Error refreshing product data:', error);
      }
    }
  };

  useEffect(() => {
      const fetchProductDetail = async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors
            
            // Check if we have a product ID in the URL
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            
            if (productId) {
                // If we have an ID, fetch the product directly
                const response = await axios.get(`${API_URL}/api/products/${productId}`);
                setProduct(response.data);
                return;
            }
            
            // Otherwise, use the category + name approach
            const dbCategory = categoryMap[category];
            if (!dbCategory) {
                setError('Invalid category provided.');
                setLoading(false);
                return;
            }

            // First, safely decode the URL-encoded product name
            // First decode the URI component to handle %-encoded characters
            // Then replace any remaining + with spaces (though decodeURIComponent should handle this)
            let decodedProductName;
            try {
                // First pass: decode the URI component
                decodedProductName = decodeURIComponent(productName);
                
                // Second pass: handle any double-encoded characters
                if (/%[0-9A-Fa-f]{2}/.test(decodedProductName)) {
                    decodedProductName = decodeURIComponent(decodedProductName);
                }
                
                // Replace any remaining + with spaces (though they should be decoded by now)
                decodedProductName = decodedProductName.replace(/\+/g, ' ');
                
                // Log the decoded name for debugging
                console.log('Original product name:', productName);
                console.log('Decoded product name:', decodedProductName);
            } catch (e) {
                console.error('Error decoding product name:', e);
                // Fallback to the original name if decoding fails
                decodedProductName = productName.replace(/\+/g, ' ');
            }
            
            try {
                // Fetch all products in the category
                const response = await axios.get(
                    `${API_URL}/api/products?category=${encodeURIComponent(dbCategory)}`
                );
                
                console.log('Fetched products:', response.data.products.length);

                // First, try exact match with the decoded name (case insensitive)
                let foundProduct = response.data.products.find(p => 
                    p.name.toLowerCase() === decodedProductName.toLowerCase()
                );

                // If not found, try a more flexible comparison that handles special characters
                if (!foundProduct) {
                    console.log('Exact match not found, trying flexible match...');
                    
                    // Create a regex pattern that matches the product name with any special characters
                    const searchPattern = decodedProductName
                        .toLowerCase()
                        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
                        .replace(/\s+/g, '\\s*'); // Allow any number of spaces between words
                    
                    const regex = new RegExp(`^${searchPattern}$`, 'i');
                    
                    foundProduct = response.data.products.find(p => {
                        const match = regex.test(p.name);
                        if (match) {
                            console.log('Found match:', p.name);
                        }
                        return match;
                    });
                }


                if (!foundProduct) {
                    console.log('Still not found, trying character-by-character comparison...');
                    // Last resort: compare character by character, ignoring special chars
                    foundProduct = response.data.products.find(p => {
                        const cleanProductName = p.name
                            .toLowerCase()
                            .replace(/[^\w\s]/g, '') // Remove all non-word chars except spaces
                            .replace(/\s+/g, ' ')    // Normalize spaces
                            .trim();
                            
                        const cleanSearchName = decodedProductName
                            .toLowerCase()
                            .replace(/[^\w\s]/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                            
                        return cleanProductName === cleanSearchName;
                    });
                }


                if (foundProduct) {
                    setProduct(foundProduct);
                    // Fetch reviews for this product
                    fetchProductReviews(foundProduct._id);
                } else {
                    setError('Product not found.');
                }
            } catch (err) {
                console.error("Error in product search:", err);
                setError('Failed to load product details. Please try again later.');
            }

        } catch (err) {
            console.error("Failed to fetch product detail:", err);
            setError('Failed to load product details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    fetchProductDetail();

  }, [category, productName]); // Depend on category and productName

  if (loading) {
    return <div className="loading-message">Loading product details...</div>;
  }

  if (error) {
      return <div className="error-message">Error: {error}</div>;
  }

  if (!product) {
      return <div className="error-message">Product details not available.</div>;
  }



  return (
    <div className="page-container">
      {/* Product Detail Section */}
      <div className="product-detail">
        <img
          src={getImageUrl(product.image_url)}
          alt={product.name}
          className="product-image"
          data-original-path={product.image_url}
          onError={(e) => {
            console.log('Image failed to load:', e.target.src);
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = IMAGE_NOT_FOUND_URL;
          }}
        />
        <div className="product-details">
          <h2>{product.name}</h2>
          
          <div className="product-rating-display">
            <StarRating rating={product.averageRating || 0} readOnly={true} size="md" />
            <span className="rating-count">({product.ratingCount || 0} {product.ratingCount === 1 ? 'review' : 'reviews'})</span>
          </div>
          
          <p>{product.description}</p>
          <h3>Price: ${product.price}</h3>

          <h4>Targets:</h4>
          <ul className="product-list">
            {/* Use optional chaining and check if targets is an array */}
            {Array.isArray(product.targets) && product.targets.map((target, index) => (
              <li key={index}>{target}</li>
            ))}
             {/* Fallback if targets is not an array or is empty */}
              {(!Array.isArray(product.targets) || product.targets.length === 0) && <li>No targets specified.</li>}
          </ul>

          <h4>Key Ingredients:</h4>
          <ul className="product-list">
            {/* Use optional chaining and check if key_ingredients is an array */}
            {Array.isArray(product.key_ingredients) && product.key_ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
             {/* Fallback if key_ingredients is not an array or is empty */}
              {(!Array.isArray(product.key_ingredients) || product.key_ingredients.length === 0) && <li>No key ingredients specified.</li>}
          </ul>

          <button 
            className="buy-btn"
            onClick={() => addToCart(product._id, 1)}
          >
            Add to Cart
          </button>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="reviews-container">
        <h2 className="reviews-title">Product Reviews</h2>
        
        {/* Rating Form */}
        <RatingForm 
          productId={product._id} 
          onRatingSubmitted={handleRatingSubmitted} 
        />
        
        {/* Reviews List */}
        <div className="reviews-list-container">
          <h3 className="reviews-subtitle">Customer Reviews</h3>
          <ReviewList reviews={reviews} loading={reviewsLoading} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
