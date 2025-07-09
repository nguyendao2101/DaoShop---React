// src/routes/routers.jsx
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'
// ✅ Comment out devtools tạm thời
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'

// Import route constants
import { ROUTES } from './index.js'

// Import components
import Home from '../page/Home.jsx'
import Auth from '../page/Auth.jsx'
import GoogleSuccess from '../components/layout/GoogleSuccess.jsx'
import TestRoutes from '../page/TestRoutes.jsx'

// Root route
const rootRoute = createRootRoute({
    component: () => (
        <>
            <Outlet />
            {/* ✅ Comment out devtools tạm thời */}
            {/* <TanStackRouterDevtools /> */}
        </>
    ),
})

// Home route
const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
})

// Auth route
const authRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth',
    component: Auth,
})

// Test route
const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/test',
    component: TestRoutes,
})

// Google Success route
const googleSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/success',
    component: GoogleSuccess,
})

console.log('🔍 Registering routes...')
console.log('✅ Google Success route created:', googleSuccessRoute)

// ✅ CHỈ MỘT routeTree declaration
const routeTree = rootRoute.addChildren([
    homeRoute,
    authRoute,
    googleSuccessRoute,
    testRoute
])

console.log('✅ Route tree:', routeTree)

export const router = createRouter({ routeTree })
console.log('✅ Router created:', router)