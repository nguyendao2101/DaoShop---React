import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, placeholder = "Tìm kiếm sản phẩm...", defaultValue = "" }) => {
    const [searchTerm, setSearchTerm] = useState(defaultValue);

    // Update when defaultValue changes
    useEffect(() => {
        setSearchTerm(defaultValue);
    }, [defaultValue]);

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm.trim());
    };

    // Handle clear
    const handleClear = () => {
        setSearchTerm('');
        onSearch('');
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch(searchTerm.trim());
        }
    };

    return (
        <div className="relative w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-24 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
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
                        type="button"
                        onClick={handleClear}
                        className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Search Button */}
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-black px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </form>

            {/* Search hint */}
            {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-400 px-2">
                    Nhấn Enter hoặc click nút tìm để tìm kiếm
                </div>
            )}
        </div>
    );
};

export default SearchBar;