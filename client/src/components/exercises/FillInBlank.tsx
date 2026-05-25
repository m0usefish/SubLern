import { useState, useEffect, type FC } from 'react'
import { BiXCircle } from 'react-icons/bi'

interface FillInBlankProps {
    exercise: any
    currentAnswer: string | undefined
    isChecked: boolean
    onAnswerChange: (val: string) => void
    onCheck: () => void
}

const FillInBlank: FC<FillInBlankProps> = ({
    exercise,
    currentAnswer,
    isChecked,
    onAnswerChange,
    onCheck,
}) => {
    const [showTranslation, setShowTranslation] = useState(false)

    // Reset translation when exercise changes
    useEffect(() => {
        setShowTranslation(false)
    }, [exercise])

    return (
        <div className="mb-12 space-y-8">
            {showTranslation ? (
                <div className="animate-in fade-in slide-in-from-top-2 rounded-2xl border border-pink-100 bg-pink-50 p-6">
                    <p className="text-center text-lg font-bold text-pink-800 italic">
                        "{exercise.sentenceTranslation}"
                    </p>
                </div>
            ) : (
                exercise.sentenceTranslation && (
                    <button
                        onClick={() => setShowTranslation(true)}
                        className="mx-auto block text-sm font-black tracking-widest text-pink-600 uppercase transition-all hover:scale-105 hover:text-pink-800"
                    >
                        Показати переклад
                    </button>
                )
            )}
            <div className="flex flex-col gap-4 sm:flex-row">
                <input
                    type="text"
                    disabled={isChecked}
                    className={`w-full flex-1 rounded-2xl border-2 p-4 text-xl font-black shadow-sm transition-all focus:outline-none ${
                        isChecked
                            ? currentAnswer?.toLowerCase().trim() ===
                              exercise.correctAnswer?.toLowerCase().trim()
                                ? 'border-green-500 bg-green-50 text-green-800'
                                : 'border-red-500 bg-red-50 text-red-800'
                            : 'border-gray-100 focus:border-pink-600 focus:ring-4 focus:ring-pink-50'
                    }`}
                    placeholder="Введіть слово..."
                    value={currentAnswer || ''}
                    onChange={(e) => onAnswerChange(e.target.value)}
                />
                {!isChecked && (
                    <button
                        onClick={onCheck}
                        disabled={!currentAnswer}
                        className="w-full rounded-2xl bg-pink-600 px-8 py-4 text-lg font-black tracking-widest text-white uppercase shadow-xl shadow-pink-200 transition-all hover:bg-pink-700 active:scale-95 disabled:opacity-50 sm:w-auto"
                    >
                        Перевірити
                    </button>
                )}
            </div>
            {isChecked &&
                currentAnswer?.toLowerCase().trim() !==
                    exercise.correctAnswer?.toLowerCase().trim() && (
                    <div className="animate-in fade-in slide-in-from-top-4 flex items-center gap-4 rounded-2xl border-2 border-red-100 bg-red-50 p-6 text-red-700">
                        <BiXCircle className="h-8 w-8 shrink-0" />
                        <p className="text-lg font-bold">
                            Правильна відповідь:{' '}
                            <span className="ml-2 text-xl font-black underline decoration-double">
                                {exercise.correctAnswer}
                            </span>
                        </p>
                    </div>
                )}
        </div>
    )
}

export default FillInBlank
