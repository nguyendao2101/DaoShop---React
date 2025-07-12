import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from '@tanstack/react-router'
import {
    fetchCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    selectCart,
    selectCartLoading,
    selectCartError,
    selectCartItems,
    selectCartTotalItems,
    selectCartTotalAmount
} from '../store/slices/cartSlice.js'
import { logout } from '../store/slices/authSlice.js'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'

// ✅ API Base URL
const API_BASE_URL = 'http://localhost:8797/api'

const Cart = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Redux state
    const cart = useSelector(selectCart)
    const cartItems = useSelector(selectCartItems)
    const cartLoading = useSelector(selectCartLoading)
    const cartError = useSelector(selectCartError)
    const totalItems = useSelector(selectCartTotalItems)
    const totalAmount = useSelector(selectCartTotalAmount)
    const { isAuthenticated, user } = useSelector((state) => state.auth)

    // Local state
    const [updatingItems, setUpdatingItems] = useState(new Set())
    const [selectedItems, setSelectedItems] = useState(new Set())
    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false)
    const [productDetails, setProductDetails] = useState(new Map())

    // Fetch cart on component mount
    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: '/auth' })
            return
        }

        console.log('🛒 Cart Page - Fetching cart data...')
        dispatch(fetchCart())
    }, [dispatch, isAuthenticated, navigate])

    // ✅ Auto select all items when cart loads
    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            const allItemKeys = cartItems.map(item => `${item.productId}_${item.sizeIndex}`)
            setSelectedItems(new Set(allItemKeys))
            console.log('✅ Auto-selected all cart items:', allItemKeys)
        }
    }, [cartItems])

    // ✅ Fetch product details - SEPARATE useEffect
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!cartItems || cartItems.length === 0) return

            console.log('🔍 Fetching product details for cart items...', cartItems)

            const productIds = [...new Set(cartItems.map(item => item.productId))]
            const detailsMap = new Map()

            try {
                for (const productId of productIds) {
                    console.log(`🔍 Fetching details for product: ${productId}`)

                    const response = await fetch(`${API_BASE_URL}/products/${productId}`)

                    console.log(`📡 Response for ${productId}:`, response.status, response.statusText)

                    if (response.ok) {
                        const productData = await response.json()
                        console.log(`✅ Product data for ${productId}:`, productData)

                        // Store the product data
                        detailsMap.set(productId, productData.data || productData)
                    } else {
                        console.error(`❌ Failed to fetch product ${productId}:`, response.status)
                    }
                }

                console.log('🗺️ Final product details map:', detailsMap)
                setProductDetails(detailsMap)

            } catch (error) {
                console.error('❌ Failed to fetch product details:', error)
            }
        }

        fetchProductDetails()
    }, [cartItems])

    // ✅ Enhanced getProductInfo function
    const getProductInfo = (item) => {
        const productDetail = productDetails.get(item.productId)

        console.log(`🔍 DETAILED PRODUCT INFO for ${item.productId}:`, {
            productDetail,
            hasDetail: !!productDetail,
            itemData: item,
            // Debug image paths
            'productDetail?.productImg': productDetail?.productImg,
            'productDetail?.productImg["0"]': productDetail?.productImg?.["0"],
            'Object.values(productDetail?.productImg || {})': Object.values(productDetail?.productImg || {}),
            // Debug name paths
            'productDetail?.nameProduct': productDetail?.nameProduct,
            'productDetail?.name': productDetail?.name,
            // Debug size structure
            'productDetail?.sizePrice': productDetail?.sizePrice,
            'Object.values(productDetail?.sizePrice || {})': Object.values(productDetail?.sizePrice || {})
        })

        // ✅ Helper function for getting first image (same as ProductCard)
        const getFirstImage = (productImg) => {
            if (!productImg) return null;
            return productImg["0"] || Object.values(productImg)[0];
        };

        // ✅ Helper function for getting size info
        const getSizeInfo = (sizePrice, sizeIndex) => {
            if (!sizePrice) return null;
            const sizeOptions = Object.values(sizePrice);
            return sizeOptions[sizeIndex] || null;
        };

        const firstImage = getFirstImage(productDetail?.productImg);
        const sizeInfo = getSizeInfo(productDetail?.sizePrice, item.sizeIndex);

        console.log(`🖼️ IMAGE & SIZE INFO for ${item.productId}:`, {
            firstImage,
            sizeInfo,
            imageFound: !!firstImage,
            sizeFound: !!sizeInfo
        });

        return {
            // ✅ Match với ProductCard structure
            name: productDetail?.nameProduct || productDetail?.name || `Sản phẩm ${item.productId}`,
            image: firstImage, // Use same logic as ProductCard
            description: productDetail?.description || '',
            category: productDetail?.category || '',
            brand: productDetail?.brand || '',
            material: productDetail?.material || '',
            karat: productDetail?.karat || '',
            gender: productDetail?.gender || '',
            type: productDetail?.type || '',

            // ✅ Size information
            sizes: productDetail?.sizePrice ? Object.values(productDetail.sizePrice) : [],
            sizeName: sizeInfo?.size || `Size ${item.sizeIndex}`,

            // ✅ Price information
            originalPrice: sizeInfo?.price || item.price,
            discountPercent: productDetail?.discountPercent || 0,
            finalPrice: item.price, // This is the price stored in cart (already discounted)
        }
    }

    // Format price helper
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    // ✅ Calculate selected items totals
    const getSelectedTotals = () => {
        const selectedCartItems = cartItems.filter(item =>
            selectedItems.has(`${item.productId}_${item.sizeIndex}`)
        )

        const selectedTotalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0)
        const selectedTotalAmount = selectedCartItems.reduce((sum, item) => {
            const productInfo = getProductInfo(item)
            return sum + (productInfo.finalPrice * item.quantity)
        }, 0)

        return { selectedCartItems, selectedTotalItems, selectedTotalAmount }
    }

    // ✅ Handle single item checkbox
    const handleItemSelect = (item) => {
        const itemKey = `${item.productId}_${item.sizeIndex}`
        const newSelectedItems = new Set(selectedItems)

        if (selectedItems.has(itemKey)) {
            newSelectedItems.delete(itemKey)
        } else {
            newSelectedItems.add(itemKey)
        }

        setSelectedItems(newSelectedItems)
        console.log('🔘 Item selection changed:', itemKey, newSelectedItems.has(itemKey))
    }

    // ✅ Handle select all checkbox
    const handleSelectAll = () => {
        if (selectedItems.size === cartItems.length) {
            // Deselect all
            setSelectedItems(new Set())
            console.log('🔘 Deselected all items')
        } else {
            // Select all
            const allItemKeys = cartItems.map(item => `${item.productId}_${item.sizeIndex}`)
            setSelectedItems(new Set(allItemKeys))
            console.log('🔘 Selected all items:', allItemKeys)
        }
    }

    // Handle quantity update
    const handleQuantityUpdate = async (item, newQuantity) => {
        if (newQuantity < 1) return

        const itemKey = `${item.productId}_${item.sizeIndex}`
        setUpdatingItems(prev => new Set([...prev, itemKey]))

        try {
            await dispatch(updateCartItem({
                productId: item.productId,
                sizeIndex: item.sizeIndex,
                quantity: newQuantity
            })).unwrap()

            console.log('✅ Cart item updated successfully')
        } catch (error) {
            console.error('❌ Failed to update cart item:', error)

            if (error.includes('Authentication failed') || error.includes('Invalid token')) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
                dispatch(logout())
                navigate({ to: '/auth' })
            } else {
                alert(`Lỗi cập nhật số lượng: ${error}`)
            }
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev)
                newSet.delete(itemKey)
                return newSet
            })
        }
    }

    // Handle remove item
    const handleRemoveItem = async (item) => {
        const confirmRemove = window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')
        if (!confirmRemove) return

        const itemKey = `${item.productId}_${item.sizeIndex}`
        setUpdatingItems(prev => new Set([...prev, itemKey]))

        try {
            await dispatch(removeFromCart({
                productId: item.productId,
                sizeIndex: item.sizeIndex
            })).unwrap()

            // Remove from selected items if it was selected
            setSelectedItems(prev => {
                const newSet = new Set(prev)
                newSet.delete(itemKey)
                return newSet
            })

            console.log('✅ Cart item removed successfully')
        } catch (error) {
            console.error('❌ Failed to remove cart item:', error)

            if (error.includes('Authentication failed') || error.includes('Invalid token')) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
                dispatch(logout())
                navigate({ to: '/auth' })
            } else {
                alert(`Lỗi xóa sản phẩm: ${error}`)
            }
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev)
                newSet.delete(itemKey)
                return newSet
            })
        }
    }

    // ✅ Handle remove selected items
    const handleRemoveSelected = async () => {
        const { selectedCartItems } = getSelectedTotals()

        if (selectedCartItems.length === 0) {
            alert('Vui lòng chọn sản phẩm để xóa!')
            return
        }

        const confirmRemove = window.confirm(`Bạn có chắc muốn xóa ${selectedCartItems.length} sản phẩm đã chọn?`)
        if (!confirmRemove) return

        try {
            setIsProcessingCheckout(true)

            // Remove each selected item
            for (const item of selectedCartItems) {
                await dispatch(removeFromCart({
                    productId: item.productId,
                    sizeIndex: item.sizeIndex
                })).unwrap()
            }

            // Clear selected items
            setSelectedItems(new Set())

            console.log('✅ Selected items removed successfully')
            alert('Đã xóa các sản phẩm đã chọn!')

        } catch (error) {
            console.error('❌ Failed to remove selected items:', error)
            alert(`Lỗi xóa sản phẩm: ${error}`)
        } finally {
            setIsProcessingCheckout(false)
        }
    }

    // Handle clear cart
    const handleClearCart = async () => {
        const confirmClear = window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')
        if (!confirmClear) return

        try {
            await dispatch(clearCart()).unwrap()
            setSelectedItems(new Set()) // Clear selected items
            console.log('✅ Cart cleared successfully')
        } catch (error) {
            console.error('❌ Failed to clear cart:', error)

            if (error.includes('Authentication failed') || error.includes('Invalid token')) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
                dispatch(logout())
                navigate({ to: '/auth' })
            } else {
                alert(`Lỗi xóa giỏ hàng: ${error}`)
            }
        }
    }

    // ✅ Handle checkout with selected items
    const handleCheckout = async () => {
        const { selectedCartItems, selectedTotalAmount } = getSelectedTotals()

        if (selectedCartItems.length === 0) {
            alert('Vui lòng chọn sản phẩm để thanh toán!')
            return
        }

        // Simulate payment process
        const confirmPayment = window.confirm(
            `Thanh toán ${selectedCartItems.length} sản phẩm với tổng cộng ${formatPrice(selectedTotalAmount)}?`
        )

        if (!confirmPayment) return

        try {
            setIsProcessingCheckout(true)

            // Simulate payment processing
            console.log('💳 Processing payment...', selectedCartItems)
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Remove purchased items from cart
            for (const item of selectedCartItems) {
                await dispatch(removeFromCart({
                    productId: item.productId,
                    sizeIndex: item.sizeIndex
                })).unwrap()
            }

            // Clear selected items
            setSelectedItems(new Set())

            console.log('✅ Checkout completed successfully')
            alert('Thanh toán thành công! Các sản phẩm đã được xóa khỏi giỏ hàng.')

        } catch (error) {
            console.error('❌ Checkout failed:', error)
            alert(`Lỗi thanh toán: ${error}`)
        } finally {
            setIsProcessingCheckout(false)
        }
    }

    // Handle continue shopping
    const handleContinueShopping = () => {
        navigate({ to: '/' })
    }

    const { selectedCartItems, selectedTotalItems, selectedTotalAmount } = getSelectedTotals()

    // Loading state
    if (cartLoading && !cart) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-300">Đang tải giỏ hàng...</p>
                    </div>
                </div>
                <Footer />
            </>
        )
    }

    // Error state
    if (cartError) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">❌</div>
                        <p className="text-gray-300 mb-4">Lỗi tải giỏ hàng: {cartError}</p>
                        <button
                            onClick={() => dispatch(fetchCart())}
                            className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:opacity-80"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        )
    }

    // Empty cart state
    if (!cartItems || cartItems.length === 0) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 pt-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🛒</div>
                            <h1 className="text-3xl font-bold text-white mb-4">Giỏ hàng trống</h1>
                            <p className="text-gray-400 mb-8">Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
                            <button
                                onClick={handleContinueShopping}
                                className="bg-primary text-black px-6 py-3 rounded-lg font-medium hover:opacity-80 transition-opacity"
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-900 pt-20 pb-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Giỏ hàng của bạn</h1>
                        <p className="text-gray-400">
                            {totalItems} sản phẩm • Đã chọn: {selectedTotalItems} sản phẩm
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center space-x-4">
                                        <h2 className="text-xl font-semibold text-white">Sản phẩm</h2>

                                        {/* ✅ Select All Checkbox */}
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
                                            />
                                            <span className="text-sm text-gray-300">
                                                Chọn tất cả ({cartItems.length})
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex space-x-2">
                                        {selectedItems.size > 0 && (
                                            <button
                                                onClick={handleRemoveSelected}
                                                disabled={isProcessingCheckout}
                                                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                Xóa đã chọn ({selectedItems.size})
                                            </button>
                                        )}

                                        {cartItems.length > 0 && (
                                            <button
                                                onClick={handleClearCart}
                                                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                                                disabled={cartLoading}
                                            >
                                                Xóa tất cả
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {cartItems.map((item, index) => {
                                        const itemKey = `${item.productId}_${item.sizeIndex}`
                                        const isUpdating = updatingItems.has(itemKey)
                                        const isSelected = selectedItems.has(itemKey)

                                        // ✅ Get product info
                                        const productInfo = getProductInfo(item)

                                        console.log(`🎨 Rendering item ${itemKey}:`, {
                                            productInfo,
                                            hasImage: !!productInfo.image,
                                            imageSrc: productInfo.image
                                        })

                                        return (
                                            <div
                                                key={itemKey}
                                                className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${isSelected ? 'bg-gray-700 border border-primary' : 'bg-gray-700'
                                                    }`}
                                            >
                                                {/* ✅ Item Checkbox */}
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleItemSelect(item)}
                                                        disabled={isUpdating}
                                                        className="w-4 h-4 text-primary bg-gray-600 border-gray-500 rounded focus:ring-primary focus:ring-2"
                                                    />
                                                </label>

                                                {/* ✅ Enhanced Product Image */}
                                                <div className="w-20 h-20 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                                                    {productInfo.image ? (
                                                        <img
                                                            src={productInfo.image}
                                                            alt={productInfo.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                console.error('❌ Image failed to load:', productInfo.image)
                                                                e.target.onerror = null // Prevent infinite loop
                                                                e.target.src = '' // Clear src
                                                                e.target.style.display = 'none'
                                                                // Show fallback
                                                                const fallback = e.target.nextElementSibling
                                                                if (fallback) fallback.style.display = 'flex'
                                                            }}
                                                            onLoad={() => {
                                                                console.log('✅ Image loaded successfully:', productInfo.image)
                                                            }}
                                                        />
                                                    ) : null}

                                                    {/* ✅ Fallback placeholder */}
                                                    <div
                                                        className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs"
                                                        style={{ display: productInfo.image ? 'none' : 'flex' }}
                                                    >
                                                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>No Image</span>
                                                    </div>
                                                </div>

                                                {/* ✅ Enhanced Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-white truncate" title={productInfo.name}>
                                                        {productInfo.name}
                                                    </h3>

                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-sm text-gray-400">
                                                            {productInfo.sizeName}
                                                        </span>

                                                        {/* {productInfo.category && (
                                                            <>
                                                                <span className="text-gray-500">•</span>
                                                                <span className="text-xs text-gray-500 bg-gray-600 px-2 py-1 rounded">
                                                                    {productInfo.category}
                                                                </span>
                                                            </>
                                                        )} */}

                                                        {productInfo.material && (
                                                            <>
                                                                <span className="text-gray-500">•</span>
                                                                <span className="text-xs text-gray-500 bg-gray-600 px-2 py-1 rounded">
                                                                    {productInfo.material}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* ✅ Price with discount info */}
                                                    <div className="mt-1">
                                                        <span className="text-primary font-medium">
                                                            {formatPrice(productInfo.finalPrice)}
                                                        </span>

                                                        {productInfo.discountPercent > 0 && (
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    {formatPrice(productInfo.originalPrice + (productInfo.originalPrice * productInfo.discountPercent / 100))}
                                                                </span>
                                                                <span className="text-xs bg-red-600 text-white px-1 py-0.5 rounded">
                                                                    -{productInfo.discountPercent}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* ✅ Quantity Controls */}
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleQuantityUpdate(item, item.quantity - 1)}
                                                        disabled={isUpdating || item.quantity <= 1}
                                                        className="w-8 h-8 rounded-full bg-gray-600 text-white disabled:opacity-50 hover:bg-gray-500 transition-colors flex items-center justify-center"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-white font-medium">
                                                        {isUpdating ? '...' : item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityUpdate(item, item.quantity + 1)}
                                                        disabled={isUpdating}
                                                        className="w-8 h-8 rounded-full bg-gray-600 text-white disabled:opacity-50 hover:bg-gray-500 transition-colors flex items-center justify-center"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* ✅ Total Price */}
                                                <div className="text-right min-w-0">
                                                    <p className="font-medium text-white">
                                                        {formatPrice(productInfo.finalPrice * item.quantity)}
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-xs text-gray-400">
                                                            {formatPrice(productInfo.finalPrice)} x {item.quantity}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* ✅ Remove Button */}
                                                <button
                                                    onClick={() => handleRemoveItem(item)}
                                                    disabled={isUpdating}
                                                    className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors p-1"
                                                    title="Xóa sản phẩm"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* ✅ Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-800 rounded-lg p-6 sticky top-24">
                                <h2 className="text-xl font-semibold text-white mb-6">Tóm tắt đơn hàng</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-300">
                                        <span>Sản phẩm đã chọn:</span>
                                        <span>{selectedTotalItems} sản phẩm</span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                        <span>Tạm tính:</span>
                                        <span>{formatPrice(selectedTotalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                        <span>Phí vận chuyển:</span>
                                        <span className="text-green-400">Miễn phí</span>
                                    </div>
                                    <hr className="border-gray-600" />
                                    <div className="flex justify-between text-white font-semibold text-lg">
                                        <span>Tổng cộng:</span>
                                        <span className="text-primary">{formatPrice(selectedTotalAmount)}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleCheckout}
                                        disabled={isProcessingCheckout || selectedItems.size === 0}
                                        className="w-full bg-primary text-black py-3 rounded-lg font-medium hover:opacity-80 disabled:opacity-50 transition-opacity"
                                    >
                                        {isProcessingCheckout ? 'Đang xử lý...' :
                                            selectedItems.size === 0 ? 'Chọn sản phẩm để thanh toán' :
                                                `Thanh toán (${selectedTotalItems} sản phẩm)`}
                                    </button>

                                    <button
                                        onClick={handleContinueShopping}
                                        className="w-full border border-gray-600 text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                                    >
                                        Tiếp tục mua sắm
                                    </button>
                                </div>

                                {/* ✅ Selected Items Summary */}
                                {selectedItems.size > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-600">
                                        <h3 className="text-sm font-medium text-gray-300 mb-2">Sản phẩm sẽ thanh toán:</h3>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {selectedCartItems.map((item) => {
                                                const productInfo = getProductInfo(item)
                                                return (
                                                    <div key={`${item.productId}_${item.sizeIndex}`} className="bg-gray-700 p-2 rounded text-xs">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white font-medium truncate" title={productInfo.name}>
                                                                    {productInfo.name}
                                                                </p>
                                                                <p className="text-gray-400">
                                                                    {productInfo.sizeName} × {item.quantity}
                                                                </p>
                                                            </div>
                                                            <p className="text-primary font-medium ml-2">
                                                                {formatPrice(productInfo.finalPrice * item.quantity)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ✅ User Info */}
                                {user && (
                                    <div className="mt-6 pt-6 border-t border-gray-600">
                                        <p className="text-sm text-gray-400">Đăng nhập với</p>
                                        <p className="font-medium text-primary">{user.userName}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Cart