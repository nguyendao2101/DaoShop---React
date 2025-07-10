// src/components/layout/FilterSidebar.jsx
import React from 'react';

const FilterSidebar = ({ filters, onFilterChange, products = [] }) => {
    // Get unique values for filter options
    const getUniqueValues = (field) => {
        const values = products.map(product => product[field]).filter(Boolean);
        return [...new Set(values)].sort();
    };

    const categories = getUniqueValues('category');
    const materials = getUniqueValues('material');
    const karats = getUniqueValues('karat');
    const genders = getUniqueValues('gender');

    const priceRanges = [
        { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
        { label: '1 - 5 triệu', min: 1000000, max: 5000000 },
        { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
        { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
        { label: 'Trên 20 triệu', min: 20000000, max: 100000000 },
    ];

    const handleClearAll = () => {
        onFilterChange({
            category: '',
            priceRange: [0, 100000000],
            material: '',
            karat: '',
            gender: ''
        });
    };

    return (
        <div className="w-64 bg-gray-900 rounded-lg p-6 space-y-6 h-fit sticky top-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Bộ lọc</h3>
                <button
                    onClick={handleClearAll}
                    className="text-primary hover:underline text-sm"
                >
                    Xóa tất cả
                </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
                <h4 className="font-medium text-white">Danh mục</h4>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="category"
                            value=""
                            checked={filters.category === ''}
                            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                            className="mr-2 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-300 text-sm">Tất cả</span>
                    </label>
                    {categories.map(category => (
                        <label key={category} className="flex items-center">
                            <input
                                type="radio"
                                name="category"
                                value={category}
                                checked={filters.category === category}
                                onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                                className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-300 text-sm">{category}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
                <h4 className="font-medium text-white">Khoảng giá</h4>
                <div className="space-y-2">
                    {priceRanges.map((range, index) => (
                        <label key={index} className="flex items-center">
                            <input
                                type="radio"
                                name="priceRange"
                                value={`${range.min}-${range.max}`}
                                checked={filters.priceRange[0] === range.min && filters.priceRange[1] === range.max}
                                onChange={() => onFilterChange({ ...filters, priceRange: [range.min, range.max] })}
                                className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-300 text-sm">{range.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Material Filter */}
            <div className="space-y-3">
                <h4 className="font-medium text-white">Chất liệu</h4>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="material"
                            value=""
                            checked={filters.material === ''}
                            onChange={(e) => onFilterChange({ ...filters, material: e.target.value })}
                            className="mr-2 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-300 text-sm">Tất cả</span>
                    </label>
                    {materials.map(material => (
                        <label key={material} className="flex items-center">
                            <input
                                type="radio"
                                name="material"
                                value={material}
                                checked={filters.material === material}
                                onChange={(e) => onFilterChange({ ...filters, material: e.target.value })}
                                className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-300 text-sm">{material}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Karat Filter */}
            <div className="space-y-3">
                <h4 className="font-medium text-white">Độ tinh khiết</h4>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="karat"
                            value=""
                            checked={filters.karat === ''}
                            onChange={(e) => onFilterChange({ ...filters, karat: e.target.value })}
                            className="mr-2 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-300 text-sm">Tất cả</span>
                    </label>
                    {karats.map(karat => (
                        <label key={karat} className="flex items-center">
                            <input
                                type="radio"
                                name="karat"
                                value={karat}
                                checked={filters.karat === karat}
                                onChange={(e) => onFilterChange({ ...filters, karat: e.target.value })}
                                className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-300 text-sm">{karat}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Gender Filter */}
            <div className="space-y-3">
                <h4 className="font-medium text-white">Giới tính</h4>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="gender"
                            value=""
                            checked={filters.gender === ''}
                            onChange={(e) => onFilterChange({ ...filters, gender: e.target.value })}
                            className="mr-2 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-300 text-sm">Tất cả</span>
                    </label>
                    {genders.map(gender => (
                        <label key={gender} className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value={gender}
                                checked={filters.gender === gender}
                                onChange={(e) => onFilterChange({ ...filters, gender: e.target.value })}
                                className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-300 text-sm">{gender}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;