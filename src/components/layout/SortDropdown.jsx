import React, { useState, useRef, useEffect } from 'react';

const SortDropdown = ({ sortBy, onSortChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    console.log('🔥 SortDropdown current sortBy:', sortBy);

    const sortOptions = [
        { value: 'price_asc', label: 'Giá thấp đến cao' },
        { value: 'price_desc', label: 'Giá cao đến thấp' },
        { value: 'rating', label: 'Đánh giá cao nhất' },
    ];

    const currentOption = sortOptions.find(option => option.value === sortBy) || sortOptions[0];

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔥 SortDropdown toggle, isOpen:', !isOpen);
        setIsOpen(!isOpen);
    };

    const handleSelect = (value) => {
        console.log('🔥 SortDropdown selected:', value);
        onSortChange(value);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="flex items-center justify-between w-48 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white hover:border-primary transition-colors"
                type="button"
            >
                <span className="text-sm">{currentOption.label}</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu - FIX Z-INDEX */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg ${sortBy === option.value
                                ? 'text-primary bg-gray-800 font-medium'
                                : 'text-white'
                                }`}
                            type="button"
                        >
                            <div className="flex items-center justify-between">
                                <span>{option.label}</span>
                                {sortBy === option.value && (
                                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-full right-0 mt-12 text-xs text-gray-500 bg-gray-800 p-2 rounded whitespace-nowrap z-40">
                    Current: {sortBy} | Open: {isOpen ? 'Yes' : 'No'}
                </div>
            )}
        </div>
    );
};

export default SortDropdown;