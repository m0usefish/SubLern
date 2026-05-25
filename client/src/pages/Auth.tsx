import { type FC, useState } from 'react'
import { instance } from '../api/axios.api'
import { toast } from 'react-toastify'
import { useAppDispatch } from '../store/hooks'
import { login } from '../store/user/userSlice'
import { setTokenToLocalStorage } from '../helpers/localstorage.helper'
import { useNavigate } from 'react-router-dom'

const Auth: FC = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [isLogin, setIsLogin] = useState<boolean>(true)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const loginHandler = async (e: React.FormEvent) => {
        try {
            e.preventDefault()
            const { data } = await instance.post('auth/login', {
                email,
                password,
            })
            if (data) {
                setTokenToLocalStorage('token', data.token)
                dispatch(login(data))
                toast.success('Ви успішно увійшли!')
                navigate('/')
            }
        } catch (err: any) {
            const error = err.response?.data?.message
            toast.error(error?.toString() || 'Помилка авторизації')
        }
    }

    const registrationHandler = async (e: React.FormEvent) => {
        try {
            e.preventDefault()
            const { data } = await instance.post('user', { email, password })
            if (data) {
                toast.success('Акаунт створено. Тепер увійдіть.')
                setIsLogin(true)
            }
        } catch (err: any) {
            const error = err.response?.data?.message
            toast.error(error?.toString() || 'Помилка реєстрації')
        }
    }

    return (
        <div className="mt-20 flex flex-col items-center justify-center">
            <h1 className="mb-10 text-4xl font-bold tracking-tight text-gray-900">
                {isLogin ? 'З поверненням!' : 'Створити акаунт'}
            </h1>

            <form
                onSubmit={isLogin ? loginHandler : registrationHandler}
                className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-[32px] border border-gray-100 bg-white p-10 shadow-2xl"
            >
                <div>
                    <label className="mb-2 ml-1 block text-sm font-bold tracking-widest text-gray-400 uppercase">
                        Email
                    </label>
                    <input
                        type="email"
                        className="w-full rounded-2xl border-3 border-gray-50 bg-gray-50 p-4 font-bold transition-all outline-none focus:border-pink-600 focus:bg-white"
                        placeholder="your@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="mb-2 ml-1 block text-sm font-bold tracking-widest text-gray-400 uppercase">
                        Пароль
                    </label>
                    <input
                        type="password"
                        className="w-full rounded-2xl border-3 border-gray-50 bg-gray-50 p-4 font-bold transition-all outline-none focus:border-pink-600 focus:bg-white"
                        placeholder="••••••••"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button className="mt-4 rounded-2xl bg-pink-600 py-4 font-bold tracking-widest text-white uppercase shadow-lg shadow-pink-200 transition-all hover:bg-pink-700 active:scale-95">
                    {isLogin ? 'Увійти' : 'Зареєструватися'}
                </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-2">
                <p className="font-medium text-gray-500">
                    {isLogin ? 'Ще не маєте акаунту?' : 'Вже є акаунт?'}
                </p>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-black tracking-widest text-pink-600 uppercase transition-colors hover:text-pink-700"
                >
                    {isLogin ? 'Створити акаунт' : 'Увійти в систему'}
                </button>
            </div>
        </div>
    )
}

export default Auth
