// src/router.jsx
import {
    createRootRoute,
    createRoute,
    createRouter,
    Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

// Import route constants
import { ROUTES } from './index.js'

// Import components
import Home from '../page/Home.jsx'
import Auth from '../page/Auth.jsx'

// Root route
const rootRoute = createRootRoute({
    component: () => (
        <>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
})

// Home route
const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: ROUTES.HOME,
    component: Home,
})

// Auth route
const authRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: ROUTES.AUTH,
    component: Auth,
})

// Route tree
const routeTree = rootRoute.addChildren([homeRoute, authRoute])

// Router configuration
export const router = createRouter({
    routeTree,
    context: {},
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
})