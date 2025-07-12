import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ROUTES } from '../../routes/index.js'
import { logout } from '../../store/slices/authSlice.js'
import { fetchCart, selectCartTotalItems, selectCartLoading, selectCartError } from '../../store/slices/cartSlice.js'
import { selectWishlistTotalItems } from '../../store/slices/wishlistSlice.js'
import logoApp from '../../assets/images/logoApp.png'
import SearchDialog from './SearchDialog'
import { useNavigate } from '@tanstack/react-router'

function Header() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useSelector((state) => state.auth)
    const cartTotalItems = useSelector(selectCartTotalItems)
    const cartLoading = useSelector(selectCartLoading)
    const cartError = useSelector(selectCartError)
    const wishlistTotalItems = useSelector(selectWishlistTotalItems)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Fetch cart khi user authenticated và refresh định kỳ
    useEffect(() => {
        if (isAuthenticated) {
            console.log('Header - Fetching cart on auth change');
            dispatch(fetchCart());
        }
    }, [isAuthenticated, dispatch]);

    // Refresh cart mỗi 30 giây khi user authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        const refreshCart = () => {
            console.log('Header - Auto refreshing cart');
            dispatch(fetchCart());
        };

        // Refresh ngay lập tức
        refreshCart();

        // Setup interval refresh
        const interval = setInterval(refreshCart, 30000); // 30 seconds

        return () => {
            clearInterval(interval);
        };
    }, [isAuthenticated, dispatch]);

    // Refresh cart khi window focus (user quay lại tab)
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleFocus = () => {
            console.log('Header - Refreshing cart on window focus');
            dispatch(fetchCart());
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [isAuthenticated, dispatch]);

    // Manual refresh cart function
    const handleCartClick = () => {
        if (isAuthenticated) {
            console.log('Header - Navigating to cart page');
            navigate({ to: '/cart' });
        } else {
            alert('Vui lòng đăng nhập để xem giỏ hàng');
            navigate({ to: '/auth' });
        }
    };
    const handleWishlistClick = () => {
        if (isAuthenticated) {
            console.log('Header - Navigating to wishlist page');
            navigate({ to: '/wishlist' });
            setIsMenuOpen(false); // Close dropdown menu
        } else {
            alert('Vui lòng đăng nhập để xem danh sách yêu thích');
            navigate({ to: '/auth' });
        }
    };
    const handleUserClick = () => {
        if (isAuthenticated) {
            console.log('Header - Navigating to wishlist page');
            navigate({ to: '/user' });
            setIsMenuOpen(false); // Close dropdown menu
        } else {
            alert('Vui lòng đăng nhập để xem danh sách yêu thích');
            navigate({ to: '/auth' });
        }
    };
    const handleLogout = () => {
        dispatch(logout())
        setIsMenuOpen(false)
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const openSearch = () => {
        setIsSearchOpen(true)
    }

    const closeSearch = () => {
        setIsSearchOpen(false)
    }

    // og để debug
    console.log('🛒 Header - Cart state:', {
        cartTotalItems,
        cartLoading,
        cartError,
        isAuthenticated,
        wishlistTotalItems
    });

    return (
        <>
            <header className="bg-black bg-opacity-95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <a href={ROUTES.HOME} className="flex items-center space-x-2">
                                <img
                                    src={logoApp}
                                    alt="Nguyen Dao Jewelry Logo"
                                    className="w-8 h-8 object-contain"
                                />
                                <span className="text-xl font-bold text-primary">Nguyen Dao Jewelry</span>
                            </a>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#" className="text-gray-300 hover:text-primary transition-colors font-medium">
                                Trang chủ
                            </a>
                            <a href="#products" className="text-gray-300 hover:text-primary transition-colors font-medium">
                                Sản phẩm
                            </a>
                            <a href="#collections" className="text-gray-300 hover:text-primary transition-colors font-medium">
                                Bộ sưu tập
                            </a>
                            <a href="#about" className="text-gray-300 hover:text-primary transition-colors font-medium">
                                Giới thiệu
                            </a>
                            <a href="#contact" className="text-gray-300 hover:text-primary transition-colors font-medium">
                                Liên hệ
                            </a>
                        </nav>

                        {/* User Actions */}
                        <div className="hidden md:flex items-center space-x-4">
                            {/* Search */}
                            <button
                                onClick={openSearch}
                                className="text-gray-300 hover:text-primary transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>

                            {/* Wishlist Button*/}
                            <button
                                onClick={handleWishlistClick}
                                className="text-gray-300 hover:text-primary transition-colors relative"
                                title="Danh sách yêu thích"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>

                                {/* Wishlist count badge */}
                                {wishlistTotalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                                        {wishlistTotalItems > 99 ? '99+' : wishlistTotalItems}
                                    </span>
                                )}
                            </button>

                            {/*Cart - CẬP NHẬT với onClick handler */}
                            <button
                                onClick={handleCartClick}
                                className="text-gray-300 hover:text-primary transition-colors relative"
                                title="Giỏ hàng (Click để refresh)"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                                </svg>

                                {/* Loading indicator */}
                                {cartLoading && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                    </span>
                                )}

                                {/* Cart count badge */}
                                {!cartLoading && cartTotalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                                        {cartTotalItems > 99 ? '99+' : cartTotalItems}
                                    </span>
                                )}

                                {/*Error indicator */}
                                {cartError && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" title="Lỗi load giỏ hàng"></span>
                                )}
                            </button>

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={toggleMenu}
                                        className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors"
                                    >
                                        <span className="font-medium">{user?.userName}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
                                            <div className="p-3 border-b border-gray-700">
                                                <p className="text-sm text-gray-400">Đăng nhập với</p>
                                                <p className="font-medium text-primary">{user?.userName}</p>
                                            </div>
                                            <div className="py-2">
                                                {/* <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary">
                                                    Hồ sơ của tôi
                                                </a> */}
                                                <button
                                                    onClick={handleUserClick}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary"
                                                >
                                                    Hồ sơ của tôi
                                                </button>
                                                <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary">
                                                    Đơn hàng
                                                </a>
                                                <button
                                                    onClick={handleWishlistClick}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>Yêu thích</span>
                                                        {wishlistTotalItems > 0 && (
                                                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                                {wishlistTotalItems}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                                <hr className="border-gray-700 my-2" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <a
                                    href={ROUTES.AUTH}
                                    className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity"
                                >
                                    Đăng nhập
                                </a>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center space-x-2">
                            {/* Mobile Search Button */}
                            <button
                                onClick={openSearch}
                                className="text-gray-300 hover:text-primary transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>

                            {/*Mobile Wishlist Button - NEW */}
                            <button
                                onClick={handleWishlistClick}
                                className="text-gray-300 hover:text-primary transition-colors relative"
                                title="Danh sách yêu thích"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>

                                {/* Wishlist count badge */}
                                {wishlistTotalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                                        {wishlistTotalItems > 9 ? '9+' : wishlistTotalItems}
                                    </span>
                                )}
                            </button>

                            {/* Mobile Cart Button - CẬP NHẬT */}
                            <button
                                onClick={handleCartClick}
                                className="text-gray-300 hover:text-primary transition-colors relative"
                                title="Giỏ hàng (Click để refresh)"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                                </svg>

                                {/* Loading indicator */}
                                {cartLoading && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                )}

                                {/* Cart count badge */}
                                {!cartLoading && cartTotalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                                        {cartTotalItems > 9 ? '9+' : cartTotalItems}
                                    </span>
                                )}
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMenu}
                                className="text-gray-300 hover:text-primary transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden border-t border-gray-800">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                <a href="#" className="block px-3 py-2 text-gray-300 hover:text-primary font-medium">
                                    Trang chủ
                                </a>
                                <a href="#products" className="block px-3 py-2 text-gray-300 hover:text-primary font-medium">
                                    Sản phẩm
                                </a>
                                <a href="#collections" className="block px-3 py-2 text-gray-300 hover:text-primary font-medium">
                                    Bộ sưu tập
                                </a>
                                <a href="#about" className="block px-3 py-2 text-gray-300 hover:text-primary font-medium">
                                    Giới thiệu
                                </a>
                                <a href="#contact" className="block px-3 py-2 text-gray-300 hover:text-primary font-medium">
                                    Liên hệ
                                </a>

                                {/* ✅ Add wishlist to mobile menu */}
                                {isAuthenticated && (
                                    <button
                                        onClick={handleWishlistClick}
                                        className="block w-full text-left px-3 py-2 text-gray-300 hover:text-primary font-medium"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>Danh sách yêu thích</span>
                                            {wishlistTotalItems > 0 && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                    {wishlistTotalItems}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                )}

                                {isAuthenticated ? (
                                    <div className="border-t border-gray-700 pt-2">
                                        <p className="px-3 py-2 text-sm text-gray-400">
                                            Xin chào, {user?.userName}
                                        </p>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-3 py-2 text-red-400 font-medium"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-t border-gray-700 pt-2">
                                        <a
                                            href={ROUTES.AUTH}
                                            className="block px-3 py-2 text-primary font-medium"
                                        >
                                            Đăng nhập
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Search Dialog */}
            <SearchDialog
                isOpen={isSearchOpen}
                onClose={closeSearch}
            />
        </>
    )
}

export default Header