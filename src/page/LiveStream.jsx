import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import CommentWebSocket from '../components/layout/CommentWebSocket';
import AddCommentWebSocket from '../components/layout/AddCommentWebSocket';
import { useSelector } from 'react-redux';

const Livestream = () => {
    const navigate = useNavigate();
    const { livestreamId } = useParams({ strict: false });
    const user = useSelector(state => state.auth.user);
    const [inputId, setInputId] = useState('');

    if (!livestreamId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <div className="text-red-500 mb-4">Livestream ID không hợp lệ hoặc chưa nhập.</div>
                <input
                    type="text"
                    value={inputId}
                    onChange={e => setInputId(e.target.value)}
                    placeholder="Nhập Livestream ID (YouTube)"
                    className="px-3 py-2 border rounded w-64 mb-2"
                />
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => {
                        if (inputId.trim()) {
                            navigate({ to: `/livestream/${inputId.trim()}` });
                        }
                    }}
                >
                    Xem Livestream
                </button>
            </div>
        );
    }

    const youtubeEmbedUrl = `https://www.youtube.com/embed/${livestreamId}?autoplay=1`;

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-900 min-h-screen">
            <div className="flex-1 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-2 text-white">Livestream: {livestreamId}</h2>
                <iframe
                    width="100%"
                    height="500"
                    src={youtubeEmbedUrl}
                    title="YouTube Live Stream"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="rounded-lg shadow-lg"
                />
            </div>
            <div className="w-full md:w-[400px] bg-gray-800 rounded-lg shadow-lg p-2">
                <h3 className="text-lg font-semibold text-white mb-2">Chat realtime</h3>
                <AddCommentWebSocket productId={livestreamId} user={user} />
                <CommentWebSocket productId={livestreamId} />
            </div>
        </div>
    );
};

export default Livestream;