"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="h-8 w-8 border-4 border-gray-300 border-t-violet-600 border-r-violet-600 rounded-full animate-spin"></div>
    </div>
  );
}
