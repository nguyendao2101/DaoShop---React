import { io } from 'socket.io-client';

class CommentSocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (!this.socket) {
            this.socket = io('ws://localhost:8797', { transports: ['websocket'] });
        }
    }

    joinProductRoom(productId, userId, userName) {
        if (this.socket) {
            this.socket.emit('join_product', { productId, userId, userName });
        }
    }

    leaveProductRoom(productId) {
        if (this.socket) {
            this.socket.emit('leave_product', productId);
        }
    }

    onNewComment(callback) {
        if (this.socket) {
            this.socket.on('new_comment', callback);
        }
    }

    offNewComment(callback) {
        if (this.socket) {
            this.socket.off('new_comment', callback);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new CommentSocketService();