import { useEffect, useState, type FC } from 'react'
import { BiPlay, BiChevronLeft, BiChevronRight } from 'react-icons/bi'
import { Link, useSearchParams } from 'react-router-dom'
import { instance } from '../api/axios.api'

interface Video {
    id: number
    title: string
    description: string
    level: string
    youtubeId: string
}

const Home: FC = () => {
    const [videos, setVideos] = useState<Video[]>([])
    const [filter, setFilter] = useState<string>('ALL')
    const [currentPage, setCurrentPage] = useState<number>(1)
    const itemsPerPage = 6
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''

    useEffect(() => {
        fetchVideos()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [filter, query])

    const fetchVideos = async () => {
        try {
            const { data } = await instance.get('/video')
            setVideos(data)
        } catch (error) {
            console.error('Failed to fetch videos', error)
        }
    }

    const levels = ['ALL', 'A1', 'A2', 'B1', 'B2']

    const filteredVideos = videos.filter((v) => {
        const matchesLevel = filter === 'ALL' || v.level === filter
        const matchesQuery =
            !query ||
            v.title.toLowerCase().includes(query.toLowerCase()) ||
            v.description.toLowerCase().includes(query.toLowerCase())
        return matchesLevel && matchesQuery
    })

    const totalPages = Math.ceil(filteredVideos.length / itemsPerPage)

    const paginatedVideos = filteredVideos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    )
    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter)
    }

    return (
        <div>
            <div className="mt-8 mb-8 text-center">
                <h1 className="mb-4 text-4xl font-bold text-gray-900">
                    Вивчай німецьку за{' '}
                    <span className="text-pink-700">відео</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">
                    Дивись цікавий контент, додавай слова в словник та покращуй
                    свою мову щодня.
                </p>
            </div>

            <div className="mb-5 flex flex-wrap justify-center gap-2 px-4">
                {levels.map((level) => (
                    <button
                        key={level}
                        onClick={() => handleFilterChange(level)}
                        className={`cursor-pointer rounded-full px-5 py-2 font-medium transition-all ${
                            filter === level
                                ? 'bg-pink-700 text-white shadow-md'
                                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {level === 'ALL' ? 'All Levels' : level}
                    </button>
                ))}
            </div>

            <div className="mx-auto w-full max-w-7xl px-6 py-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedVideos.map((video) => (
                        <Link
                            key={video.id}
                            to={`/video/${video.id}`}
                            className="group block"
                        >
                            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
                                <div className="relative aspect-video bg-gray-200">
                                    <img
                                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                                        alt={video.title}
                                        className="h-full w-full object-cover"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/10">
                                        <div className="rounded-full bg-white/90 p-3 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                                            <BiPlay className="ml-1 h-6 w-5 text-pink-700" />
                                        </div>
                                    </div>

                                    <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-bold text-white">
                                        {video.level}
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-pink-700">
                                        {video.title}
                                    </h3>

                                    <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-500">
                                        {video.description ?? ''}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mb-8 flex items-center justify-center gap-2">
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <BiChevronLeft className="h-6 w-6" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNumber = index + 1

                        return (
                            <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all ${
                                    currentPage === pageNumber
                                        ? 'bg-pink-700 text-white shadow-md'
                                        : 'border border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600'
                                }`}
                            >
                                {pageNumber}
                            </button>
                        )
                    })}

                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages),
                            )
                        }
                        disabled={currentPage === totalPages}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <BiChevronRight className="h-6 w-6" />
                    </button>
                </div>
            )}

            {filteredVideos.length === 0 && (
                <div className="py-20 text-center text-gray-500">
                    <p className="font-medium text-gray-400">
                        {query
                            ? `Нічого не знайдено за запитом "${query}"...`
                            : 'Відео для цього рівня поки немає...'}
                    </p>
                </div>
            )}
        </div>
    )
}

export default Home
