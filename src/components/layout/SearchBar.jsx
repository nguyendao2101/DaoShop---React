// src/components/layout/SearchBar.jsx
import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, placeholder = "Tìm kiếm sản phẩm..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Call search when debounced term changes
    useEffect(() => {
        onSearch(debouncedTerm);
    }, [debouncedTerm, onSearch]);

    const handleClear = () => {
        setSearchTerm('');
        setDebouncedTerm('');
    };

    return (
        <div className="relative w-full max-w-2xl">
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />

                {/* Search Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Clear Button */}
                {searchTerm && (
                    <button
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Search suggestions could go here */}
            {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-400 px-2">
                    {debouncedTerm !== searchTerm ? 'Đang tìm kiếm...' : `Tìm kiếm: "${debouncedTerm}"`}
                </div>
            )}
        </div>
    );
};

export default SearchBar;