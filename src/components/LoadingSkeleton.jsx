import React from 'react';

// Default / Base Skeleton
export function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-stone-200 h-24 rounded-xl w-full" />
      ))}
    </div>
  );
}

// Product List Skeleton
export function ProductListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-stone-200 h-48 rounded-xl w-full" />
      ))}
    </div>
  );
}

// Simple Spinner
export function Spinner() {
  return (
    <div className="flex justify-center items-center h-full w-full py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
    </div>
  );
}

export default LoadingSkeleton;