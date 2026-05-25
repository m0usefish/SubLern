import { useState, useEffect, type FC } from 'react'

interface FlashcardProps {
    exercise: any
    onResult: (remembered: boolean) => void
}

const Flashcard: FC<FlashcardProps> = ({ exercise, onResult }) => {
    const [isFlipped, setIsFlipped] = useState(false)

    // Reset flip state when exercise changes
    useEffect(() => {
        setIsFlipped(false)
    }, [exercise])

    return (
        <div className="mb-8">
            <div
                className={`flex aspect-[2/1] min-h-[200px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[32px] border-4 transition-all duration-500 ${isFlipped ? 'border-pink-200 bg-pink-50 shadow-inner' : 'border-gray-100 bg-white shadow-sm hover:border-pink-100'}`}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className="w-full p-4 text-center sm:p-8">
                    {!isFlipped ? (
                        <div className="animate-in fade-in w-full duration-300">
                            <h2 className="mb-10 text-3xl font-black tracking-tight break-words text-gray-900 sm:text-4xl md:text-5xl">
                                {exercise.wordObj?.article && (
                                    <span className="mr-3 text-pink-500 opacity-50">
                                        {exercise.wordObj.article}
                                    </span>
                                )}
                                {exercise.wordObj?.word}
                            </h2>
                            <p className="text-xs font-black tracking-widest text-gray-400 uppercase sm:text-sm">
                                Натисніть, щоб побачити переклад
                            </p>
                        </div>
                    ) : (
                        <div className="aanimate-in flip-in-y w-full duration-500">
                            <h2 className="mb-4 text-2xl font-black break-words text-pink-700 sm:mb-6 sm:text-3xl md:text-4xl">
                                {exercise.wordObj?.translation}
                            </h2>
                            <div className="flex flex-col gap-2">
                                <span className="self-center rounded-full bg-pink-100 px-4 py-1 text-[10px] font-black tracking-widest text-pink-700 uppercase sm:text-xs">
                                    {exercise.wordObj?.partOfSpeech}
                                </span>
                                <p className="font-bold text-gray-500 italic">
                                    {exercise.wordObj?.infinitive ||
                                        'базова форма'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isFlipped && (
                <div className="animate-in slide-in-from-bottom-6 mt-6 flex gap-4 duration-500">
                    <button
                        onClick={() => onResult(false)}
                        className="flex-1 rounded-2xl bg-gray-100 py-3 text-sm font-black tracking-widest text-gray-600 uppercase shadow-sm transition-all hover:bg-gray-200 active:scale-95 sm:py-4 sm:text-base"
                    >
                        Не пам'ятаю
                    </button>
                    <button
                        onClick={() => onResult(true)}
                        className="flex-1 rounded-2xl bg-pink-600 py-3 text-sm font-black tracking-widest text-white uppercase shadow-lg shadow-pink-200 transition-all hover:bg-pink-700 active:scale-95 sm:py-4 sm:text-base"
                    >
                        Пам'ятаю
                    </button>
                </div>
            )}
        </div>
    )
}

export default Flashcard
