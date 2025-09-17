"use client";

interface LoadingOverlayProps {
  show: boolean;
}

const LoadingOverlay = ({ show }: LoadingOverlayProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingOverlay;
