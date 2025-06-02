import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ rating, onRatingChange, readOnly = false, size = 'md' }) => {
  const [hover, setHover] = useState(null);

  const handleClick = (ratingValue) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(ratingValue);
    }
  };

  return (
    <div className={`star-rating ${size} ${readOnly ? 'readonly' : ''}`}>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <span
            key={ratingValue}
            className={`star ${(hover || rating) >= ratingValue ? 'active' : ''}`}
            onClick={() => handleClick(ratingValue)}
            onMouseEnter={!readOnly ? () => setHover(ratingValue) : null}
            onMouseLeave={!readOnly ? () => setHover(null) : null}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
