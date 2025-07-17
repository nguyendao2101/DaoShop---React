export const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};