// src/routes/routers.jsx
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'

// Import route constants
import { ROUTES } from './index.js'

// Import components
import Home from '../page/Home.jsx'
import Auth from '../page/Auth.jsx'
import ProductDetail from '../page/ProductDetail.jsx'
import GoogleSuccess from '../components/layout/GoogleSuccess.jsx'

// Root route
const rootRoute = createRootRoute({
    component: () => (
        <>
            <Outlet />
        </>
    ),
})

// Home route
const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
})

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
})


// Google Success route
const googleSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/success',
    component: GoogleSuccess,
})

const routeTree = rootRoute.addChildren([
    homeRoute,
    authRoute,
    googleSuccessRoute,
    productDetailRoute
])

export const router = createRouter({ routeTree })