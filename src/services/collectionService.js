const API_BASE_URL = 'http://localhost:8797/api';

export const collectionService = {
    // Lấy tất cả collections
    getAllCollections: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections`);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error fetching all collections:', error);
            throw error;
        }
    },

    // Lấy sản phẩm của collection cụ thể
    getCollectionProducts: async (collectionId) => {
        try {
            console.log('Fetching collection products for:', collectionId);
            const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/products`);
            const data = await response.json();

            if (data.success) {
                return {
                    collection: data.data.collection,
                    products: data.data.products
                };
            } else {
                throw new Error('Không thể tải dữ liệu bộ sưu tập');
            }
        } catch (error) {
            console.error('Error fetching collection:', error);
            throw error;
        }
    }
};