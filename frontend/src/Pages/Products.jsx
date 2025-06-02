import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import imageNotFound from '../Components/Assets/ImageNotFound.png';
import StarRating from "../Components/StarRating/StarRating";
import { useCart } from "../Context/CartContext"; // Adjust path as necessary
import "./Styles/Products.css";
import { API_URL } from "../config/api"; // Import the API URL configuration

// Map route slugs to real DB category names
const categoryMap = {
    skincare: "Skincare",
    hair_body: "Hair & Body",
    sets_collections: "Sets & Collections",
};

const Products = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 8;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);
    
    const { addToCart } = useCart();

    // Function to get the correct image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return imageNotFound;
        
        try {
            // If the image URL is already a full URL, return it as is
            if (imageUrl.startsWith('http')) {
                return imageUrl;
            }
            
            // Construct the full URL using the backend static route from the config
            const fullUrl = `${API_URL}/static/${imageUrl}`;
            
            // Log the URL for debugging
            console.log('Image URL Debug:', {
                original: imageUrl,
                final: fullUrl
            });
            
            return fullUrl;
        } catch (error) {
            console.error('Error processing image URL:', error);
            return imageNotFound;
        }
    };

    // Function to handle image loading errors
    const handleImageError = (e) => {
        console.log('Image failed to load:', {
            src: e.target.src,
            alt: e.target.alt
        });
        e.target.onerror = null; // Prevent infinite loop
        e.target.src = imageNotFound;
    };

    // Add a useEffect to log all product image URLs for debugging
    useEffect(() => {
        if (products.length > 0) {
            console.log('All product image URLs:');
            products.forEach((product, index) => {
                console.log(`Product ${index + 1}:`, {
                    name: product.name,
                    originalUrl: product.image_url,
                    processedUrl: getImageUrl(product.image_url)
                });
            });
        }
    }, [products]);

    // Add image load success handler
    const handleImageLoad = (e) => {
        console.log('Image loaded successfully:', {
            src: e.target.src,
            alt: e.target.alt
        });
    };

    // Add a separate useEffect to handle scrolling when page changes
    useEffect(() => {
        // Scroll to top with smooth animation when page changes
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [currentPage]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const dbCategory = categoryMap[category]; // Map URL slug to DB category name
                if (!dbCategory) {
                    setProducts([]);
                    setTotalProducts(0);
                    return;
                }

                const response = await axios.get(
                    `${API_URL}/api/products?category=${encodeURIComponent(dbCategory)}&page=${currentPage}&limit=${productsPerPage}`
                );

                // Check if response has products array
                if (response.data && Array.isArray(response.data.products)) {
                    setProducts(response.data.products);
                    setTotalProducts(response.data.total || 0);
                } else {
                    setProducts([]);
                    setTotalProducts(0);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to fetch products. Please try again later.');
                setProducts([]);
                setTotalProducts(0);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category, currentPage]);

    // Add a useEffect to log the first product's image URL for debugging
    useEffect(() => {
        if (products.length > 0) {
            console.log('First product image URL:', products[0].image_url);
            console.log('Processed URL:', getImageUrl(products[0].image_url));
        }
    }, [products]);

    const totalPages = Math.ceil(totalProducts / productsPerPage);

    const handleAddToCart = (productId) => {
        addToCart(productId, 1);
    };

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setShowQuickView(true);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="product-container">
            <h2 className="category-title">{categoryMap[category] || "Unknown Category"}</h2>

            {products.length === 0 ? (
                <div className="no-products-message">No products found for this category.</div>
            ) : (
                <div className="product-grid">
                    {products.map((product) => (
                        <div key={product._id} className="product-card">
                            <div className="product-image-container">
                                <img 
                                    src={getImageUrl(product.image_url)} 
                                    alt={product.name}
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                />
                            </div>

                            <div className="product-details-wrapper">
                                <div className="product-info">
                                    <Link
                                        to={`/products/${category}/${encodeURIComponent(product.name)}`}
                                        className="product-link"
                                    >
                                        <h3>{product.name}</h3>
                                    </Link>
                                    <div className="product-rating">
                                        <StarRating rating={product.averageRating || 0} readOnly={true} size="sm" />
                                        <span className="rating-count">({product.ratingCount || 0})</span>
                                    </div>
                                    <div className="product-price">${product.price}</div>
                                </div>

                                <div className="product-actions">
                                    <button
                                        className="buy-btn"
                                        onClick={() => handleAddToCart(product._id)}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        className="quick-view-btn"
                                        onClick={() => handleQuickView(product)}
                                    >
                                        Quick View
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {showQuickView && selectedProduct && (
                <div className="quick-view-modal active">
                    <div className="quick-view-content">
                        <button 
                            className="close-quick-view"
                            onClick={() => setShowQuickView(false)}
                        >
                            &times;
                        </button>
                        
                        <div className="quick-view-image-container">
                            <img
                                src={getImageUrl(selectedProduct.image_url)}
                                alt={selectedProduct.name}
                                className="quick-view-image"
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                            />
                        </div>
                        
                        <div className="quick-view-details">
                            <span className="quick-view-category">{selectedProduct.category}</span>
                            <h2 className="quick-view-title">{selectedProduct.name}</h2>
                            
                            <div className="quick-view-rating">
                                <StarRating rating={selectedProduct.averageRating || 0} readOnly={true} size="md" />
                                <span className="rating-count">({selectedProduct.ratingCount || 0} {selectedProduct.ratingCount === 1 ? 'review' : 'reviews'})</span>
                            </div>
                            
                            <p className="quick-view-price">${selectedProduct.price}</p>
                            <p className="quick-view-description">{selectedProduct.description}</p>
                            
                            <div className="quick-view-targets">
                                {selectedProduct.targets?.map(target => (
                                    <span key={target} className="target-tag">{target}</span>
                                )) || <span>No targets specified</span>}
                            </div>
                            
                            <div className="quick-view-suited-to">
                                Suited to: {selectedProduct.suited_to || 'Not specified'}
                            </div>
                            
                            <div className="quick-view-ingredients">
                                {selectedProduct.key_ingredients?.map(ingredient => (
                                    <span key={ingredient} className="ingredient-tag">{ingredient}</span>
                                )) || <span>No ingredients specified</span>}
                            </div>
                            
                            <div className="quick-view-actions">
                                <button 
                                    className="add-to-cart"
                                    onClick={() => handleAddToCart(selectedProduct._id)}
                                >
                                    Add to Cart
                                </button>
                                <Link
                                    to={`/products/${category}/${encodeURIComponent(selectedProduct.name)}`}
                                    className="view-details"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
