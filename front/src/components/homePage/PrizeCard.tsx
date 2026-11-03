import React from 'react';
import './PrizeCard.scss';

interface PrizeCardProps {
  name: string;
  image: string;
  description?: string;
  value?: string;
}

export function PrizeCard({ name, image, description, value }: PrizeCardProps) {
  
  return (
    <div className={`prize-card`}>
      <div className="prize-image-container">
        <img 
          src={image} 
          alt={`Lot: ${name}`}
          className="prize-image"
        />
      </div>
      <div className="prize-content">
        <h3 className="prize-name">{name}</h3>
        {description && (
          <p className="prize-description">{description}</p>
        )}
      </div>
    </div>
  );
}