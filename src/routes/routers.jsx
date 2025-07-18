// src/routes/routers.jsx
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'

// Import route constants
import { ROUTES } from './index.js'

// Import components
import Home from '../page/Home.jsx'
import Auth from '../page/Auth.jsx'
import ProductDetail from '../page/ProductDetail.jsx'
import ProductAll from '../page/ProductAll.jsx'
import Cart from '../page/Cart.jsx'
import Wishlist from '../page/Wishlist.jsx'
import User from '../page/User.jsx'
import Collection from '../page/Collection.jsx'
import PurchaseHistory from '../page/purchaseHistory.jsx'
import StripeResult from '../page/StripeResult.jsx'
import LiveStream from '../page/LiveStream.jsx'
import GoogleSuccess from '../components/layout/GoogleSuccess.jsx'


// Root route
const rootRoute = createRootRoute({
    component: () => (
        <>
            <Outlet />
        </>
    ),
});

const liveStreamRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/livestream/$livestreamId',
    component: LiveStream,
});

// STRIPE route
export const stripeResultRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment/result/:status/:orderId',
    component: StripeResult,
});

// Stripe route
export const stripeResultFallbackRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment/result',
    component: StripeResult,
});

// User route
const purchaseHistoryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/purchaseHistory',
    component: PurchaseHistory,
})

// User route
const userRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/user',
    component: User,
})

// Cart route
const cartRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/cart',
    component: Cart,
})

// Wishlist route
const wishlistRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/wishlist',
    component: Wishlist,
})


// Home route
const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
});

const collectionDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/collections/$collectionId',
    component: Collection,
});

// Products route
const productsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/products',
    component: ProductAll,
});

// Product detail route
const productDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/product/$productId',
    component: ProductDetail,
});

// Auth route
const authRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth',
    component: Auth,
});


// Google Success route
const googleSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/success',
    component: GoogleSuccess,
});

const routeTree = rootRoute.addChildren([
    homeRoute,
    authRoute,
    productsRoute,
    googleSuccessRoute,
    productDetailRoute,
    collectionDetailRoute,
    cartRoute,
    wishlistRoute,
    userRoute,
    purchaseHistoryRoute,
    stripeResultRoute,
    stripeResultFallbackRoute,
    liveStreamRoute
]);

export const router = createRouter({ routeTree })