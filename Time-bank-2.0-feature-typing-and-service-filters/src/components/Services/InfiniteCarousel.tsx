import React from 'react';

interface CarouselProps {
  images: string[];
  interval?: number;
}

export const InfiniteCarousel: React.FC<CarouselProps> = ({ images, interval = 3000 }) => {
  const [index, setIndex] = React.useState(0);
  const [animate, setAnimate] = React.useState(true);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const length = images.length;

  React.useEffect(() => {
    if (length <= 1) return;
    timer.current = setTimeout(() => {
      setIndex((i) => i + 1);
    }, interval);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [index, length, interval]);

  if (!length) return null;

  // Build slides array with a clone of the first slide at the end for seamless loop
  const slides = length > 1 ? [...images, images[0]] : images;
  const atClone = index === length; // when we are showing the cloned first slide

  const handleTransitionEnd = () => {
    if (atClone) {
      // Jump back to the real first slide without animation
      setAnimate(false);
      setIndex(0);
      // next tick re-enable animation
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }
  };

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-gray-100">
      <div
        className={`flex h-full w-full ${animate ? 'transition-transform duration-700' : ''}`}
        style={{ transform: `translateX(-${(index % slides.length) * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((img, i) => (
          <div key={img + i} className="w-full h-full flex-shrink-0">
            <img src={img} alt={`Service ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <span key={i} className={`block w-2 h-2 rounded-full ${i === (index % length) ? 'bg-emerald-500' : 'bg-white/70 border border-gray-300'}`}></span>
          ))}
        </div>
      )}
    </div>
  );
};
