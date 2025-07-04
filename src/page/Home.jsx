// src/page/Home.jsx
import { useDispatch, useSelector } from 'react-redux'
import logo from '../logo.svg'
import { ROUTES } from '../routes/index.js'
import { logout } from '../store/slices/authSlice.js'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'

function Home() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            Nguyen Dao Jewelry
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Khám phá bộ sưu tập trang sức cao cấp được chế tác tỉ mỉ từ những nghệ nhân tài ba
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="#products"
                                className="bg-primary text-black px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-80 transition-opacity"
                            >
                                Khám phá ngay
                            </a>
                            <a
                                href="#collections"
                                className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary hover:text-black transition-colors"
                            >
                                Bộ sưu tập
                            </a>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </section>

                {/* Featured Products */}
                <section id="products" className="py-20 bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">Sản phẩm nổi bật</h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                Những món trang sức được yêu thích nhất tại Nguyen Dao Jewelry
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Product Card 1 */}
                            <div className="bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-colors group">
                                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-6xl">💍</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">Nhẫn Kim Cương Sang Trọng</h3>
                                    <p className="text-gray-400 mb-4">Nhẫn kim cương 18K với thiết kế tinh tế</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-primary">25.000.000đ</span>
                                        <button className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity">
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Product Card 2 */}
                            <div className="bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-colors group">
                                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-6xl">📿</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">Dây Chuyền Vàng Ý</h3>
                                    <p className="text-gray-400 mb-4">Dây chuyền vàng 18K nhập khẩu từ Ý</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-primary">15.000.000đ</span>
                                        <button className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity">
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Product Card 3 */}
                            <div className="bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-colors group">
                                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-6xl">👂</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">Bông Tai Ngọc Trai</h3>
                                    <p className="text-gray-400 mb-4">Bông tai ngọc trai tự nhiên cao cấp</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-primary">8.500.000đ</span>
                                        <button className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity">
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-12">
                            <a
                                href="#"
                                className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors"
                            >
                                Xem tất cả sản phẩm
                            </a>
                        </div>
                    </div>
                </section>

                {/* Collections */}
                <section id="collections" className="py-20 bg-black">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">Bộ sưu tập đặc biệt</h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                Khám phá những bộ sưu tập độc đáo được thiết kế riêng biệt
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative rounded-lg overflow-hidden h-80 group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-blue-400/30"></div>
                                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all"></div>
                                <div className="relative z-10 h-full flex items-center justify-center text-center p-8">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-4">Bộ sưu tập Cưới</h3>
                                        <p className="text-lg text-gray-300 mb-6">
                                            Trang sức hoàn hảo cho ngày trọng đại
                                        </p>
                                        <span className="inline-block bg-primary text-black px-6 py-3 rounded-lg font-semibold">
                                            Khám phá ngay
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative rounded-lg overflow-hidden h-80 group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30"></div>
                                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all"></div>
                                <div className="relative z-10 h-full flex items-center justify-center text-center p-8">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-4">Bộ sưu tập Luxury</h3>
                                        <p className="text-lg text-gray-300 mb-6">
                                            Những món trang sức xa xỉ nhất
                                        </p>
                                        <span className="inline-block bg-primary text-black px-6 py-3 rounded-lg font-semibold">
                                            Khám phá ngay
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section id="about" className="py-20 bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">Về Nguyen Dao Jewelry</h2>
                                <p className="text-lg text-gray-400 mb-6">
                                    Với hơn 20 năm kinh nghiệm trong ngành trang sức, Nguyen Dao Jewelry
                                    tự hào là một trong những thương hiệu uy tín hàng đầu tại Việt Nam.
                                </p>
                                <p className="text-lg text-gray-400 mb-8">
                                    Chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất với
                                    thiết kế độc đáo và dịch vụ chăm sóc khách hàng tận tâm.
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary mb-2">20+</div>
                                        <div className="text-gray-400">Năm kinh nghiệm</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                                        <div className="text-gray-400">Khách hàng hài lòng</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary mb-2">500+</div>
                                        <div className="text-gray-400">Sản phẩm đa dạng</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary mb-2">5</div>
                                        <div className="text-gray-400">Cửa hàng</div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-primary/20 to-blue-400/20 rounded-lg flex items-center justify-center">
                                    <span className="text-9xl">💎</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section id="contact" className="py-20 bg-black">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">Liên hệ với chúng tôi</h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                Hãy để chúng tôi giúp bạn tìm được món trang sức hoàn hảo
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="text-center p-8 bg-gray-900 rounded-lg border border-gray-800">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Địa chỉ</h3>
                                <p className="text-gray-400">123 Đường ABC, Quận 1, TP.HCM</p>
                            </div>

                            <div className="text-center p-8 bg-gray-900 rounded-lg border border-gray-800">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Điện thoại</h3>
                                <p className="text-gray-400">0123 456 789</p>
                            </div>

                            <div className="text-center p-8 bg-gray-900 rounded-lg border border-gray-800">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Email</h3>
                                <p className="text-gray-400">contact@nguyendao.com</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default Home