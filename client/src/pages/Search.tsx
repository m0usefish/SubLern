import { useState, type FC } from 'react'
import { instance } from '../api/axios.api'
import {
    BiSearch,
    BiPlayCircle,
    BiInfoCircle,
    BiChevronLeft,
    BiChevronRight,
} from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'

interface SearchResult {
    id: number
    text: string
    startMs: number
    endMs: number
    video: {
        id: number
        title: string
        youtubeId: string
    }
}

interface TranslationInfo {
    clickedWord?: string
    contextualTranslation?: string
    lemma?: string
    lemmaTranslation?: string
    partOfSpeech?: string
    article?: string
    grammaticalForm?: string
}

const Search: FC = () => {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<SearchResult[]>([])
    const [translation, setTranslation] = useState<TranslationInfo | null>(null)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const itemsPerPage = 6
    const navigate = useNavigate()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        try {
            const response = await instance.get(
                `/subtitles/search?query=${query}`,
            )
            setResults(response.data.matches)
            setTranslation(response.data.translationInfo)
            setCurrentPage(1) 
        } catch (error) {
            console.error('Search failed', error)
        } finally {
            setLoading(false)
        }
    }

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) return text
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <mark
                            key={i}
                            className="rounded bg-pink-100 px-1 font-black text-pink-700"
                        >
                            {part}
                        </mark>
                    ) : (
                        part
                    ),
                )}
            </span>
        )
    }

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const totalPages = Math.ceil(results.length / itemsPerPage)
    const paginatedResults = results.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    )

    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <h1 className="mb-10 text-center text-4xl font-black tracking-tight text-gray-900">
                Пошук у <span className="text-pink-600">відео</span>
            </h1>

            <form onSubmit={handleSearch} className="group relative mb-12">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Яке слово ви шукаєте?"
                    className="w-full rounded-[28px] border-4 border-gray-50 bg-white py-4 pr-32 pl-14 text-lg font-bold shadow-xl transition-all outline-none placeholder:text-gray-300 focus:border-pink-600 focus:ring-8 focus:ring-pink-50"
                />
                <BiSearch className="absolute top-1/2 left-5 h-6 w-6 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-pink-600" />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-xl bg-pink-600 px-6 py-2 text-sm font-black tracking-widest text-white uppercase shadow-md shadow-pink-200 transition-all hover:bg-pink-700 active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Пошук...' : 'Знайти'}
                </button>
            </form>

            {translation && (
                <div className="animate-in slide-in-from-top-4 mx-auto mb-10 max-w-2xl overflow-hidden rounded-[24px] border border-pink-100 bg-white shadow-xl duration-500">
                    <div className="flex items-center gap-2 border-b border-pink-100 bg-pink-50 px-6 py-3 text-pink-700">
                        <BiInfoCircle className="h-5 w-5" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                            Результат аналізу
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="mb-3 flex flex-wrap items-baseline gap-4">
                            <h2 className="text-3xl font-black tracking-tight text-gray-900">
                                {translation.article && (
                                    <span className="mr-2 font-bold text-pink-500 opacity-40">
                                        {translation.article}
                                    </span>
                                )}
                                {translation.lemma ||
                                    translation.clickedWord ||
                                    query}
                            </h2>
                            <span className="rounded-full bg-pink-600 px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase">
                                {translation.partOfSpeech || 'Слово'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                                Переклад:
                            </span>
                            <p className="text-xl font-bold text-gray-800 italic">
                                {translation.lemmaTranslation ||
                                    translation.contextualTranslation}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {results.length > 0 ? (
                    <>
                        <p className="mb-4 ml-2 text-sm font-black tracking-widest text-gray-400 uppercase">
                            Знайдено {results.length} результатів
                        </p>
                        {paginatedResults.map((res) => (
                            <div
                                key={res.id}
                                onClick={() =>
                                    navigate(
                                        `/video/${res.video.id}?t=${res.startMs}`,
                                    )
                                }
                                className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl active:scale-[0.98]"
                            >
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div className="flex-grow">
                                        <div className="mb-2 flex items-center gap-3">
                                            <div className="rounded-lg bg-pink-100 p-1.5 text-pink-600">
                                                <BiPlayCircle className="h-5 w-5" />
                                            </div>
                                            <h3 className="line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-pink-600">
                                                {res.video.title}
                                            </h3>
                                            <span className="rounded bg-gray-100 px-2 py-1 font-mono text-[10px] font-black text-gray-500">
                                                {formatTime(res.startMs)}
                                            </span>
                                        </div>
                                        <p className="ml-1 text-base leading-relaxed font-medium text-gray-600 italic">
                                            "{highlightText(res.text, query)}"
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center justify-end">
                                        <span className="translate-x-4 rounded-lg bg-pink-50 px-4 py-1.5 text-xs font-black tracking-widest text-pink-600 uppercase opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                                            Дивитись →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2 pt-8">
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <BiChevronLeft className="h-6 w-6" />
                                </button>

                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                    {Array.from({ length: totalPages }).map(
                                        (_, index) => {
                                            const pageNumber = index + 1
                                           
                                            if (
                                                totalPages > 7 &&
                                                pageNumber > 2 &&
                                                pageNumber < totalPages - 1 &&
                                                Math.abs(
                                                    pageNumber - currentPage,
                                                ) > 1
                                            ) {
                                                if (
                                                    pageNumber === 3 ||
                                                    pageNumber ===
                                                        totalPages - 2
                                                ) {
                                                    return (
                                                        <span
                                                            key={pageNumber}
                                                            className="px-1 text-gray-400"
                                                        >
                                                            ...
                                                        </span>
                                                    )
                                                }
                                                return null
                                            }
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            pageNumber,
                                                        )
                                                    }
                                                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all ${
                                                        currentPage ===
                                                        pageNumber
                                                            ? 'bg-pink-600 text-white shadow-md shadow-pink-200'
                                                            : 'border border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            )
                                        },
                                    )}
                                </div>

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
                    </>
                ) : (
                    query &&
                    !loading && (
                        <div className="rounded-[40px] border-4 border-dashed border-gray-100 bg-gray-50 py-32 text-center">
                            <p className="text-2xl font-black tracking-widest text-gray-300 uppercase">
                                Нічого не знайдено
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

export default Search
