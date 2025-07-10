// src/components/layout/SortDropdown.jsx
import React, { useState } from 'react';

const SortDropdown = ({ sortBy, onSortChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const sortOptions = [
        { value: 'newest', label: 'Mới nhất' },
        { value: 'bestseller', label: 'Bán chạy nhất' },
        { value: 'price_asc', label: 'Giá thấp đến cao' },
        { value: 'price_desc', label: 'Giá cao đến thấp' },
        { value: 'rating', label: 'Đánh giá cao nhất' },
    ];

    const currentOption = sortOptions.find(option => option.value === sortBy);

    const handleSelect = (value) => {
        onSortChange(value);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-48 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white hover:border-primary transition-colors"
            >
                <span className="text-sm">{currentOption?.label || 'Sắp xếp'}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-800 transition-colors ${sortBy === option.value ? 'text-primary bg-gray-800' : 'text-white'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortDropdown;