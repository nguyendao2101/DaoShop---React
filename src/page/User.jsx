import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import {
    fetchUserProfile,
    updateUserProfile,
    updateUserAddress,
    updateUserAvatar,
    changeUserPassword,
    clearUserError,
    clearUserSuccess,
    selectUserProfile,
    selectUserData,
    selectUserLoading,
    selectUserError,
    selectUserUpdating,
    selectUserUpdatingAddress,
    selectUserUpdatingAvatar,
    selectUserChangingPassword,
    selectUserUpdateError,
    selectUserAddressError,
    selectUserAvatarError,
    selectUserPasswordError,
    selectUserUpdateSuccess,
    selectUserAddressSuccess,
    selectUserAvatarSuccess,
    selectUserPasswordSuccess
} from '../store/slices/userSlice';
import { logout } from '../store/slices/authSlice';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';

const User = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    //  Redux state
    const userProfile = useSelector(selectUserProfile);
    const userData = useSelector(selectUserData);
    const loading = useSelector(selectUserLoading);
    const error = useSelector(selectUserError);

    // Loading states
    const updating = useSelector(selectUserUpdating);
    const updatingAddress = useSelector(selectUserUpdatingAddress);
    const updatingAvatar = useSelector(selectUserUpdatingAvatar);
    const changingPassword = useSelector(selectUserChangingPassword);

    // Error states
    const updateError = useSelector(selectUserUpdateError);
    const addressError = useSelector(selectUserAddressError);
    const avatarError = useSelector(selectUserAvatarError);
    const passwordError = useSelector(selectUserPasswordError);

    // Success states
    const updateSuccess = useSelector(selectUserUpdateSuccess);
    const addressSuccess = useSelector(selectUserAddressSuccess);
    const avatarSuccess = useSelector(selectUserAvatarSuccess);
    const passwordSuccess = useSelector(selectUserPasswordSuccess);

    const { isAuthenticated } = useSelector((state) => state.auth);

    // Local state for tabs and forms
    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showAvatarForm, setShowAvatarForm] = useState(false);

    // Form states
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: ''
    });

    const [addressForm, setAddressForm] = useState({
        street: '',
        ward: '',
        district: '',
        city: '',
        zipCode: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [avatarForm, setAvatarForm] = useState({
        avatarUrl: ''
    });

    // Fetch user profile on mount
    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: '/auth' });
            return;
        }

        console.log('👤 User Page - Fetching user profile...');
        dispatch(fetchUserProfile());
    }, [dispatch, isAuthenticated, navigate]);

    // Update form data when profile is loaded
    useEffect(() => {
        if (userData) {
            setProfileForm({
                fullName: userData.fullName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
                gender: userData.gender || ''
            });

            setAddressForm({
                street: userData.address?.street || '',
                ward: userData.address?.ward || '',
                district: userData.address?.district || '',
                city: userData.address?.city || '',
                zipCode: userData.address?.zipCode || ''
            });

            setAvatarForm({
                avatarUrl: userData.avatar || ''
            });
        }
    }, [userData]);

    // Handle success notifications
    useEffect(() => {
        if (updateSuccess) {
            alert('Cập nhật thông tin thành công!');
            dispatch(clearUserSuccess());
        }
        if (addressSuccess) {
            alert('Cập nhật địa chỉ thành công!');
            setShowAddressForm(false);
            dispatch(clearUserSuccess());
        }
        if (avatarSuccess) {
            alert('Cập nhật avatar thành công!');
            setShowAvatarForm(false);
            dispatch(clearUserSuccess());
        }
        if (passwordSuccess) {
            alert('Đổi mật khẩu thành công!');
            setShowPasswordForm(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            dispatch(clearUserSuccess());
        }
    }, [updateSuccess, addressSuccess, avatarSuccess, passwordSuccess, dispatch]);

    // Handle form submissions
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateUserProfile(profileForm)).unwrap();
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateUserAddress(addressForm)).unwrap();
        } catch (error) {
            console.error('Failed to update address:', error);
        }
    };

    const handleAvatarSubmit = async (e) => {
        e.preventDefault();
        if (!avatarForm.avatarUrl.trim()) {
            alert('Vui lòng nhập URL avatar');
            return;
        }
        try {
            await dispatch(updateUserAvatar(avatarForm.avatarUrl)).unwrap();
        } catch (error) {
            console.error('Failed to update avatar:', error);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            alert('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        try {
            await dispatch(changeUserPassword(passwordForm)).unwrap();
        } catch (error) {
            console.error('Failed to change password:', error);
        }
    };

    // Loading state
    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-300">Đang tải thông tin người dùng...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Error state
    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">❌</div>
                        <p className="text-gray-300 mb-4">Lỗi tải thông tin: {error}</p>
                        <button
                            onClick={() => dispatch(fetchUserProfile())}
                            className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-80"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-900 pt-20 pb-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Thông tin tài khoản</h1>
                        <p className="text-gray-400">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-black rounded-lg border border-gray-800 p-6">
                                {/* User Avatar */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block">
                                        <img
                                            src={userData?.avatar || 'https://via.placeholder.com/100'}
                                            alt="Avatar"
                                            className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/100/333/fff?text=User';
                                            }}
                                        />
                                        <button
                                            onClick={() => setShowAvatarForm(true)}
                                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-black rounded-full flex items-center justify-center text-xs hover:opacity-80"
                                            title="Đổi avatar"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                    <h3 className="text-white font-semibold mt-3">{userData?.fullName}</h3>
                                    <p className="text-gray-400 text-sm">{userData?.email}</p>
                                    {userData?.isEmailVerified && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 mt-2">
                                            ✓ Email đã xác thực
                                        </span>
                                    )}
                                </div>

                                {/* Navigation */}
                                <nav className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'profile'
                                            ? 'bg-primary text-black font-medium'
                                            : 'text-gray-300 hover:text-primary hover:bg-gray-800'
                                            }`}
                                    >
                                        Thông tin cá nhân
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('address')}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'address'
                                            ? 'bg-primary text-black font-medium'
                                            : 'text-gray-300 hover:text-primary hover:bg-gray-800'
                                            }`}
                                    >
                                        Địa chỉ
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'security'
                                            ? 'bg-primary text-black font-medium'
                                            : 'text-gray-300 hover:text-primary hover:bg-gray-800'
                                            }`}
                                    >
                                        Bảo mật
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-black rounded-lg border border-gray-800 p-6">
                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-semibold text-white">Thông tin cá nhân</h2>
                                            {updateError && (
                                                <div className="text-red-400 text-sm">{updateError}</div>
                                            )}
                                        </div>

                                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Full Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Họ và tên
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profileForm.fullName}
                                                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                                        required
                                                    />
                                                </div>

                                                {/* Email */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={profileForm.email}
                                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                                        required
                                                    />
                                                </div>

                                                {/* Phone */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Số điện thoại
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={profileForm.phone}
                                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                                    />
                                                </div>

                                                {/* Date of Birth */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Ngày sinh
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={profileForm.dateOfBirth}
                                                        onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                                    />
                                                </div>

                                                {/* Gender */}
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Giới tính
                                                    </label>
                                                    <select
                                                        value={profileForm.gender}
                                                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                                    >
                                                        <option value="">Chọn giới tính</option>
                                                        <option value="male">Nam</option>
                                                        <option value="female">Nữ</option>
                                                        <option value="other">Khác</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={updating}
                                                    className="bg-primary text-black px-6 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center"
                                                >
                                                    {updating ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                                                            Đang cập nhật...
                                                        </>
                                                    ) : (
                                                        'Cập nhật thông tin'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Address Tab */}
                                {activeTab === 'address' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-semibold text-white">Địa chỉ</h2>
                                            <button
                                                onClick={() => setShowAddressForm(!showAddressForm)}
                                                className="text-primary hover:opacity-80 text-sm font-medium"
                                            >
                                                {showAddressForm ? 'Hủy' : 'Chỉnh sửa'}
                                            </button>
                                        </div>

                                        {!showAddressForm ? (
                                            <div className="space-y-4">
                                                <div className="bg-gray-800 rounded-lg p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-400">Địa chỉ:</span>
                                                            <p className="text-white">{userData?.address?.street || 'Chưa cập nhật'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Phường/Xã:</span>
                                                            <p className="text-white">{userData?.address?.ward || 'Chưa cập nhật'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Quận/Huyện:</span>
                                                            <p className="text-white">{userData?.address?.district || 'Chưa cập nhật'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Thành phố:</span>
                                                            <p className="text-white">{userData?.address?.city || 'Chưa cập nhật'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Mã bưu điện:</span>
                                                            <p className="text-white">{userData?.address?.zipCode || 'Chưa cập nhật'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleAddressSubmit} className="space-y-6">
                                                {addressError && (
                                                    <div className="text-red-400 text-sm">{addressError}</div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Địa chỉ cụ thể
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.street}
                                                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                                            placeholder="Số nhà, tên đường..."
                                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Phường/Xã
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.ward}
                                                            onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Quận/Huyện
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.district}
                                                            onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Thành phố
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.city}
                                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Mã bưu điện
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.zipCode}
                                                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end space-x-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAddressForm(false)}
                                                        className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={updatingAddress}
                                                        className="bg-primary text-black px-6 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center"
                                                    >
                                                        {updatingAddress ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                                                                Đang cập nhật...
                                                            </>
                                                        ) : (
                                                            'Cập nhật địa chỉ'
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {/* Security Tab */}
                                {activeTab === 'security' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-semibold text-white">Bảo mật tài khoản</h2>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Change Password Section */}
                                            <div className="bg-gray-800 rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div>
                                                        <h3 className="text-white font-medium">Mật khẩu</h3>
                                                        <p className="text-gray-400 text-sm">Thay đổi mật khẩu để bảo mật tài khoản</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                                                        className="text-primary hover:opacity-80 text-sm font-medium"
                                                    >
                                                        {showPasswordForm ? 'Hủy' : 'Đổi mật khẩu'}
                                                    </button>
                                                </div>

                                                {showPasswordForm && (
                                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                                        {passwordError && (
                                                            <div className="text-red-400 text-sm">{passwordError}</div>
                                                        )}

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                                Mật khẩu hiện tại
                                                            </label>
                                                            <input
                                                                type="password"
                                                                value={passwordForm.currentPassword}
                                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-primary focus:outline-none"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                                Mật khẩu mới
                                                            </label>
                                                            <input
                                                                type="password"
                                                                value={passwordForm.newPassword}
                                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-primary focus:outline-none"
                                                                required
                                                                minLength={6}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                                Xác nhận mật khẩu mới
                                                            </label>
                                                            <input
                                                                type="password"
                                                                value={passwordForm.confirmPassword}
                                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-primary focus:outline-none"
                                                                required
                                                                minLength={6}
                                                            />
                                                        </div>

                                                        <div className="flex justify-end space-x-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setShowPasswordForm(false);
                                                                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                                }}
                                                                className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                                                            >
                                                                Hủy
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={changingPassword}
                                                                className="bg-primary text-black px-6 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center"
                                                            >
                                                                {changingPassword ? (
                                                                    <>
                                                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                                                                        Đang đổi...
                                                                    </>
                                                                ) : (
                                                                    'Đổi mật khẩu'
                                                                )}
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>

                                            {/* Account Info */}
                                            <div className="bg-gray-800 rounded-lg p-4">
                                                <h3 className="text-white font-medium mb-4">Thông tin tài khoản</h3>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">ID tài khoản:</span>
                                                        <span className="text-white font-mono">{userData?.id}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Tên đăng nhập:</span>
                                                        <span className="text-white">{userData?.userName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Ngày tạo:</span>
                                                        <span className="text-white">
                                                            {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Cập nhật cuối:</span>
                                                        <span className="text-white">
                                                            {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Trạng thái:</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${userData?.isActive
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {userData?.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Avatar Update Modal */}
            {showAvatarForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-white font-semibold mb-4">Cập nhật Avatar</h3>

                        <form onSubmit={handleAvatarSubmit}>
                            {avatarError && (
                                <div className="text-red-400 text-sm mb-4">{avatarError}</div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    URL Avatar
                                </label>
                                <input
                                    type="url"
                                    value={avatarForm.avatarUrl}
                                    onChange={(e) => setAvatarForm({ avatarUrl: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Preview */}
                            {avatarForm.avatarUrl && (
                                <div className="mb-4 text-center">
                                    <p className="text-gray-400 text-sm mb-2">Xem trước:</p>
                                    <img
                                        src={avatarForm.avatarUrl}
                                        alt="Preview"
                                        className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-gray-600"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAvatarForm(false);
                                        setAvatarForm({ avatarUrl: userData?.avatar || '' });
                                    }}
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatingAvatar}
                                    className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center"
                                >
                                    {updatingAvatar ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        'Cập nhật'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default User;