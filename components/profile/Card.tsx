import React from "react";

export default function Card() {
  return (
    <div className="relative w-full h-72 bg-gray-300 overflow-hidden group">
      {/* Image */}
      <img
        src="/1.jpg"
        alt="Profile Banner"
        className="w-full h-full object-cover"
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 hover:duration-200 group-hover:opacity-100 transition-opacity"></div>

      {/* Change BG button */}
      <button className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ">
        <span className="bg-white/80 text-black px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-white duration-300">
          Change Background
        </span>
      </button> 
    </div>
  );
}
