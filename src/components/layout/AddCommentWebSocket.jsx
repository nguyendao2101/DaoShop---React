import React, { useState } from 'react';
import commentSocketService from '../../services/commentSocketSevice';

const AddCommentWebSocket = ({ productId, user }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);

        // Gửi comment qua WebSocket
        const commentData = {
            idProduct: productId,
            idUser: user?.id,
            nameUser: user?.userName,
            content
        };
        console.log('Gửi comment qua WebSocket:', commentData);
        commentSocketService.socket.emit('send_comment', commentData);

        setContent('');
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 flex items-center space-x-2">
            <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Nhập bình luận..."
                className="flex-1 px-3 py-2 rounded border border-gray-700 bg-gray-900 text-white"
                disabled={loading}
            />
            <button
                type="submit"
                className="bg-primary text-black px-4 py-2 rounded font-semibold hover:opacity-80"
                disabled={loading}
            >
                {loading ? 'Đang gửi...' : 'Gửi'}
            </button>
        </form>
    );
};

export default AddCommentWebSocket;