import { createBrowserRouter } from 'react-router-dom'
import Layout from '../pages/Layout'
import ErrorPage from '../pages/ErrorPage'
import Home from '../pages/Home'
import Vocabulary from '../pages/Vocabulary'
import AdminPanel from '../pages/AdminPanel'
import Auth from '../pages/Auth'
import Exercises from '../pages/Exercises'
import Watch from '../pages/Watch'
import Profile from '../pages/Profile'
import Search from '../pages/Search'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'vocabulary',
                element: (
                    <ProtectedRoute>
                        <Vocabulary />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin',
                element: (
                    <ProtectedRoute>
                        <AdminPanel />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'auth',
                element: <Auth />,
            },
            {
                path: 'exercises',
                element: (
                    <ProtectedRoute>
                        <Exercises />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'video/:id',
                element: (
                    <ProtectedRoute>
                        <Watch />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'profile',
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'search',
                element: (
                    <ProtectedRoute>
                        <Search />
                    </ProtectedRoute>
                ),
            },
        ],
    },
])
