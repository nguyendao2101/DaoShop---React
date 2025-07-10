// src/page/Home.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import banner from '../assets/images/banner.png';
import banner77 from '../assets/images/banner_7_7.png';
import bannerEGift from '../assets/images/banner_e_gift.png';
import bannerShip3Hours from '../assets/images/banner_ship_3_hours.png';
import collectionChoMe from '../assets/images/collection_chot_me.png';
import collectionOnlyYou from '../assets/images/collection_only_you.png';
import collectionCombo from '../assets/images/collection_combo.png';
import collectionNormal from '../assets/images/collection_normal.png';
import collectionQuyPhai from '../assets/images/collection_quy_phai.png';
import collectionTuyetTac from '../assets/images/collection_tuyet_tac.png';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFeaturedProducts,
    fetchAllProducts,
    selectFeaturedProducts,
    selectFeaturedLoading,
    selectFeaturedError,
    selectAllProducts
} from '../store/slices/productSlice';
import ProductCard from '../components/layout/ProductCard';
import { collectionService } from '../services/collectionService';


function Home() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0)
    const [availableCollections, setAvailableCollections] = useState([]);
    // Redux selectors
    const featuredProducts = useSelector(selectFeaturedProducts);
    const featuredLoading = useSelector(selectFeaturedLoading);
    const featuredError = useSelector(selectFeaturedError);
    const allProducts = useSelector(selectAllProducts);

    useEffect(() => {
        dispatch(fetchFeaturedProducts(3));
        dispatch(fetchAllProducts());
        // Load available collections
        const loadCollections = async () => {
            try {
                const collections = await collectionService.getAllCollections();
                setAvailableCollections(collections);
                console.log('Available collections:', collections.map(c => c.idColection));
            } catch (error) {
                console.error('Error loading collections:', error);
            }
        };

        loadCollections();
    }, [dispatch]);
    const bannerImages = [
        {
            src: banner77,
            title: "Ưu đãi ngày đôi 7/7",
            subtitle: "Bừng sáng diện mạo - Tỏa phong cách riêng",
            cta: "Khám phá ngay"
        },
        {
            src: bannerEGift,
            title: "Phiếu quà tặng điện tử E-Gift",
            subtitle: "Món quà thiết thực - Tiện lợi, hợp lý",
            cta: "Mua ngay"
        },
        {
            src: bannerShip3Hours,
            title: "Giao hàng NguyenDaoFast",
            subtitle: "Sở hữu trang sức yêu thích chỉ trong 3 giờ",
            cta: "Xem thêm"
        }
    ];

    const galleryImages = [
        {
            src: collectionChoMe,
            title: "Bộ sưu tập Chót Mê",
            category: "ChotMe"
        },
        {
            src: collectionOnlyYou,
            title: "Bộ sưu tập Only You",
            category: "OnlyYou"
        },
        {
            src: collectionCombo,
            title: "Combo Trang Sức",
            category: "Combo"
        },
        {
            src: collectionNormal,
            title: "Bộ sưu tập thường",
            category: "Normal"
        },
        {
            src: collectionQuyPhai,
            title: "Bộ sưu tập Quý Phái",
            category: "QuyPhai"
        },
        {
            src: collectionTuyetTac,
            title: "Bộ sưu tập Tuyệt Tác",
            category: "TuyetTacTrangSuc"
        }
    ];

    // Validate collection exists before navigation
    const handleCollectionClick = (collectionId) => {
        console.log('🔥 Navigating to collection:', collectionId);
        navigate({ to: `/collections/${collectionId}` });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerImages.length)
        }, 3000) // 3 giây

        return () => clearInterval(interval)
    }, [bannerImages.length])

    const goToSlide = (index) => {
        setCurrentSlide(index)
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % bannerImages.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative h-screen overflow-hidden">
                    {/* ✅ Top Half - Banner Carousel (50%) */}
                    <div className="relative w-full h-1/2">
                        {/* Banner Images */}
                        <div className="relative w-full h-full">
                            {bannerImages.map((banner, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    <img
                                        src={banner.src}
                                        alt={banner.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYW5uZXIgSW1hZ2U8L3RleHQ+PC9zdmc+'
                                        }}
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                                </div>
                            ))}
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="text-center max-w-4xl mx-auto px-4">
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 text-yellow-400">
                                    {bannerImages[currentSlide].title}
                                </h1>
                                <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                                    {bannerImages[currentSlide].subtitle}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <a
                                        href="#products"
                                        className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:opacity-80 transition-opacity"
                                    >
                                        {bannerImages[currentSlide].cta}
                                    </a>
                                    <a
                                        href="#collections"
                                        className="border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors"
                                    >
                                        Bộ sưu tập
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                            {bannerImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                                        ? 'bg-primary'
                                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Bottom Half - Gallery Grid (50%) */}
                    <div className="relative w-full h-1/2 bg-gray-900">
                        <div className="max-w-7xl mx-auto px-4 h-full flex flex-col">
                            {/* Section Header - Giảm padding */}
                            <div className="text-center py-2 mt-8">
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">Bộ Sưu Tập Nổi Bật</h2>
                                <p className="text-gray-400">Khám phá những thiết kế độc đáo của chúng tôi</p>
                            </div>

                            {/* Flex container - Giảm gap */}
                            <div className="flex-1 flex flex-col justify-center mt-2">
                                {/* Grid Gallery - Compact */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                                    {galleryImages.map((image, index) => (
                                        <div
                                            key={index}
                                            className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-800 aspect-square"
                                            onClick={() => handleCollectionClick(image.category)}
                                        >
                                            <img
                                                src={image.src}
                                                alt={image.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGI1NTYzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HYWxsZXJ5PC90ZXh0Pjwvc3ZnPg=='
                                                }}
                                            />

                                            {/* Overlay on hover */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                                                <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <h3 className="text-white font-semibold text-sm mb-1">{image.title}</h3>
                                                    <p className="text-primary text-xs">{image.category}</p>
                                                </div>
                                            </div>

                                            {/* Category Badge */}
                                            <div className="absolute top-2 left-2 bg-primary text-black px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                {image.category}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* View More Button - Sát ngay dưới grid */}
                                <div className="text-center">
                                    <a
                                        href="#collections"
                                        className="inline-flex items-center text-primary hover:text-blue-400 transition-colors"
                                    >
                                        <span className="mr-2">Xem thêm bộ sưu tập</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Scroll indicator */}
                        <div className="absolute bottom-4 right-4 z-20 animate-bounce">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
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

                        {/* Loading State */}
                        {featuredLoading && (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {/* Error State */}
                        {featuredError && (
                            <div className="text-center py-20">
                                <div className="text-red-400 mb-4">⚠️ Có lỗi xảy ra khi tải sản phẩm</div>
                                <p className="text-gray-400">{featuredError}</p>
                            </div>
                        )}

                        {/* Products Grid */}
                        {!featuredLoading && !featuredError && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {featuredProducts.length > 0 ? (
                                        featuredProducts.map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))
                                    ) : (
                                        // Fallback static products
                                        Array.from({ length: 3 }).map((_, index) => (
                                            <div key={index} className="bg-black rounded-lg overflow-hidden border border-gray-800">
                                                <div className="aspect-square bg-gray-800 flex items-center justify-center">
                                                    <span className="text-6xl">💎</span>
                                                </div>
                                                <div className="p-6">
                                                    <h3 className="text-xl font-semibold mb-2">Đang cập nhật...</h3>
                                                    <p className="text-gray-400 mb-4">Sản phẩm đang được cập nhật</p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-2xl font-bold text-primary">---</span>
                                                        <button className="bg-gray-600 text-gray-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
                                                            Đang cập nhật
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="text-center mt-12">
                                    <button
                                        onClick={() => navigate({ to: '/products' })}
                                        className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-black transition-colors"
                                    >
                                        Xem tất cả sản phẩm ({allProducts.length})
                                    </button>
                                </div>
                            </>
                        )}
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
                            <div
                                className="relative rounded-lg overflow-hidden h-80 group cursor-pointer"
                                onClick={() => handleCollectionClick("OnlyYou")}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-blue-400/30"></div>
                                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all"></div>
                                <div className="relative z-10 h-full flex items-center justify-center text-center p-8">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-4">Bộ sưu tập Only You</h3>
                                        <p className="text-lg text-gray-300 mb-6">
                                            Trang sức hoàn hảo cho riêng cho bạn
                                        </p>
                                        <span className="inline-block bg-primary text-black px-6 py-3 rounded-lg font-semibold">
                                            Khám phá ngay
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="relative rounded-lg overflow-hidden h-80 group cursor-pointer"
                                onClick={() => handleCollectionClick("TuyetTacTrangSuc")}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30"></div>
                                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all"></div>
                                <div className="relative z-10 h-full flex items-center justify-center text-center p-8">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-4">Bộ sưu tập Tuyệt Tác</h3>
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
                                    <img src={banner} alt="" />
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
                                <p className="text-gray-400">Liên khu 5, Phùng Khoang, Hà Nội</p>
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
                                <p className="text-gray-400">nguyendao21012002@gmail.com</p>
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