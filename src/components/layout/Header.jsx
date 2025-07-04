// src/components/layout/Header.jsx
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ROUTES } from '../../routes/index.js'
import { logout } from '../../store/slices/authSlice.js'

function Header() {
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useSelector((state) => state.auth)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleLogout = () => {
        dispatch(logout())
        setIsMenuOpen(false)
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <header className="bg-black bg-opacity-95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <a href={ROUTES.HOME} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-black font-bold text-sm">ND</span>
                            </div>
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
                        <button className="text-gray-300 hover:text-primary transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Cart */}
                        <button className="text-gray-300 hover:text-primary transition-colors relative">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                            </svg>
                            <span className="absolute -top-2 -right-2 bg-primary text-black text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                0
                            </span>
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
                                            <p className="font-medium text-primary">{user?.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary">
                                                Hồ sơ của tôi
                                            </a>
                                            <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary">
                                                Đơn hàng
                                            </a>
                                            <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary">
                                                Yêu thích
                                            </a>
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
                    <div className="md:hidden">
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
    )
}

export default Header