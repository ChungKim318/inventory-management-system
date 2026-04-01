import { Star } from 'lucide-react';
import React from 'react';

type RatingProps = {
  rating: number;
};

const Rating = ({ rating }: RatingProps) => {
  return [1, 2, 3, 4, 5].map((index) => (
    <Star
      key={index.toString()}
      color={index <= rating ? '#fbbf24' : '#E4E5E9'}
      className='w-4 h-4'
    />
  ));
};

export default Rating;
