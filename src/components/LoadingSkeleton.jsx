import React from 'react';

export function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-stone-200 h-24 rounded-xl w-full" />
      ))}
    </div>
  );
}

export default LoadingSkeleton;