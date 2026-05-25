import { type FC } from 'react'
import { BiCheckCircle, BiXCircle } from 'react-icons/bi'

interface OptionsTrainerProps {
    exercise: any
    currentAnswer: string | undefined
    isChecked: boolean
    onSelect: (opt: string) => void
}

const OptionsTrainer: FC<OptionsTrainerProps> = ({
    exercise,
    currentAnswer,
    isChecked,
    onSelect,
}) => {
    return (
        <div className="mb-12">
            <div className="grid grid-cols-1 gap-4">
                {exercise.options?.map((opt: string, i: number) => (
                    <button
                        key={i}
                        onClick={() => onSelect(opt)}
                        disabled={isChecked}
                        className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-base font-bold transition-all duration-300 sm:text-lg ${
                            !isChecked
                                ? 'border-gray-100 text-gray-700 hover:border-pink-300 hover:bg-pink-50'
                                : opt === exercise.correctAnswer
                                  ? 'scale-[1.02] border-green-500 bg-green-50 text-green-700'
                                  : currentAnswer === opt
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-50 text-gray-300 opacity-40'
                        }`}
                    >
                        <span>{opt}</span>
                        {isChecked && opt === exercise.correctAnswer && (
                            <BiCheckCircle className="h-7 w-7 text-green-600" />
                        )}
                        {isChecked &&
                            currentAnswer === opt &&
                            opt !== exercise.correctAnswer && (
                                <BiXCircle className="h-7 w-7 text-red-600" />
                            )}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default OptionsTrainer
