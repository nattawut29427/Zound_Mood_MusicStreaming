"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      <p className="text-white ml-4">Loading...</p>
    </div>
  );
}
