import React from 'react';

const FilterSidebar = ({ filters, onFilterChange, products = [] }) => {
    console.log('🔥 FilterSidebar - Total products:', products.length);
    console.log('🔥 FilterSidebar - Current filters:', filters);

    // DEBUG: Check price structure in products
    if (products.length > 0) {
        console.log('🔥 Sample product price structure:', {
            firstProduct: products[0]?.nameProduct,
            sizePrice: products[0]?.sizePrice,
            price: products[0]?.price,
            priceStructure: typeof products[0]?.sizePrice
        });
    }

    // Get unique values for filter options
    const getUniqueValues = (field) => {
        const values = products.map(product => product[field]).filter(Boolean);
        return [...new Set(values)].sort();
    };

    // Get price from product - MULTIPLE FORMATS
    const getProductPrice = (product) => {
        // Try different price formats
        if (product.sizePrice) {
            // Array format: sizePrice[0].price
            if (Array.isArray(product.sizePrice) && product.sizePrice[0]?.price) {
                return product.sizePrice[0].price;
            }
            // Object format: sizePrice["0"].price or sizePrice.price
            if (typeof product.sizePrice === 'object') {
                if (product.sizePrice["0"]?.price) {
                    return product.sizePrice["0"].price;
                }
                if (product.sizePrice.price) {
                    return product.sizePrice.price;
                }
            }
        }
        // Direct price field
        if (product.price) {
            return product.price;
        }
        return 0;
    };

    // DEBUG: Check price extraction
    const samplePrices = products.slice(0, 3).map(product => ({
        name: product.nameProduct,
        extractedPrice: getProductPrice(product),
        rawSizePrice: product.sizePrice
    }));
    console.log('🔥 Sample extracted prices:', samplePrices);

    const categories = getUniqueValues('category');
    const materials = getUniqueValues('material');
    const karats = getUniqueValues('karat');
    const genders = getUniqueValues('gender');

    const priceRanges = [
        { label: 'Tất cả giá', min: 0, max: 100000000 },
        { label: 'Dưới 1 triệu', min: 0, max: 999999 },
        { label: '1 - 5 triệu', min: 1000000, max: 4999999 },
        { label: '5 - 10 triệu', min: 5000000, max: 9999999 },
        { label: '10 - 20 triệu', min: 10000000, max: 19999999 },
        { label: 'Trên 20 triệu', min: 20000000, max: 100000000 },
    ];

    const handleFilterChange = (newFilters) => {
        console.log('🔥 FilterSidebar filter change:', newFilters);
        onFilterChange(newFilters);
    };

    const handleClearAll = () => {
        console.log('🔥 FilterSidebar clear all');
        handleFilterChange({
            category: '',
            priceRange: [0, 100000000],
            material: '',
            karat: '',
            gender: '',
            sortBy: filters.sortBy // Preserve sortBy
        });
    };

    // Handle price range change with detailed logging
    const handlePriceRangeChange = (range) => {
        console.log('🔥 Price range selected:', range);
        console.log('🔥 Previous priceRange:', filters.priceRange);

        const newFilters = {
            ...filters,
            priceRange: [range.min, range.max]
        };
        console.log('🔥 New filters with price range:', newFilters);

        handleFilterChange(newFilters);
    };

    // Check which price range is currently selected
    const getCurrentPriceRange = () => {
        const [currentMin, currentMax] = filters.priceRange;
        return priceRanges.find(range =>
            range.min === currentMin && range.max === currentMax
        );
    };

    const currentPriceRange = getCurrentPriceRange();
    console.log('🔥 Current price range match:', currentPriceRange);

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

            {/* DEBUG INFO */}
            {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 border border-gray-700 p-2 rounded">
                    <div>Products: {products.length}</div>
                    <div>Price Range: [{filters.priceRange[0]}, {filters.priceRange[1]}]</div>
                    <div>Sample Prices: {samplePrices.map(p => p.extractedPrice).join(', ')}</div>
                </div>
            )}

            {/* Category Filter */}
            <div className="space-y-3">
                <h4 className="font-medium text-white">Danh mục</h4>
                <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="category"
                            value=""
                            checked={filters.category === ''}
                            onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
                            className="mr-2 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-300 text-sm">Tất cả</span>
                    </label>
                    {categories.map(category => (
                        <label key={category} className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                value={category}
                                checked={filters.category === category}
                                onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
                                className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-300 text-sm">{category}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range Filter - FIXED */}
            <div className="space-y-3">
                <h4 className="font-medium text-white">Khoảng giá</h4>
                <div className="space-y-2">
                    {priceRanges.map((range, index) => {
                        const isSelected = filters.priceRange[0] === range.min && filters.priceRange[1] === range.max;

                        return (
                            <label key={index} className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="priceRange"
                                    value={`${range.min}-${range.max}`}
                                    checked={isSelected}
                                    onChange={() => handlePriceRangeChange(range)}
                                    className="mr-2 text-primary focus:ring-primary"
                                />
                                <span className="text-gray-300 text-sm">{range.label}</span>
                                {isSelected && (
                                    <span className="ml-auto text-primary text-xs">✓</span>
                                )}
                            </label>
                        );
                    })}
                </div>

                {/* Show current range info */}
                <div className="text-xs text-gray-500 mt-2">
                    Hiện tại: {filters.priceRange[0].toLocaleString('vi-VN')}đ - {filters.priceRange[1].toLocaleString('vi-VN')}đ
                </div>
            </div>

            {/* Material Filter */}
            <div className="space-y-3">
                <h4 className="font-medium text-white">Chất liệu</h4>
                <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="material"
                            value=""
                            checked={filters.material === ''}
                            onChange={(e) => handleFilterChange({ ...filters, material: e.target.value })}
                            className="mr-2 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-300 text-sm">Tất cả</span>
                    </label>
                    {materials.map(material => (
                        <label key={material} className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="material"
                                value={material}
                                checked={filters.material === material}
                                onChange={(e) => handleFilterChange({ ...filters, material: e.target.value })}
                                className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-300 text-sm">{material}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Karat Filter */}
            {karats.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium text-white">Độ tinh khiết</h4>
                    <div className="space-y-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="karat"
                                value=""
                                checked={filters.karat === ''}
                                onChange={(e) => handleFilterChange({ ...filters, karat: e.target.value })}
                                className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-300 text-sm">Tất cả</span>
                        </label>
                        {karats.map(karat => (
                            <label key={karat} className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="karat"
                                    value={karat}
                                    checked={filters.karat === karat}
                                    onChange={(e) => handleFilterChange({ ...filters, karat: e.target.value })}
                                    className="mr-2 text-primary focus:ring-primary"
                                />
                                <span className="text-gray-300 text-sm">{karat}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Gender Filter */}
            {genders.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium text-white">Giới tính</h4>
                    <div className="space-y-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value=""
                                checked={filters.gender === ''}
                                onChange={(e) => handleFilterChange({ ...filters, gender: e.target.value })}
                                className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-300 text-sm">Tất cả</span>
                        </label>
                        {genders.map(gender => (
                            <label key={gender} className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value={gender}
                                    checked={filters.gender === gender}
                                    onChange={(e) => handleFilterChange({ ...filters, gender: e.target.value })}
                                    className="mr-2 text-primary focus:ring-primary"
                                />
                                <span className="text-gray-300 text-sm">{gender}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterSidebar;