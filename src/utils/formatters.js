
export const formatDate = (date, options = {}) => {
    if (!date) return 'N/A';

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
    };

    try {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('vi-VN', defaultOptions);
    } catch (error) {
        console.error('Format date error:', error);
        return 'Invalid date';
    }
};


export const formatCurrency = (amount, currency = 'VND') => {
    if (amount === undefined || amount === null) return '0 ₫';

    try {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: currency
        }).format(amount);
    } catch (error) {
        console.error('Format currency error:', error);
        return `${amount.toLocaleString('vi-VN')} ${currency}`;
    }
};


export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const formatNumber = (number) => {
    if (number === undefined || number === null) return '0';
    return number.toLocaleString('vi-VN');
};