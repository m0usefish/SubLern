import { RouterProvider } from 'react-router-dom'
import { router } from './router/router'
import { useAppDispatch } from './store/hooks'
import { getTokenFromLocalStorage } from './helpers/localstorage.helper'
import { AuthService } from './services/auth.service'
import { login, logout } from './store/user/userSlice'
import { useEffect } from 'react'
function App() {
    const dispatch = useAppDispatch()

    const checkAuth = async () => {
        const token = getTokenFromLocalStorage()

        try {
            if (token) {
                const data = await AuthService.getProfile()
                if (data) {
                    dispatch(login(data))
                    // Update streak
                    AuthService.ping().catch((err) =>
                        console.error('Ping failed', err),
                    )
                } else {
                    dispatch(logout())
                }
            }
        } catch (err: any) {
            const error = err.response?.data.message
            console.log(error)
            //   toast.error(error.toString());
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])
    return <RouterProvider router={router} />
}

export default App
