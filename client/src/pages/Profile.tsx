import { useEffect, useState, type FC } from 'react'
import { instance } from '../api/axios.api'
import { BiBookOpen, BiPlayCircle, BiUser, BiCheckDouble } from 'react-icons/bi'
import { LuCalendarDays, LuFlame } from 'react-icons/lu'
import { useAppSelector } from '../store/hooks'

interface VocabularyWord {
    id: number
}

interface VideoProgress {
    id: number
    lastTime: number
    completed: boolean
}

interface ExerciseHistory {
    id: number
    score: number
    submittedAt: string
    exerciseSet: {
        payloadJson: {
            exercises: Array<{ type: string }>
        }
    }
}

interface ProfileStats {
    email: string
    role: string
    streak: number
    lastActiveAt: string | null
    createdAt: string
    wordCount: number
    watchedVideos: number
}

const Profile: FC = () => {
    const user = useAppSelector((state) => state.user.user)
    const [stats, setStats] = useState<ProfileStats | null>(null)
    const [wordCount, setWordCount] = useState<number>(0)
    const [watchedCount, setWatchedCount] = useState<number>(0)
    const [exerciseCount, setExerciseCount] = useState<number>(0)
    const [averageScore, setAverageScore] = useState<number>(0)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            await instance.post('/user/ping')
        } catch (e) {
            console.error('Failed to update streak', e)
        }

        const [profileRes, dictRes, progressRes, historyRes] =
            await Promise.allSettled([
                instance.get('/user/profile'),
                instance.get('/vocabulary'),
                instance.get('/progress'),
                instance.get('/exercises/history'),
            ])

        if (profileRes.status === 'fulfilled') {
            const profileData = profileRes.value.data as ProfileStats
            setStats(profileData)
            setWatchedCount(profileData.watchedVideos)
            setWordCount(profileData.wordCount)
        } else {
            console.error('Failed to fetch profile stats', profileRes.reason)
        }

        if (
            dictRes.status === 'fulfilled' &&
            profileRes.status !== 'fulfilled'
        ) {
            setWordCount((dictRes.value.data as VocabularyWord[]).length)
        }

        if (
            progressRes.status === 'fulfilled' &&
            profileRes.status !== 'fulfilled'
        ) {
            const allProgress = progressRes.value.data as VideoProgress[]
            setWatchedCount(
                allProgress.filter((p) => p.lastTime > 0 || p.completed).length,
            )
        }

        if (historyRes.status === 'fulfilled') {
            const historyData = historyRes.value.data as ExerciseHistory[]
            setExerciseCount(historyData.length)

            const sortedHistory = [...historyData].sort(
                (a, b) =>
                    new Date(b.submittedAt).getTime() -
                    new Date(a.submittedAt).getTime(),
            )
            const last30 = sortedHistory.slice(0, 30)

            if (last30.length > 0) {
                let totalPercentage = 0
                last30.forEach((item) => {
                    const totalQuestions =
                        item.exerciseSet?.payloadJson?.exercises?.length || 10
                    const percentage = (item.score / totalQuestions) * 100
                    totalPercentage += percentage
                })
                setAverageScore(Math.round(totalPercentage / last30.length))
            }
        }
    }

    const formatDate = (iso: string | null | undefined) => {
        if (!iso) return '—'
        return new Date(iso).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }

    const getInitials = (email: string) =>
        email?.split('@')[0]?.slice(0, 2).toUpperCase() ?? 'U'

    const streakMilestone = (streak: number) => {
        if (streak >= 30)
            return {
                label: 'Легенда',
                color: 'text-pink-700 bg-pink-50 border-pink-200',
            }
        if (streak >= 14)
            return {
                label: 'Експерт',
                color: 'text-rose-600 bg-rose-50 border-rose-200',
            }
        if (streak >= 7)
            return {
                label: 'Добре!',
                color: 'text-pink-600 bg-pink-50 border-pink-200',
            }
        return {
            label: 'Починаємо',
            color: 'text-gray-500 bg-gray-50 border-gray-200',
        }
    }

    const milestone = streakMilestone(stats?.streak ?? 0)
    const streakProgress = Math.min(((stats?.streak ?? 0) / 30) * 100, 100)

    return (
        <div className="mx-auto max-w-2xl px-4">
            <h1 className="mt-10 mb-10 text-4xl font-bold text-gray-900">
                Мій <span className="text-pink-700">профіль</span>
            </h1>

            <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="h-24 bg-gradient-to-r from-pink-500 to-rose-500" />

                <div className="px-6 pb-6">
                    <div className="-mt-10 mb-4 flex items-end justify-between">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-pink-600 text-2xl font-bold text-white shadow select-none">
                            {stats ? (
                                getInitials(stats.email)
                            ) : (
                                <BiUser className="h-8 w-8" />
                            )}
                        </div>
                        <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${milestone.color}`}
                        >
                            {milestone.label}
                        </span>
                    </div>

                    <h2 className="mb-1 text-xl font-bold text-gray-900">
                        {stats?.email ?? user?.email}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                stats?.role === 'ADMIN'
                                    ? 'border-pink-200 bg-pink-50 text-pink-700'
                                    : 'border-gray-100 bg-gray-50 text-gray-700'
                            }`}
                        >
                            <BiUser className="h-3 w-3" />
                            {stats?.role === 'ADMIN'
                                ? 'Адміністратор'
                                : 'Користувач'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <LuCalendarDays className="h-3 w-3" />З{' '}
                            {formatDate(stats?.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-orange-500">
                        <LuFlame className="h-4 w-4" />
                        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                            Серія
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {stats?.streak ?? 0}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">
                        {(stats?.streak ?? 0) === 1
                            ? 'день'
                            : (stats?.streak ?? 0) < 5 &&
                                (stats?.streak ?? 0) > 0
                              ? 'дні'
                              : 'днів'}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-pink-500">
                        <BiBookOpen className="h-4 w-4" />
                        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                            Слова
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {wordCount}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">
                        у словнику
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-rose-500">
                        <BiPlayCircle className="h-4 w-4" />
                        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                            Відео
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {watchedCount}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">
                        переглянуто
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-indigo-500">
                        <BiCheckDouble className="h-4 w-4" />
                        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                            Вправи
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {exerciseCount}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">виконано</div>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                            🔥 Прогрес серії
                        </span>
                        <span className="text-sm font-bold text-pink-600">
                            {stats?.streak ?? 0} / 30 днів
                        </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 transition-all duration-700"
                            style={{ width: `${streakProgress}%` }}
                        />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-400">
                        <span>0</span>
                        <span>7 🔥</span>
                        <span>14 ⚡</span>
                        <span>30 🏆</span>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                            🎯 Середній результат
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                            {averageScore}%
                        </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 transition-all duration-700"
                            style={{ width: `${averageScore}%` }}
                        />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-400">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
