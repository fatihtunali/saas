import { Star, StarHalf } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const starSize = sizeClasses[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className={`${starSize} fill-accent text-accent`} />
        ))}
        {hasHalfStar && <StarHalf className={`${starSize} fill-accent text-accent`} />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className={`${starSize} text-muted-foreground`} />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
