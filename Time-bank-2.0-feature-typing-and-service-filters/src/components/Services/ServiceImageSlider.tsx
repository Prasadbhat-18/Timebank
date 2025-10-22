import React, { useEffect, useRef, useState } from 'react';

interface ServiceImageSliderProps {
  images: string[];
}

export const ServiceImageSlider: React.FC<ServiceImageSliderProps> = ({ images }) => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden mb-4">
      {images.map((img, i) => (
        <img
          key={img}
          src={img}
          alt="Service visual"
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          style={{ pointerEvents: i === index ? 'auto' : 'none' }}
        />
      ))}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full ${i === index ? 'bg-emerald-500' : 'bg-white border border-gray-300'}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
