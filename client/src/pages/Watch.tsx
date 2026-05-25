import { useEffect, useRef, useState, type FC } from 'react'
import YouTube, { type YouTubeEvent } from 'react-youtube'
import { instance } from '../api/axios.api'
import { useParams, useSearchParams } from 'react-router-dom'
import { BiBookOpen, BiPlus, BiX } from 'react-icons/bi'
import { toast } from 'react-toastify'

interface Cue {
    id: number
    startMs: number
    endMs: number
    text: string
}

interface Video {
    id: number
    title: string
    description: string
    youtubeId: string
    cues: Cue[]
}

interface SelectedWordData {
    word: string
    x: number
    y: number
    loading?: boolean
    clickedWord?: string
    contextualTranslation?: string
    lemma?: string
    lemmaTranslation?: string
    partOfSpeech?: string
    article?: string
    grammaticalForm?: string
}

const Watch: FC = () => {
    const { id } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const timeParam = searchParams.get('t')

    const [video, setVideo] = useState<Video | null>(null)

    const [activeCue, setActiveCue] = useState<Cue | null>(null)
    const [isCompleted, setIsCompleted] = useState(false)

    const playerRef = useRef<any>(null)
    const transcriptRef = useRef<HTMLDivElement>(null)

    const [selectedWord, setSelectedWord] = useState<SelectedWordData | null>(
        null,
    )

    useEffect(() => {
        fetchVideo()
    }, [id])

    // Track active cue based on current time
    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current) {
                try {
                    const time = playerRef.current.getCurrentTime()
                    const currentMs = Math.floor(time * 1000)

                    if (video && video.cues) {
                        const cue = video.cues.find(
                            (c) =>
                                currentMs >= c.startMs && currentMs < c.endMs,
                        )
                        if (cue !== activeCue) {
                            setActiveCue(cue || null)
                        }
                    }
                } catch (e) {
                    
                }
            }
        }, 100)
        return () => clearInterval(interval)
    }, [video, activeCue])

    // Scroll active cue into view
    useEffect(() => {
        if (activeCue && transcriptRef.current) {
            const activeElement = document.getElementById(`cue-${activeCue.id}`)
            if (activeElement) {
                const container = transcriptRef.current
                const offsetTop = activeElement.offsetTop
                const elementHeight = activeElement.offsetHeight
                const containerHeight = container.clientHeight

                container.scrollTo({
                    top: offsetTop - containerHeight / 2 + elementHeight / 2,
                    behavior: 'smooth',
                })
            }
        }
    }, [activeCue])

    const fetchVideo = async () => {
        try {
            const { data } = await instance.get(`/video/${id}`)
            setVideo(data)

            const progressRes = await instance.get('/progress')
            const prog = progressRes.data.find(
                (p: any) => p.video.id === Number(id),
            )
            if (prog && prog.completed) {
                setIsCompleted(true)
            }
        } catch (error) {
            console.error('Failed to fetch video', error)
        }
    }

    const updateVideoProgress = async (completed: boolean) => {
        try {
            await instance.post('/progress', {
                videoId: Number(id),
                completed,
            })
            if (completed) setIsCompleted(true)
        } catch (error) {
            console.error('Failed to update progress', error)
        }
    }


    const handleStateChange = (event: YouTubeEvent) => {
      
        if (event.data === 1 && !isCompleted) {
            updateVideoProgress(false)
        }
        if (event.data === 0) {
            updateVideoProgress(true)
        }
    }


    const initialStartTime = timeParam
        ? Math.floor(Number(timeParam) / 1000)
        : undefined

    const handleReady = (event: YouTubeEvent) => {
        playerRef.current = event.target
    }

    const handleWordClick = async (
        word: string,
        context: string,
        e: React.MouseEvent,
    ) => {
        e.stopPropagation()

        const target = e.target as HTMLElement
        const rect = target.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const topY = rect.top

        const cleanWord = word.replace(/[.,!?;:"'()]/g, '')
        setSelectedWord({
            word: cleanWord,
            x: centerX,
            y: topY,
            loading: true,
        })

        try {
            const response = await instance.post('/vocabulary/translate', {
                word: cleanWord,
                contextSentence: context,
            })
            setSelectedWord((prev) =>
                prev ? { ...prev, loading: false, ...response.data } : null,
            )
        } catch (error) {
            console.error('Translation failed', error)
            setSelectedWord((prev) =>
                prev ? { ...prev, loading: false } : null,
            )
        }
    }

    const addToDictionary = async () => {
        if (!selectedWord || selectedWord.loading) return
        try {
            await instance.post('/vocabulary', {
                word: selectedWord.lemma || selectedWord.word,
                translation:
                    selectedWord.lemmaTranslation ||
                    selectedWord.contextualTranslation,
                partOfSpeech: selectedWord.partOfSpeech,
                article: selectedWord.article,
                infinitive: selectedWord.lemma,
            })
            toast.success('Слово додано до словника!')
            setSelectedWord(null)
        } catch (e: any) {
            if (e.response?.status === 409) {
                toast.warning('Це слово вже є у вашому словнику!')
                setSelectedWord(null)
            } else {
                console.error(e)
                toast.error('Не вдалося додати слово')
            }
        }
    }


    if (!video) return <div>Відео не знайдено</div>

    const cues = video.cues || []
    return (
        <div className="mt-10 grid grid-cols-1 gap-6 pb-6 lg:grid-cols-3 lg:items-start">
            {/* Video Player */}
            <div className="flex flex-col lg:col-span-2">
                <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-black shadow-lg">
                    <YouTube
                        videoId={video.youtubeId}
                        opts={{
                            height: '100%',
                            width: '100%',
                            playerVars: {
                                autoplay: 1,
                                modestbranding: 1,
                                origin: window.location.origin,
                                start:
                                    initialStartTime !== undefined &&
                                    initialStartTime > 0
                                        ? initialStartTime
                                        : undefined,
                            },
                        }}
                        onReady={handleReady}
                        onStateChange={handleStateChange}
                        className="h-full w-full"
                    />
                </div>
                <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {video.title}
                    </h1>
                    <p className="mt-2 text-gray-700">{video.description}</p>
                </div>
            </div>
            {/* Transcript Sidebar */}
            <div className="sticky top-24 flex h-[50vh] lg:h-[calc(100vh-120px)] flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm lg:col-span-1">
                <div className="shrink-0 border-b border-gray-100 bg-gray-50 p-4">
                    <h2 className="flex items-center font-bold text-gray-700">
                        <BiBookOpen className="mr-2 h-5 w-5" /> Transcript
                    </h2>
                </div>

                <div
                    ref={transcriptRef}
                    className="relative min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-4"
                >
                    {cues.map((cue) => {
                   
                        const isActive = activeCue?.id === cue.id
                        return (
                            <div
                                key={cue.id}
                                id={`cue-${cue.id}`}
                                onClick={() =>
                                    playerRef.current?.seekTo(
                                        cue.startMs / 1000,
                                        true,
                                    )
                                }
                                className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 ${
                                    isActive
                                        ? 'border-l-4 border-pink-700 bg-pink-100'
                                        : 'text-gray-600 hover:bg-pink-50'
                                }`}
                            >
                                <div className="flex flex-wrap gap-x-1.5 gap-y-1">
                                    {cue.text.split(' ').map((word, i) => (
                                        <span
                                            key={i}
                                            onClick={(e) =>
                                                handleWordClick(
                                                    word,
                                                    cue.text,
                                                    e,
                                                )
                                            }
                                            className={`rounded px-0.5 transition-colors ${
                                                isActive
                                                    ? 'hover:bg-white/20'
                                                    : 'hover:bg-pink-100 hover:text-pink-700'
                                            }`}
                                        >
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Translation Popup */}
            {selectedWord && (
                <div
                    className="animate-in fade-in zoom-in-95 fixed z-[100] max-w-[calc(100vw-20px)] sm:w-72 rounded-3xl border border-pink-100 bg-white p-6 shadow-2xl duration-200"
                    style={{
                        left: `${Math.max(10, Math.min(selectedWord.x - 144, window.innerWidth - 300))}px`,
                        top: `${selectedWord.y - 10}px`,
                        transform: 'translateY(-100%)',
                    }}
                >
                    <button
                        onClick={() => setSelectedWord(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-pink-600"
                    >
                        <BiX className="h-5 w-5" />
                    </button>

                    {selectedWord.loading ? (
                        <div className="flex flex-col items-center py-4">
                            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-3 border-pink-100 border-t-pink-600" />
                            <span className="text-[10px] font-black tracking-widest text-pink-600 uppercase">
                                Переклад...
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="mb-4">
                                <div className="mb-1 flex items-center gap-2">
                                    <h2 className="text-xl font-black tracking-tight text-gray-900">
                                        {selectedWord.article && (
                                            <span className="mr-1 font-bold text-pink-500 opacity-40">
                                                {selectedWord.article}
                                            </span>
                                        )}
                                        {selectedWord.lemma ||
                                            selectedWord.word}
                                    </h2>
                                    <span className="rounded border border-pink-100 bg-pink-50 px-2 py-0.5 text-[10px] font-black tracking-widest text-pink-700 uppercase">
                                        {selectedWord.partOfSpeech}
                                    </span>
                                </div>
                                <p className="mb-4 text-lg leading-tight font-bold text-gray-500 italic">
                                    {selectedWord.lemmaTranslation ||
                                        selectedWord.contextualTranslation}
                                </p>

                                {selectedWord.clickedWord && (
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 shadow-inner">
                                        <div className="mb-1 flex items-center justify-between gap-2">
                                            <span className="font-bold text-gray-700">
                                                {selectedWord.clickedWord}
                                            </span>
                                            {selectedWord.grammaticalForm && (
                                                <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">
                                                    {
                                                        selectedWord.grammaticalForm
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium text-gray-600">
                                            {selectedWord.contextualTranslation}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={addToDictionary}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-pink-200 transition-all hover:bg-pink-700 active:scale-95"
                            >
                                <BiPlus className="h-4 w-4" /> До словника
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Watch
