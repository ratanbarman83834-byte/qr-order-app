import React from 'react';

// Default export: Skeleton loading effect
export function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-stone-200 h-24 rounded-xl w-full" />
      ))}
    </div>
  );
}

// Named export: Simple Spinner for layouts
export function Spinner() {
  return (
    <div className="flex justify-center items-center h-full w-full py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
    </div>
  );
}

export default LoadingSkeleton;