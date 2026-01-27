import React, { useState } from 'react';

const ProfileToggle = ({ currentRole, onToggle }) => {
  return (
    <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
      <div>
        <h4 className="font-bold text-gray-800">Creator Mode</h4>
        <p className="text-xs text-gray-500">Enable to sell and track your art analytics</p>
      </div>
      <button 
        onClick={onToggle}
        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${currentRole === 'creator' ? 'bg-[#FF8C00]' : 'bg-gray-300'}`}
      >
        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${currentRole === 'creator' ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};