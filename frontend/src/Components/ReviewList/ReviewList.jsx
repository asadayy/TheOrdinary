import React from 'react';
import StarRating from '../StarRating/StarRating';
import './ReviewList.css';

const ReviewList = ({ reviews, loading }) => {
  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return <div className="no-reviews">No reviews yet. Be the first to review this product!</div>;
  }

  return (
    <div className="reviews-list">
      {reviews.map((review) => (
        <div key={review._id} className="review-item">
          <div className="review-header">
            <div className="reviewer-info">
              <span className="reviewer-name">{review.userName}</span>
              <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="review-rating">
              <StarRating rating={review.rating} readOnly={true} size="sm" />
            </div>
          </div>
          {review.review && <p className="review-text">{review.review}</p>}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
