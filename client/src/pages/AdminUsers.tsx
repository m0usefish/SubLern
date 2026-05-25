import { useEffect, useState, type FC } from 'react'
import { instance } from '../api/axios.api'
import { BiCalendar, BiTime } from 'react-icons/bi'

interface UserAdminData {
    id: number
    email: string
    role: string
    streak: number
    lastActiveAt: string | null
    createdAt: string
    wordCount: number
    watchedVideos: number
}

const AdminUsers: FC = () => {
    const [users, setUsers] = useState<UserAdminData[]>([])

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const { data } = await instance.get('/user/all')
            setUsers(data)
        } catch (error) {
            console.error('Failed to fetch users', error)
        }
    }

    const formatDate = (iso: string | null | undefined) => {
        if (!iso) return 'Ніколи'
        return new Date(iso).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }


    return (
        <div className="py-6">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">
                Користувачі системи
            </h1>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-100 bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                    Користувач
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                    Статистика
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                    Дата реєстрації
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                    Остання активність
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="text-sm transition-colors hover:bg-gray-50/50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-700">
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">
                                                    {user.email}
                                                </div>
                                                <div className="text-xs font-semibold text-pink-600">
                                                    {user.role === 'ADMIN'
                                                        ? 'Адміністратор'
                                                        : 'Користувач'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500">
                                                Слова:{' '}
                                                <b className="text-gray-900">
                                                    {user.wordCount}
                                                </b>
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Відео:{' '}
                                                <b className="text-gray-900">
                                                    {user.watchedVideos}
                                                </b>
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Серія:{' '}
                                                <b className="text-gray-900">
                                                    {user.streak}
                                                </b>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <BiCalendar className="text-gray-400" />
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500">
                                        <div className="flex items-center justify-end gap-1">
                                            <BiTime className="text-gray-400" />
                                            {formatDate(user.lastActiveAt)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AdminUsers
