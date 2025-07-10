const API_BASE_URL = 'http://localhost:8797/api';

export const productService = {
    // Lấy tất cả sản phẩm
    getAllProducts: async (searchParams = {}) => {
        try {
            const { search, category, ...otherParams } = searchParams;
            const queryParams = new URLSearchParams();

            if (search) queryParams.append('search', search);
            if (category) queryParams.append('category', category);

            Object.entries(otherParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value);
                }
            });

            const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },
    searchProducts: async (searchTerm) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    },
    getProductById: async (productId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            throw error;
        }
    },

    // Lấy sản phẩm theo category
    getProductsByCategory: async (category) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(category)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw error;
        }
    },

    // Lấy sản phẩm nổi bật (có thể filter theo criteria)
    getFeaturedProducts: async (limit = 3) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Filter và sort để lấy sản phẩm nổi bật
            const featuredProducts = data.data
                .filter(product => product.show === "true")
                .sort((a, b) => {
                    // Sort by totalSold desc, then by avgRating desc
                    if (b.totalSold !== a.totalSold) {
                        return b.totalSold - a.totalSold;
                    }
                    return b.avgRating - a.avgRating;
                })
                .slice(0, limit);

            return { ...data, data: featuredProducts };
        } catch (error) {
            console.error('Error fetching featured products:', error);
            throw error;
        }
    }
};