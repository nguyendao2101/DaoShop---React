import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import commentSocketService from '../../services/commentSocketSevice';
import { setComments, addComment, clearComments } from '../../store/slices/commentSocketSlice';

const CommentWebSocket = ({ productId }) => {
    const dispatch = useDispatch();
    const comments = useSelector(state => state.comments?.comments || []);
    const userId = useSelector(state => state.user?.userId);
    const userName = useSelector(state => state.user?.userName);

    // Lấy comment ban đầu (giữ lại nếu muốn load lịch sử)
    useEffect(() => {
        fetch(`http://localhost:8797/api/comments/product/${productId}?page=1&limit=10`)
            .then(res => res.json())
            .then(data => dispatch(setComments(data.data || [])));
    }, [productId, dispatch]);

    // Kết nối socket và lắng nghe comment mới
    useEffect(() => {
        commentSocketService.connect();
        console.log('Kết nối socket cho sản phẩm:', productId, 'User:', userId, userName);
        commentSocketService.joinProductRoom(productId, userId, userName);

        const handleNewComment = (data) => {
            console.log('Nhận comment realtime từ socket:', data);
            const comment = data.comment || data;
            if (comment.idProduct === productId) {
                dispatch(addComment(comment));
            }
        };

        if (commentSocketService.socket) {
            commentSocketService.socket.on('new_comment', handleNewComment);
            commentSocketService.socket.on('comment_added_from_api', handleNewComment);
        }

        return () => {
            commentSocketService.leaveProductRoom(productId);
            if (commentSocketService.socket) {
                commentSocketService.socket.off('new_comment', handleNewComment);
                commentSocketService.socket.off('comment_added_from_api', handleNewComment);
            }
            dispatch(clearComments());
        };
    }, [productId, dispatch, userId, userName]);

    return (
        <div>
            <h3 className="font-bold mb-2">Bình luận</h3>
            {comments.length === 0 && <div className="text-gray-400">Chưa có bình luận nào.</div>}
            {comments.map(c => (
                <div key={c._id || c.timestamp} className="mb-2 border-b border-gray-700 pb-2">
                    <b>{c.nameUser}</b>: {c.content}
                </div>
            ))}
        </div>
    );
};

export default CommentWebSocket;