import React, { useState, useRef, useEffect } from 'react';
import geminiService from '../../services/geminiService';
import geminiLogo from '../../assets/images/logoGemini.png';

const Gemini = () => {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        if (open && chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages, open]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        setMessages(msgs => [...msgs, { role: 'user', content: prompt }]);
        setLoading(true);
        try {
            const res = await geminiService.askGemini(prompt);
            setMessages(msgs => [...msgs, { role: 'gemini', content: res.answer }]);
        } catch (err) {
            setMessages(msgs => [...msgs, { role: 'gemini', content: 'Lỗi khi gọi Gemini API.' }]);
        }
        setPrompt('');
        setLoading(false);
    };

    return (
        <>
            {/* Nút logo nổi */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                    cursor: 'pointer',
                }}
                onClick={() => setOpen(o => !o)}
            >
                <img
                    src={geminiLogo}
                    alt="Gemini"
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        border: '2px solid #fff',
                        background: '#fff'
                    }}
                />
            </div>

            {/* Form chat */}
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 90,
                        right: 24,
                        width: 350,
                        maxHeight: 500,
                        background: '#18181b',
                        color: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
                        zIndex: 1001,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ padding: 16, borderBottom: '1px solid #333', fontWeight: 'bold' }}>
                        Gemini Chatbot
                        <button
                            style={{ float: 'right', background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}
                            onClick={() => setOpen(false)}
                        >×</button>
                    </div>
                    <div
                        ref={chatRef}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: 16,
                            background: '#23232b'
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                marginBottom: 12,
                                textAlign: msg.role === 'user' ? 'right' : 'left'
                            }}>
                                <div
                                    style={{
                                        display: 'inline-block',
                                        background: msg.role === 'user' ? '#2563eb' : '#fff',
                                        color: msg.role === 'user' ? '#fff' : '#18181b',
                                        borderRadius: 12,
                                        padding: '8px 14px',
                                        maxWidth: 260,
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ color: '#aaa', fontStyle: 'italic' }}>Đang trả lời...</div>
                        )}
                    </div>
                    <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid #333', padding: 8, background: '#18181b' }}>
                        <input
                            type="text"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Nhập câu hỏi..."
                            style={{
                                flex: 1,
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                color: '#fff',
                                padding: 8,
                                fontSize: 16
                            }}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            style={{
                                background: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 16px',
                                marginLeft: 8,
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                            disabled={loading}
                        >
                            Gửi
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Gemini;