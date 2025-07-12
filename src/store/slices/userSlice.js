import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService.js';
import { logout } from './authSlice';

// Async thunks for user operations
export const fetchUserProfile = createAsyncThunk(
    'user/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userService.getProfile();
            console.log('Redux - Fetching user profile response:', response);
            return response.data; // Return the data object with user info
        } catch (error) {
            console.error('Redux - Fetch user profile error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'user/updateUserProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            console.log('Redux - Updating user profile:', profileData);
            const response = await userService.updateProfile(profileData);
            console.log('Redux - Update user profile response:', response);
            return response.data;
        } catch (error) {
            console.error('Redux - Update user profile error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const updateUserAddress = createAsyncThunk(
    'user/updateUserAddress',
    async (addressData, { rejectWithValue }) => {
        try {
            console.log('Redux - Updating user address:', addressData);
            const response = await userService.updateAddress(addressData);
            console.log('Redux - Update user address response:', response);
            return response.data;
        } catch (error) {
            console.error('Redux - Update user address error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const updateUserAvatar = createAsyncThunk(
    'user/updateUserAvatar',
    async (avatarUrl, { rejectWithValue }) => {
        try {
            console.log('Redux - Updating user avatar:', avatarUrl);
            const response = await userService.updateAvatar(avatarUrl);
            console.log('Redux - Update user avatar response:', response);
            return response.data;
        } catch (error) {
            console.error('Redux - Update user avatar error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const changeUserPassword = createAsyncThunk(
    'user/changeUserPassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            console.log('Redux - Changing user password...');
            const response = await userService.changePassword(passwordData);
            console.log('Redux - Change user password response:', response);
            return response;
        } catch (error) {
            console.error('Redux - Change user password error:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Initial state
const initialState = {
    // User profile data
    profile: null,

    // Loading states
    loading: false,
    updating: false,
    updatingAddress: false,
    updatingAvatar: false,
    changingPassword: false,

    // Error states
    error: null,
    updateError: null,
    addressError: null,
    avatarError: null,
    passwordError: null,

    // Success states
    updateSuccess: false,
    addressSuccess: false,
    avatarSuccess: false,
    passwordSuccess: false,

    // Last updated timestamp
    lastFetched: null,
    lastUpdated: null
};

// User slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Clear errors
        clearUserError: (state) => {
            state.error = null;
            state.updateError = null;
            state.addressError = null;
            state.avatarError = null;
            state.passwordError = null;
        },

        //  Clear success states
        clearUserSuccess: (state) => {
            state.updateSuccess = false;
            state.addressSuccess = false;
            state.avatarSuccess = false;
            state.passwordSuccess = false;
        },

        // Reset user state (on logout)
        resetUserState: (state) => {
            return initialState;
        },

        // Update profile locally (optimistic update)
        updateProfileLocally: (state, action) => {
            if (state.profile) {
                state.profile.user = { ...state.profile.user, ...action.payload };
                state.lastUpdated = Date.now();
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch User Profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
                state.lastFetched = Date.now();
                state.error = null;

                console.log('Redux - User profile fetched successfully:', {
                    userId: action.payload?.user?.id,
                    userName: action.payload?.user?.userName
                });
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch user profile';
                console.error('Redux - Fetch user profile failed:', action.payload);
            })

            // Update User Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.updating = true;
                state.updateError = null;
                state.updateSuccess = false;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.updating = false;
                state.profile = action.payload;
                state.lastUpdated = Date.now();
                state.updateSuccess = true;
                state.updateError = null;

                console.log('Redux - User profile updated successfully');
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.updating = false;
                state.updateError = action.payload || 'Failed to update user profile';
                state.updateSuccess = false;
                console.error('Redux - Update user profile failed:', action.payload);
            })

            //Update User Address
            .addCase(updateUserAddress.pending, (state) => {
                state.updatingAddress = true;
                state.addressError = null;
                state.addressSuccess = false;
            })
            .addCase(updateUserAddress.fulfilled, (state, action) => {
                state.updatingAddress = false;
                state.profile = action.payload;
                state.lastUpdated = Date.now();
                state.addressSuccess = true;
                state.addressError = null;

                console.log('Redux - User address updated successfully');
            })
            .addCase(updateUserAddress.rejected, (state, action) => {
                state.updatingAddress = false;
                state.addressError = action.payload || 'Failed to update user address';
                state.addressSuccess = false;
                console.error('Redux - Update user address failed:', action.payload);
            })

            // Update User Avatar
            .addCase(updateUserAvatar.pending, (state) => {
                state.updatingAvatar = true;
                state.avatarError = null;
                state.avatarSuccess = false;
            })
            .addCase(updateUserAvatar.fulfilled, (state, action) => {
                state.updatingAvatar = false;
                state.profile = action.payload;
                state.lastUpdated = Date.now();
                state.avatarSuccess = true;
                state.avatarError = null;

                console.log('Redux - User avatar updated successfully');
            })
            .addCase(updateUserAvatar.rejected, (state, action) => {
                state.updatingAvatar = false;
                state.avatarError = action.payload || 'Failed to update user avatar';
                state.avatarSuccess = false;
                console.error('Redux - Update user avatar failed:', action.payload);
            })

            // Change User Password
            .addCase(changeUserPassword.pending, (state) => {
                state.changingPassword = true;
                state.passwordError = null;
                state.passwordSuccess = false;
            })
            .addCase(changeUserPassword.fulfilled, (state, action) => {
                state.changingPassword = false;
                state.passwordSuccess = true;
                state.passwordError = null;

                console.log('Redux - User password changed successfully');
            })
            .addCase(changeUserPassword.rejected, (state, action) => {
                state.changingPassword = false;
                state.passwordError = action.payload || 'Failed to change user password';
                state.passwordSuccess = false;
                console.error('Redux - Change user password failed:', action.payload);
            })

            // Handle logout
            .addCase(logout, (state) => {
                return initialState;
            });
    }
});

// Export actions
export const {
    clearUserError,
    clearUserSuccess,
    resetUserState,
    updateProfileLocally
} = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user;
export const selectUserProfile = (state) => state.user.profile;
export const selectUserData = (state) => state.user.profile?.user;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

// Loading selectors
export const selectUserUpdating = (state) => state.user.updating;
export const selectUserUpdatingAddress = (state) => state.user.updatingAddress;
export const selectUserUpdatingAvatar = (state) => state.user.updatingAvatar;
export const selectUserChangingPassword = (state) => state.user.changingPassword;

// Error selectors
export const selectUserUpdateError = (state) => state.user.updateError;
export const selectUserAddressError = (state) => state.user.addressError;
export const selectUserAvatarError = (state) => state.user.avatarError;
export const selectUserPasswordError = (state) => state.user.passwordError;

// Success selectors
export const selectUserUpdateSuccess = (state) => state.user.updateSuccess;
export const selectUserAddressSuccess = (state) => state.user.addressSuccess;
export const selectUserAvatarSuccess = (state) => state.user.avatarSuccess;
export const selectUserPasswordSuccess = (state) => state.user.passwordSuccess;

// Utility selectors
export const selectUserFullName = (state) => state.user.profile?.user?.fullName;
export const selectUserEmail = (state) => state.user.profile?.user?.email;
export const selectUserPhone = (state) => state.user.profile?.user?.phone;
export const selectUserAddress = (state) => state.user.profile?.user?.address;
export const selectUserAvatar = (state) => state.user.profile?.user?.avatar;
export const selectUserIsEmailVerified = (state) => state.user.profile?.user?.isEmailVerified;

export default userSlice.reducer;