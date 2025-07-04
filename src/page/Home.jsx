// src/page/Home.jsx
import logo from '../logo.svg'
import { ROUTES } from '../routes/index.js'
import { authUtils } from '../utils/auth.js'

function Home() {
    const isLoggedIn = authUtils.isAuthenticated()
    const userData = authUtils.getUserData()

    const handleLogout = () => {
        authUtils.logout()
        window.location.reload() // Refresh để update UI
    }

    return (
        <div className="app-container fade-in">
            <header className="app-header md:max-w-2xl">
                <img src={logo} className="app-logo" alt="logo" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary">
                    Nguyen Dao Shop
                </h1>
                <p className="text-lg md:text-xl mb-8 opacity-90 max-w-md mx-auto">
                    Chào mừng đến với cửa hàng của chúng tôi
                </p>

                {isLoggedIn ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
                            <p className="text-lg md:text-xl text-blue-400 mb-2">
                                Xin chào,{' '}
                                <span className="font-semibold text-primary">
                                    {userData?.userName || 'User'}
                                </span>
                                !
                            </p>
                            <p className="text-sm text-gray-400">
                                Email: {userData?.email || 'Chưa có email'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn-outline"
                        >
                            Đăng xuất
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-300 mb-4">
                            Đăng nhập để trải nghiệm đầy đủ tính năng
                        </p>
                        <a className="app-link" href={ROUTES.AUTH}>
                            Đăng Nhập
                        </a>
                    </div>
                )}

                {/* Navigation Links */}
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                    <a
                        href="#"
                        className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                        Sản phẩm
                    </a>
                    <a
                        href="#"
                        className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                        Giới thiệu
                    </a>
                    <a
                        href="#"
                        className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                        Liên hệ
                    </a>
                </div>
            </header>
        </div>
    )
}

export default Home