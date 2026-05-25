import { useEffect, useState, type FC } from 'react'
import { instance } from '../api/axios.api'
import {
    BiTrash,
    BiSearch,
    BiSortAlt2,
    BiFilterAlt,
    BiChevronLeft,
    BiChevronRight,
} from 'react-icons/bi'
import { BiChevronDown, BiFilter } from 'react-icons/bi'

interface VocabularyWord {
    id: number
    word: string
    translation: string
    partOfSpeech: string
    article: string
    infinitive: string
    correctAttempts: number
    incorrectAttempts: number
}

const Vocabulary: FC = () => {
    const [words, setWords] = useState<VocabularyWord[]>([])
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<'word' | 'id'>('id')


    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [selectedPOS, setSelectedPOS] = useState<string[]>([])
    const [filterStatus, setFilterStatus] = useState<string>('All')
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)

    const [currentPage, setCurrentPage] = useState<number>(1)
    const itemsPerPage = 10

    useEffect(() => {
        fetchVocabulary()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [search, selectedPOS, filterStatus, sortBy])

    const fetchVocabulary = async () => {
        try {
            const { data } = await instance.get('/vocabulary')
            setWords(data)
        } catch (error) {
            console.error('Failed to fetch vocabulary', error)
        }
    }

    const deleteWord = async (id: number) => {
        if (!confirm('Ви впевнені, що хочете видалити це слово?')) return
        try {
            await instance.delete(`/vocabulary/${id}`)
            setWords(words.filter((w) => w.id !== id))
        } catch (error) {
            console.error('Failed to delete word', error)
        }
    }

    const filteredWords = words
        .filter((word) => {
            const matchesSearch =
                word.word.toLowerCase().includes(search.toLowerCase()) ||
                word.translation.toLowerCase().includes(search.toLowerCase())

            const matchesPOS =
                selectedPOS.length === 0 ||
                selectedPOS.includes(word.partOfSpeech ?? '')

            let matchesStatus = true
            const isNew =
                (word.correctAttempts || 0) === 0 &&
                (word.incorrectAttempts || 0) === 0
            const isLearned = (word.correctAttempts || 0) >= 6
            const isLearning = !isNew && !isLearned

            if (filterStatus === 'New') matchesStatus = isNew
            if (filterStatus === 'Learning') matchesStatus = isLearning
            if (filterStatus === 'Learned') matchesStatus = isLearned

            return matchesSearch && matchesPOS && matchesStatus
        })
        .sort((a, b) => {
            if (sortBy === 'word') {
                return a.word.localeCompare(b.word)
            }

            return b.id - a.id
        })

    const totalPages = Math.ceil(filteredWords.length / itemsPerPage)
    const paginatedWords = filteredWords.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    )

    const uniquePOS = Array.from(
        new Set(words.map((w) => w.partOfSpeech).filter(Boolean)),
    ) as string[]

    const togglePOS = (pos: string) => {
        setSelectedPOS((prev) =>
            prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
        )
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                    <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">
                        Мій <span className="text-pink-700">Словник</span>
                    </h1>
                    <p className="font-medium text-gray-500">
                        У вас збережено{' '}
                        <span className="font-bold text-pink-600">
                            {words.length}
                        </span>{' '}
                        слів для вивчення.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Пошук слів..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-2xl border border-gray-100 bg-white py-2.5 pr-4 pl-10 font-medium shadow-sm transition-all outline-none focus:ring-4 focus:ring-pink-50 sm:w-64"
                        />
                        <BiSearch className="absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    </div>
                    {uniquePOS.length > 0 && (
                        <div className="relative inline-block">
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen((prev) => !prev)}
                                className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 focus:ring-4 focus:ring-pink-50 focus:outline-none"
                            >
                                <BiFilter className="h-4 w-4 text-gray-400" />
                                {selectedPOS.length > 0
                                    ? `Типи: ${selectedPOS.length}`
                                    : 'Всі типи'}
                                <BiChevronDown className="h-4 w-4 text-gray-400" />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                                    <div className="py-2">
                                        {uniquePOS.map((pos) => (
                                            <label
                                                key={pos}
                                                className="flex cursor-pointer items-center px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-pink-50"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="mr-3 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                                    checked={selectedPOS.includes(
                                                        pos,
                                                    )}
                                                    onChange={() =>
                                                        togglePOS(pos)
                                                    }
                                                />
                                                {pos}
                                            </label>
                                        ))}

                                        {selectedPOS.length > 0 && (
                                            <div className="mt-1 border-t border-gray-100 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPOS([])
                                                        setIsFilterOpen(false)
                                                    }}
                                                    className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                                                >
                                                    Очистити фільтри
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <div className="relative inline-block">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsStatusFilterOpen((prev) => !prev)
                                }
                                className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 focus:ring-4 focus:ring-pink-50 focus:outline-none"
                            >
                                <BiFilterAlt className="h-4 w-4 text-gray-400" />
                                {filterStatus === 'New'
                                    ? 'Нові'
                                    : filterStatus === 'Learning'
                                      ? 'В процесі'
                                      : filterStatus === 'Learned'
                                        ? 'Вивчені'
                                        : 'Всі статуси'}
                                <BiChevronDown className="h-4 w-4 text-gray-400" />
                            </button>

                            {isStatusFilterOpen && (
                                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                                    <div className="py-2">
                                        {[
                                            {
                                                value: 'All',
                                                label: 'Всі статуси',
                                            },
                                            { value: 'New', label: 'Нові' },
                                            {
                                                value: 'Learning',
                                                label: 'В процесі',
                                            },
                                            {
                                                value: 'Learned',
                                                label: 'Вивчені',
                                            },
                                        ].map((status) => (
                                            <label
                                                key={status.value}
                                                className="flex cursor-pointer items-center px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-pink-50"
                                            >
                                                <input
                                                    type="radio"
                                                    name="statusFilter"
                                                    className="mr-3 h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                                                    checked={
                                                        filterStatus ===
                                                        status.value
                                                    }
                                                    onChange={() => {
                                                        setFilterStatus(
                                                            status.value,
                                                        )
                                                        setIsStatusFilterOpen(
                                                            false,
                                                        )
                                                    }}
                                                />
                                                {status.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() =>
                                setSortBy(sortBy === 'word' ? 'id' : 'word')
                            }
                            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50"
                        >
                            <BiSortAlt2 className="h-5 w-5" />
                            {sortBy === 'word' ? 'A-Z' : 'Нові'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {paginatedWords.map((word) => (
                    <div
                        key={word.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white px-6 py-4 shadow-sm transition-all hover:border-pink-100 hover:shadow-md"
                    >
                        <div className="flex items-center gap-6">
                            <div>
                                <div className="mb-1 flex items-center gap-3">
                                    <h3 className="text-xl leading-tight font-black text-gray-900">
                                        {word.article && (
                                            <span
                                                className={`mr-1.5 font-bold opacity-60 ${
                                                    word.article.toLowerCase() ===
                                                    'die'
                                                        ? 'text-pink-500'
                                                        : word.article.toLowerCase() ===
                                                            'der'
                                                          ? 'text-blue-500'
                                                          : word.article.toLowerCase() ===
                                                              'das'
                                                            ? 'text-green-500'
                                                            : 'text-gray-500'
                                                }`}
                                            >
                                                {word.article}
                                            </span>
                                        )}
                                        {word.word}
                                    </h3>
                                    <span className="rounded border border-pink-100 bg-pink-50 px-2 py-0.5 text-[10px] font-black tracking-widest text-pink-600 uppercase">
                                        {word.partOfSpeech}
                                    </span>
                                </div>
                                <p className="text-lg font-medium text-gray-500 italic">
                                    {word.translation}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    {(word.correctAttempts || 0) === 0 &&
                                        (word.incorrectAttempts || 0) === 0 && (
                                            <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-black tracking-widest text-blue-600 uppercase">
                                                Нове
                                            </span>
                                        )}
                                    {((word.correctAttempts || 0) > 0 ||
                                        (word.incorrectAttempts || 0) > 0) &&
                                        (word.correctAttempts || 0) < 6 && (
                                            <span className="rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-black tracking-widest text-amber-600 uppercase">
                                                В процесі (
                                                {word.correctAttempts || 0}/6)
                                            </span>
                                        )}
                                    {(word.correctAttempts || 0) >= 6 && (
                                        <span className="rounded-md border border-green-100 bg-green-50 px-2 py-1 text-[10px] font-black tracking-widest text-green-600 uppercase">
                                            Вивчене
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                                onClick={() => deleteWord(word.id)}
                                className="rounded-xl p-2.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                            >
                                <BiTrash className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredWords.length === 0 && (
                    <div className="rounded-[40px] border-4 border-dashed border-gray-100 bg-gray-50 py-24 text-center">
                        <p className="text-xl font-bold text-gray-400">
                            Слів не знайдено...
                        </p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <BiChevronLeft className="h-6 w-6" />
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-1">
                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                        ).map((pageNumber) => {
                      
                            if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 1 &&
                                    pageNumber <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() =>
                                            setCurrentPage(pageNumber)
                                        }
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all ${
                                            currentPage === pageNumber
                                                ? 'bg-pink-600 text-white shadow-md shadow-pink-200'
                                                : 'border border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                )
                            } else if (
                                pageNumber === currentPage - 2 ||
                                pageNumber === currentPage + 2
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
                        })}
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
        </div>
    )
}

export default Vocabulary
