import { useState, type FC } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { BiLogOut, BiSearch, BiMenu, BiX } from 'react-icons/bi'
import logo from '../assets/logo.png'
import { useAuth } from '../hooks/useAuth'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '../store/hooks'
import { logout } from '../store/user/userSlice'
import { removeTokenFromLocalStorage } from '../helpers/localstorage.helper'
import { toast } from 'react-toastify'

const Header: FC = () => {
    const isAuth = useAuth()
    const user = useAppSelector((state) => state.user.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        if (val) {
            navigate(`/?q=${encodeURIComponent(val)}`)
        } else {
            navigate('/')
        }
    }

    const logoutHandler = () => {
        dispatch(logout())
        removeTokenFromLocalStorage('token')
        toast.success('Ви успішно вийшли з акаунта')
        navigate('/')
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-white/30 bg-white/40 shadow-sm backdrop-blur-xl">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="flex shrink-0 items-center gap-2 text-2xl font-bold"
                        >
                            <img
                                src={logo}
                                alt="img"
                                className="relative top-1 -mr-13 -ml-13 h-auto w-40 object-contain"
                            />
                            <span className="hidden sm:inline">SubLern</span>
                        </Link>

                        <div className="relative hidden lg:block">
                            <input
                                type="text"
                                placeholder="Шукати відео..."
                                value={query}
                                onChange={handleSearchChange}
                                className="w-48 rounded-full border border-white/40 bg-white/50 py-1.5 pr-4 pl-10 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-md transition-all placeholder:text-gray-400 focus:border-pink-300 focus:bg-white/70 focus:ring-4 focus:ring-pink-50 focus:outline-none xl:w-64"
                            />
                            <BiSearch className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden text-gray-500 hover:text-pink-600 focus:outline-none"
                    >
                        {isMobileMenuOpen ? <BiX className="h-7 w-7" /> : <BiMenu className="h-7 w-7" />}
                    </button>

                    {/* Desktop Menu */}
                    <div className="hidden items-center space-x-6 lg:flex">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `transform text-base font-medium ${
                                    isActive
                                        ? 'scale-105 text-pink-700'
                                        : 'text-gray-700 hover:scale-105 hover:text-pink-700'
                                }`
                            }
                        >
                            Відео
                        </NavLink>

                        {isAuth ? (
                            <>
                                <NavLink
                                    to="/search"
                                    className={({ isActive }) =>
                                        `transform text-base font-medium transition-colors ${
                                            isActive
                                                ? 'scale-105 text-pink-700'
                                                : 'text-gray-700 hover:scale-105 hover:text-pink-700'
                                        }`
                                    }
                                >
                                    Пошук
                                </NavLink>
                                <NavLink
                                    to="/vocabulary"
                                    className={({ isActive }) =>
                                        `transform text-base font-medium transition-colors ${
                                            isActive
                                                ? 'scale-105 text-pink-700'
                                                : 'text-gray-700 hover:scale-105 hover:text-pink-700'
                                        }`
                                    }
                                >
                                    Словник
                                </NavLink>
                                <NavLink
                                    to="/exercises"
                                    className={({ isActive }) =>
                                        `transform text-base font-medium transition-colors ${
                                            isActive
                                                ? 'scale-105 text-pink-700'
                                                : 'text-gray-700 hover:scale-105 hover:text-pink-700'
                                        }`
                                    }
                                >
                                    Вправи
                                </NavLink>
                                <NavLink
                                    to="/profile"
                                    className={({ isActive }) =>
                                        `transform text-base font-medium transition-colors ${
                                            isActive
                                                ? 'scale-105 text-pink-700'
                                                : 'text-gray-700 hover:scale-105 hover:text-pink-700'
                                        }`
                                    }
                                >
                                    Профіль
                                </NavLink>

                                {user?.role === 'ADMIN' && (
                                    <NavLink
                                        to="/admin"
                                        className={({ isActive }) =>
                                            `transform text-base font-medium transition-colors ${
                                                isActive
                                                    ? 'scale-105 text-pink-700'
                                                    : 'text-pink-600 hover:scale-105'
                                            }`
                                        }
                                    >
                                        Панель адміна
                                    </NavLink>
                                )}

                                <button
                                    onClick={logoutHandler}
                                    className="flex cursor-pointer items-center text-base font-medium text-gray-500 transition-colors hover:text-red-600"
                                >
                                    <BiLogOut className="mr-1 h-4 w-4" />
                                    Вийти
                                </button>
                            </>
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    to="/auth"
                                    className="rounded-lg bg-pink-600 px-4 py-2 text-base font-medium text-white shadow-sm transition-all hover:bg-pink-700"
                                >
                                    Увійти / Реєстрація
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-white/30 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-4 shadow-lg absolute w-full left-0 z-50">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Шукати відео..."
                            value={query}
                            onChange={(e) => {
                                handleSearchChange(e)
                                setIsMobileMenuOpen(false)
                            }}
                            className="w-full rounded-full border border-white/40 bg-white/50 py-2 pr-4 pl-10 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-md transition-all placeholder:text-gray-400 focus:border-pink-300 focus:bg-white/70 focus:ring-4 focus:ring-pink-50 focus:outline-none"
                        />
                        <BiSearch className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="flex flex-col space-y-4">
                        <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-base font-medium ${isActive ? 'text-pink-700' : 'text-gray-700'}`}>Відео</NavLink>
                        {isAuth ? (
                            <>
                                <NavLink to="/search" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-base font-medium ${isActive ? 'text-pink-700' : 'text-gray-700'}`}>Пошук</NavLink>
                                <NavLink to="/vocabulary" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-base font-medium ${isActive ? 'text-pink-700' : 'text-gray-700'}`}>Словник</NavLink>
                                <NavLink to="/exercises" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-base font-medium ${isActive ? 'text-pink-700' : 'text-gray-700'}`}>Вправи</NavLink>
                                <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-base font-medium ${isActive ? 'text-pink-700' : 'text-gray-700'}`}>Профіль</NavLink>
                                {user?.role === 'ADMIN' && (
                                    <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-base font-medium ${isActive ? 'text-pink-700' : 'text-pink-600'}`}>Панель адміна</NavLink>
                                )}
                                <button onClick={() => { logoutHandler(); setIsMobileMenuOpen(false); }} className="flex w-full items-center text-base font-medium text-gray-500 hover:text-red-600 pt-2 border-t border-gray-100"><BiLogOut className="mr-1 h-4 w-4" />Вийти</button>
                            </>
                        ) : (
                            <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg bg-pink-600 px-4 py-2 text-center text-base font-medium text-white shadow-sm hover:bg-pink-700 mt-2">Увійти / Реєстрація</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Header
