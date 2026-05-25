import { useState, type FC } from 'react'
import { instance } from '../api/axios.api'
import { LuBookOpen, LuLanguages, LuLayers, LuType } from 'react-icons/lu'
import { BiRefresh } from 'react-icons/bi'
import { toast } from 'react-toastify'
import Flashcard from '../components/exercises/Flashcard'
import OptionsTrainer from '../components/exercises/OptionsTrainer'
import FillInBlank from '../components/exercises/FillInBlank'

interface Exercise {
    type: 'translation' | 'article-trainer' | 'flashcards' | 'fill-in'
    question?: string
    options?: string[]
    correctAnswer?: string
    sentenceTranslation?: string
    wordObj?: {
        id: number
        word: string
        translation: string
        partOfSpeech?: string
        article?: string
        infinitive?: string
    }
}

interface ExerciseSet {
    id: number
    exercises: Exercise[]
}

const Exercises: FC = () => {
    const [exerciseSet, setExerciseSet] = useState<ExerciseSet | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState<string | null>(null)
    const [answers, setAnswers] = useState<{ [key: number]: string }>({})
    const [results, setResults] = useState<{ [key: number]: boolean } | null>(
        null,
    )
    const [score, setScore] = useState(0)

    const [isChecked, setIsChecked] = useState<{ [key: number]: boolean }>({})

    const generateExercises = async (type: string) => {
        setLoading(type)
        try {
            const response = await instance.post('/exercises/generate', {
                type,
            })
            let data = response.data
            let exercises = data.payloadJson?.exercises

            if (!exercises) {
                exercises = data.payloadJson
            }

            setExerciseSet({ id: data.id, exercises })
            setCurrentIndex(0)
            setAnswers({})
            setResults(null)
            setScore(0)
            setIsChecked({})
        } catch (error: any) {
            console.error(error)
            const msg =
                error.response?.data?.message ||
                'Не вдалося згенерувати вправи.'
            toast.error(msg)
        } finally {
            setLoading(null)
        }
    }

    const handleAnswer = (val: string) => {
        setAnswers({ ...answers, [currentIndex]: val })
    }

    const handleAnswerSelect = (opt: string) => {
        if (isChecked[currentIndex]) return
        setAnswers({ ...answers, [currentIndex]: opt })
        setIsChecked({ ...isChecked, [currentIndex]: true })
    }

    const handleFlashcardResult = (remembered: boolean) => {
        setAnswers({
            ...answers,
            [currentIndex]: remembered ? 'remembered' : 'forgot',
        })
        if (currentIndex === exerciseSet!.exercises.length - 1) {
            submit(remembered)
        } else {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const nextQuestion = () => {
        setCurrentIndex(currentIndex + 1)
    }

    const submit = async (lastFlashcardRemembered?: boolean) => {
        if (!exerciseSet) return

        let correctCount = 0
        const res: { [key: number]: boolean } = {}

        exerciseSet.exercises.forEach((ex, idx) => {
            if (ex.type === 'flashcards') {
                let ans = answers[idx]
                if (
                    idx === exerciseSet.exercises.length - 1 &&
                    lastFlashcardRemembered !== undefined
                ) {
                    ans = lastFlashcardRemembered ? 'remembered' : 'forgot'
                }
                const isCorrect = ans === 'remembered'
                res[idx] = isCorrect
                if (isCorrect) correctCount++
            } else {
                const isCorrect =
                    answers[idx]?.toLowerCase().trim() ===
                    ex.correctAnswer?.toLowerCase().trim()
                res[idx] = isCorrect
                if (isCorrect) correctCount++
            }
        })

        setScore(correctCount)
        setResults(res)

        try {
            await instance.post(`/exercises/submit/${exerciseSet.id}`, {
                score: correctCount,
                answers: answers,
            })
        } catch (e) {
            console.error('Failed to save result', e)
        }
    }

    if (!exerciseSet) {
        const modes = [
            {
                id: 'translation',
                title: 'Вибір перекладу',
                desc: 'Оберіть правильний варіант перекладу для німецького слова.',
                icon: <LuLanguages className="h-8 w-8 text-pink-500" />,
            },
            {
                id: 'fill-in',
                title: 'Заповніть пропуск',
                desc: 'Вставте правильну форму слова у речення.',
                icon: <LuType className="h-8 w-8 text-rose-500" />,
            },
            {
                id: 'flashcards',
                title: 'Картки (Flashcards)',
                desc: 'Метод карток для швидкого повторення слів.',
                icon: <LuLayers className="h-8 w-8 text-pink-600" />,
            },
            {
                id: 'article-trainer',
                title: 'Тренування артиклів',
                desc: 'Визначте правильний артикль (der, die, das) для іменника.',
                icon: <LuBookOpen className="h-8 w-8 text-rose-600" />,
            },
        ]
        return (
            <div className="mx-auto max-w-4xl py-10">
                <h1 className="mb-12 text-center text-4xl font-bold tracking-tight text-gray-900">
                    Оберіть <span className="text-pink-700">тип вправи</span>
                </h1>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {modes.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => generateExercises(mode.id)}
                            disabled={loading !== null}
                            className={`group flex items-start rounded-3xl border border-gray-100 bg-white p-8 text-left shadow-sm transition-all hover:border-pink-200 hover:shadow-xl active:scale-95 ${loading === mode.id ? 'border-pink-500 ring-4 ring-pink-100' : ''} ${loading !== null && loading !== mode.id ? 'opacity-50' : ''}`}
                        >
                            <div className="mr-6 rounded-2xl bg-pink-50 p-5 transition-colors group-hover:bg-pink-100">
                                {loading === mode.id ? (
                                    <BiRefresh className="h-8 w-8 animate-spin text-pink-600" />
                                ) : (
                                    <div className="transition-colors">
                                        {mode.icon}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="mb-2 text-2xl font-bold text-gray-900 transition-colors group-hover:text-pink-600">
                                    {mode.title}
                                </h2>
                                <p className="leading-relaxed font-medium text-gray-500">
                                    {mode.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    const currentExercise = exerciseSet.exercises[currentIndex]
    const isLast = currentIndex === exerciseSet.exercises.length - 1
    const isCurrentChecked = isChecked[currentIndex]

    return (
        <div className="mx-auto max-w-xl py-10">
            {results ? (
                <div className="animate-in zoom-in rounded-[40px] border border-gray-100 bg-white p-6 sm:p-12 text-center shadow-2xl duration-300">
                    <h2 className="mb-4 text-3xl font-black tracking-widest text-gray-900 uppercase">
                        Ваш результат
                    </h2>
                    <div className="mb-6 text-8xl font-black text-pink-600">
                        {Math.round(
                            (score / exerciseSet.exercises.length) * 100,
                        )}
                        %
                    </div>
                    <p className="mb-10 text-xl font-medium text-gray-500">
                        Ви дали{' '}
                        <span className="font-black text-pink-600">
                            {score}
                        </span>{' '}
                        правильних відповідей з{' '}
                        <span className="font-black text-gray-900">
                            {exerciseSet.exercises.length}
                        </span>
                    </p>
                    <button
                        onClick={() => setExerciseSet(null)}
                        className="w-full rounded-2xl bg-pink-600 px-8 py-4 font-black tracking-widest text-white uppercase shadow-lg shadow-pink-200 transition-all hover:bg-pink-700 active:scale-95"
                    >
                        Повернутися до меню
                    </button>
                </div>
            ) : (
                <div className="relative overflow-hidden rounded-[40px] border border-gray-100 bg-white p-6 sm:p-10 shadow-xl">
                    <div className="absolute top-0 left-0 h-2 w-full bg-gray-50">
                        <div
                            className="h-full bg-pink-600 transition-all duration-500"
                            style={{
                                width: `${(currentIndex / exerciseSet.exercises.length) * 100}%`,
                            }}
                        />
                    </div>

                    <div className="mt-4 mb-10 flex items-center justify-between">
                        <span className="text-sm font-black tracking-widest text-gray-400 uppercase">
                            Питання {currentIndex + 1} /{' '}
                            {exerciseSet.exercises.length}
                        </span>
                        <span className="rounded-xl border border-pink-100 bg-pink-50 px-4 py-1.5 text-xs font-black tracking-widest text-pink-700 uppercase">
                            {currentExercise.type === 'translation'
                                ? 'Переклад'
                                : currentExercise.type === 'fill-in'
                                  ? 'Заповнення'
                                  : currentExercise.type === 'flashcards'
                                    ? 'Картки'
                                    : 'Артиклі'}
                        </span>
                    </div>

                    {currentExercise.type === 'flashcards' ? (
                        <Flashcard
                            exercise={currentExercise}
                            onResult={handleFlashcardResult}
                        />
                    ) : (
                        <>
                            <h2 className="mb-6 text-2xl leading-tight font-black tracking-tight text-gray-900 sm:text-3xl">
                                {currentExercise.question}
                            </h2>

                            {(currentExercise.type === 'translation' ||
                                currentExercise.type === 'article-trainer') && (
                                <OptionsTrainer
                                    exercise={currentExercise}
                                    currentAnswer={answers[currentIndex]}
                                    isChecked={isCurrentChecked}
                                    onSelect={handleAnswerSelect}
                                />
                            )}

                            {currentExercise.type === 'fill-in' && (
                                <FillInBlank
                                    exercise={currentExercise}
                                    currentAnswer={answers[currentIndex]}
                                    isChecked={isCurrentChecked}
                                    onAnswerChange={handleAnswer}
                                    onCheck={() =>
                                        setIsChecked({
                                            ...isChecked,
                                            [currentIndex]: true,
                                        })
                                    }
                                />
                            )}

                            {isCurrentChecked && (
                                <div className="animate-in fade-in flex justify-end border-t border-gray-50 pt-10">
                                    <button
                                        onClick={
                                            isLast
                                                ? () => submit()
                                                : nextQuestion
                                        }
                                        className="w-full rounded-2xl bg-gray-900 px-12 py-5 font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-gray-800 active:scale-95 sm:w-auto"
                                    >
                                        {isLast
                                            ? 'Завершити вправу'
                                            : 'Наступне питання →'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Exercises
