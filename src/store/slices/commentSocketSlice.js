import { createSlice } from '@reduxjs/toolkit';

const commentSocketSlice = createSlice({
    name: 'commentSocket',
    initialState: {
        comments: [],
    },
    reducers: {
        setComments(state, action) {
            state.comments = action.payload;
        },
        addComment(state, action) {
            state.comments.unshift(action.payload);
        },
        clearComments(state) {
            state.comments = [];
        }
    }
});

export const { setComments, addComment, clearComments } = commentSocketSlice.actions;
export default commentSocketSlice.reducer;