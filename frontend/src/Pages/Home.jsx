import axios from "axios";
import API_URL from "../config/api.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import FeaturedReviews from "../Components/FeaturedReviews/FeaturedReviews";
import "./Styles/Home.css";

import slider1 from "../Components/Assets/slider1.jpg";
import slider2 from "../Components/Assets/slider2.jpg";
import slider3 from "../Components/Assets/slider3.jpg";

import bodyHairCategory from "../Components/Assets/bodyHair.png";
import setsCategory from "../Components/Assets/sets.png";
import skincareCategory from "../Components/Assets/skincare.png";

// Define fallback URL for image not found cases
const IMAGE_NOT_FOUND_URL = "../Components/Assets/ImageNotFound.png";

const Home = () => {
  const [menu, setMenu] = useState(null);
  const navigate = useNavigate();
  const images = [slider1, slider2, slider3];

  const [featuredProducts, setFeaturedProducts] = useState({
    skincare: null,
    hair_body: null,
    sets_collections: null,
  });

  // Function to get the correct image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      console.log('No image URL provided, using fallback');
      return IMAGE_NOT_FOUND_URL;
    }
    
    try {
      // Log the original URL for debugging
      console.log('Processing image URL:', imageUrl);
      
      // If the image URL is already a full URL, return it as is
      if (imageUrl.startsWith('http')) {
        console.log('Using direct URL:', imageUrl);
        return imageUrl;
      }
      
      // Try direct backend access for product images
      // This should work for all product images regardless of path format
      const backendUrl = `http://localhost:5000/static/${imageUrl}`;
      console.log('Using backend URL:', backendUrl);
      return backendUrl;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return IMAGE_NOT_FOUND_URL;
    }
  };

  // Function to handle image loading errors
  const handleImageError = (e) => {
    console.log('Image failed to load:', {
      src: e.target.src,
      alt: e.target.alt
    });
    
    // If the current src is already our fallback URL or contains "ImageNotFound", don't try again
    if (e.target.src.includes('ImageNotFound') || e.target.src.includes('Image%20Not%20Found')) {
      return; // Already using fallback, don't create an infinite loop
    }
    
    // Try a different source pattern if the current one failed
    if (e.target.src.includes('/static/')) {
      // If backend static route failed, try the raw path
      const imagePath = e.target.getAttribute('data-original-path');
      if (imagePath) {
        console.log('Trying direct path as last resort:', imagePath);
        e.target.src = `/${imagePath}`;
        return;
      }
    }
    
    // Last resort - use the fallback image
    console.log('Using static fallback image');
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = IMAGE_NOT_FOUND_URL;
  };

  // Add image load success handler
  const handleImageLoad = (e) => {
    console.log('Image loaded successfully:', {
      src: e.target.src,
      alt: e.target.alt
    });
  };

  const fetchFeaturedProduct = async () => {
    try {
      // Fetch one product from each category with proper URL encoding
      const [skincareRes, hairBodyRes, setsRes] = await Promise.all([
        axios.get(`${API_URL}/api/products?category=Skincare&limit=1`),
        axios.get(`${API_URL}/api/products?category=${encodeURIComponent('Hair & Body')}&limit=1`),
        axios.get(`${API_URL}/api/products?category=${encodeURIComponent('Sets & Collections')}&limit=1`)
      ]);

      // Log the responses for debugging
      console.log('API Responses:', {
        skincare: skincareRes.data,
        hairBody: hairBodyRes.data,
        sets: setsRes.data
      });

      // Check if we received valid products and set them in state
      const featuredData = {
        skincare: skincareRes.data.products?.[0] || null,
        hair_body: hairBodyRes.data.products?.[0] || null,
        sets_collections: setsRes.data.products?.[0] || null
      };
      
      console.log('Featured products data:', featuredData);
      setFeaturedProducts(featuredData);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      setFeaturedProducts({
        skincare: null,
        hair_body: null,
        sets_collections: null
      });
    }
  };

  useEffect(() => {
    fetchFeaturedProduct();
    
    // Add event listener to log image loading issues
    const logImageLoadingIssues = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.complete && img.naturalWidth === 0) {
          console.log('Found broken image:', img.src);
        }
      });
    };
    
    // Run after a delay to allow images to load
    setTimeout(logImageLoadingIssues, 3000);
  }, []);

  // Add a useEffect to log all product image URLs for debugging
  useEffect(() => {
    if (featuredProducts.skincare || featuredProducts.hair_body || featuredProducts.sets_collections) {
      console.log('Featured product image URLs:');
      if (featuredProducts.skincare) {
        console.log('Skincare:', {
          name: featuredProducts.skincare.name,
          originalUrl: featuredProducts.skincare.image_url,
          processedUrl: getImageUrl(featuredProducts.skincare.image_url)
        });
      }
      if (featuredProducts.hair_body) {
        console.log('Hair & Body:', {
          name: featuredProducts.hair_body.name,
          originalUrl: featuredProducts.hair_body.image_url,
          processedUrl: getImageUrl(featuredProducts.hair_body.image_url)
        });
      }
      if (featuredProducts.sets_collections) {
        console.log('Sets & Collections:', {
          name: featuredProducts.sets_collections.name,
          originalUrl: featuredProducts.sets_collections.image_url,
          processedUrl: getImageUrl(featuredProducts.sets_collections.image_url)
        });
      }
    }
  }, [featuredProducts]);

  return (
    <div className="home">
      {/* Image Slider */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className="hero-slider"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img src={img} alt={`Slide ${index + 1}`} className="slider-image" />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Categories Section */}
      <div className="category-section">
        <h2>Explore Our Categories</h2>
        <div className="category-list">
          <div
            className={`category-item ${menu === "skincare" ? "active" : ""}`}
            onClick={() => {
              setMenu("skincare");
              navigate("/skincare");
            }}
          >
            <img src={skincareCategory} alt="Skincare" className="category-image" />
            <p>Skincare {menu === "skincare" ? <span>✔</span> : null}</p>
          </div>

          <div
            className={`category-item ${menu === "hair_body" ? "active" : ""}`}
            onClick={() => {
              setMenu("hair_body");
              navigate("/hair_body");
            }}
          >
            <img src={bodyHairCategory} alt="Body & Hair" className="category-image" />
            <p>Body + Hair {menu === "hair_body" ? <span>✔</span> : null}</p>
          </div>

          <div
            className={`category-item ${menu === "sets_collections" ? "active" : ""}`}
            onClick={() => {
              setMenu("sets_collections");
              navigate("/sets_collections");
            }}
          >
            <img src={setsCategory} alt="Sets & Collections" className="category-image" />
            <p>Sets & Collections {menu === "sets_collections" ? <span>✔</span> : null}</p>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="product-container featured-products">
        <h2 className="category-title">Featured Products</h2>
        <div className="product-grid">
          {/* Loading state */}
          {(!featuredProducts.skincare && !featuredProducts.hair_body && !featuredProducts.sets_collections) && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading featured products...</p>
            </div>
          )}
          
          {/* Skincare Featured Product */}
          {featuredProducts.skincare && (
            <div className="product-card">
              <div className="product-image-container">
                <img
                  src={getImageUrl(featuredProducts.skincare.image_url)}
                  alt={featuredProducts.skincare.name}
                  data-original-path={featuredProducts.skincare.image_url}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </div>
              <div className="product-details-wrapper">
                <div className="product-info">
                  <Link
                    to={`/products/skincare/${encodeURIComponent(featuredProducts.skincare.name)}`}
                    className="product-link"
                  >
                    <h3>{featuredProducts.skincare.name}</h3>
                  </Link>
                  <div className="product-price">${featuredProducts.skincare.price.toFixed(2)}</div>
                </div>
                <div className="product-actions">
                  <Link
                    to={`/products/skincare/${encodeURIComponent(featuredProducts.skincare.name)}`}
                    className="buy-btn"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Body + Hair Featured Product */}
          {featuredProducts.hair_body && (
            <div className="product-card">
              <div className="product-image-container">
                <img
                  src={getImageUrl(featuredProducts.hair_body.image_url)}
                  alt={featuredProducts.hair_body.name}
                  data-original-path={featuredProducts.hair_body.image_url}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </div>
              <div className="product-details-wrapper">
                <div className="product-info">
                  <Link
                    to={`/products/hair_body/${encodeURIComponent(featuredProducts.hair_body.name)}`}
                    className="product-link"
                  >
                    <h3>{featuredProducts.hair_body.name}</h3>
                  </Link>
                  <div className="product-price">${featuredProducts.hair_body.price.toFixed(2)}</div>
                </div>
                <div className="product-actions">
                  <Link
                    to={`/products/hair_body/${encodeURIComponent(featuredProducts.hair_body.name)}`}
                    className="buy-btn"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Sets & Collections Featured Product */}
          {featuredProducts.sets_collections && (
            <div className="product-card">
              <div className="product-image-container">
                <img
                  src={getImageUrl(featuredProducts.sets_collections.image_url)}
                  alt={featuredProducts.sets_collections.name}
                  data-original-path={featuredProducts.sets_collections.image_url}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </div>
              <div className="product-details-wrapper">
                <div className="product-info">
                  <Link
                    to={`/products/sets_collections/${encodeURIComponent(featuredProducts.sets_collections.name)}`}
                    className="product-link"
                  >
                    <h3>{featuredProducts.sets_collections.name}</h3>
                  </Link>
                  <div className="product-price">
                    ${featuredProducts.sets_collections.price.toFixed(2)}
                  </div>
                </div>
                <div className="product-actions">
                  <Link
                    to={`/products/sets_collections/${encodeURIComponent(
                      featuredProducts.sets_collections.name
                    )}`}
                    className="buy-btn"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Skincare Featured Product */}
          {featuredProducts.skincare && (
            <div className="product-card">
              <div className="product-image-container">
                <img
                  src={getImageUrl(featuredProducts.skincare.image_url)}
                  alt={featuredProducts.skincare.name}
                  data-original-path={featuredProducts.skincare.image_url}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </div>
              <div className="product-details-wrapper">
                <div className="product-info">
                  <Link
                    to={`/products/skincare/${encodeURIComponent(featuredProducts.skincare.name)}`}
                    className="product-link"
                  >
                    <h3>{featuredProducts.skincare.name}</h3>
                  </Link>
                  <div className="product-price">${featuredProducts.skincare.price.toFixed(2)}</div>
                </div>
                <div className="product-actions">
                  <Link
                    to={`/products/skincare/${encodeURIComponent(featuredProducts.skincare.name)}`}
                    className="buy-btn"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Testimonials Section - Dynamic Reviews */}
      <FeaturedReviews />
    </div>
  );
};

export default Home;
