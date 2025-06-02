import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/api.js';
import 'swiper/css';
import 'swiper/css/navigation';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import StarRating from '../StarRating/StarRating';
import './FeaturedReviews.css';

const FeaturedReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/ratings/featured?limit=10`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured reviews');
        }
        
        const data = await response.json();
        setReviews(data.data || []);
      } catch (err) {
        console.error('Error fetching featured reviews:', err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedReviews();
  }, []);

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Don't render if no reviews
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="featured-reviews-section">
      <div className="featured-reviews-container">
        <h2 className="featured-reviews-title">What Our Customers Say</h2>
        
        <div className="reviews-carousel-container">
          <Swiper
            modules={[Autoplay]}
            slidesPerView={3}
            spaceBetween={30}
            grabCursor={true}
            className="reviews-swiper"
            loop={reviews.length > 3}
            centeredSlides={true}
            initialSlide={1}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
          >
            {reviews.map((review) => (
              <SwiperSlide key={review._id} className="review-slide">
                <div className="featured-review-card">
                  <div className="featured-review-content">
                    <div className="featured-review-rating">
                      <StarRating rating={review.rating} readOnly={true} size="sm" />
                    </div>
                    <p className="featured-review-text">"{review.review}"</p>
                    <div className="featured-review-author">
                      <span className="featured-reviewer-name">{review.userName}</span>
                    </div>
                  </div>
                  
                  {review.productId && (
                    <div className="featured-review-product">
                      <span className="featured-product-name">{review.productId.name}</span>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default FeaturedReviews;
