import { useState, useEffect, type FC } from 'react'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import { instance } from '../api/axios.api'
import { toast } from 'react-toastify'

interface Video {
    id: number
    title: string
    description: string
    level: string
    youtubeId: string
}

const AdminVideos: FC = () => {
    const [videos, setVideos] = useState<Video[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [isEditing, setIsEditing] = useState(false)
    const [editingVideoId, setEditingVideoId] = useState<number | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 'A1',
        youtubeId: '',
    })

    const [subtitleFile, setSubtitleFile] = useState<File | null>(null)

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            const { data } = await instance.get('/video')
            setVideos(data)
        } catch (error) {
            console.error('Failed to fetch videos', error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Ви впевнені, що хочете видалити це відео?')) return
        try {
            await instance.delete(`/video/${id}`)
            setVideos(videos.filter((v) => v.id !== id))
        } catch (error) {
            console.error('Failed to delete video', error)
            toast.error('Не вдалося видалити відео')
        }
    }

    const openEditModal = (video: Video) => {
        setIsEditing(true)
        setEditingVideoId(video.id)
        setFormData({
            title: video.title,
            description: video.description,
            level: video.level,
            youtubeId: video.youtubeId,
        })
        setSubtitleFile(null)
        setIsModalOpen(true)
    }

    const openCreateModal = () => {
        setIsEditing(false)
        setEditingVideoId(null)
        setFormData({ title: '', description: '', level: 'A1', youtubeId: '' })
        setSubtitleFile(null)
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isEditing && editingVideoId) {
                await instance.patch(`/video/${editingVideoId}`, {
                    title: formData.title,
                    description: formData.description,
                    level: formData.level,
                    youtubeId: formData.youtubeId,
                })
                if (subtitleFile) {
                    const data = new FormData()
                    data.append('file', subtitleFile)
                    data.append('videoId', String(editingVideoId))
                    await instance.post('/subtitles/upload', data, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    })
                }
                toast.success('Відео успішно оновлено!')
            } else {
                const response = await instance.post('/video', formData)
                const newVideoId = response.data.id

                if (subtitleFile) {
                    const data = new FormData()
                    data.append('file', subtitleFile)
                    data.append('videoId', newVideoId)
                    await instance.post('/subtitles/upload', data, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    })
                    toast.success(
                        'Відео успішно створено' +
                            (subtitleFile ? ' з субтитрами!' : '!'),
                    )
                }

                fetchVideos()
                setIsModalOpen(false)
                setFormData({
                    title: '',
                    description: '',
                    level: 'A1',
                    youtubeId: '',
                })
                setSubtitleFile(null)
                setIsEditing(false)
                setEditingVideoId(null)
            }
        } catch (error) {
            console.error(error)
            toast.error(
                `Не вдалося ${isEditing ? 'оновити' : 'створити'} відео або завантажити субтитри`,
            )
        }
    }

    return (
        <div className="py-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Керування відео
                </h1>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center rounded-xl bg-pink-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-pink-700 active:scale-95"
                >
                    <BiPlus className="mr-2 h-5 w-5" /> Додати відео
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-100 bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                    Назва
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                    YouTube ID
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                    Рівень
                                </th>

                                <th className="py-4 pl-8 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                    Дії
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {videos.map((video) => (
                                <tr
                                    key={video.id}
                                    className="transition-colors hover:bg-gray-50/50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">
                                            {video.title}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="font-mono text-sm text-gray-500">
                                            {video.youtubeId}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-2.5 py-1 text-xs font-bold text-pink-700">
                                            {video.level}
                                        </span>
                                    </td>

                                    <td className="flex items-center justify-end gap-2 px-6 py-4 text-right">
                                        <button
                                            onClick={() => openEditModal(video)}
                                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                                        >
                                            <BiEdit className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(video.id)
                                            }
                                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                                        >
                                            <BiTrash className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
                    <div className="animate-in fade-in zoom-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {isEditing ? 'Редагувати відео' : 'Нове відео'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div>
                                <label className="mb-1 block text-sm font-bold text-gray-700">
                                    Назва
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-pink-500"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-bold text-gray-700">
                                    Опис
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-pink-500"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-bold text-gray-700">
                                    YouTube ID
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-pink-500"
                                    value={formData.youtubeId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            youtubeId: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-bold text-gray-700">
                                    Файл субтитрів (.srt)
                                </label>
                                <input
                                    type="file"
                                    accept=".srt"
                                    className="w-full text-sm text-gray-500 transition-all file:mr-4 file:rounded-xl file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-700 hover:file:bg-pink-100"
                                    onChange={(e) =>
                                        setSubtitleFile(
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-bold text-gray-700">
                                    Рівень
                                </label>
                                <select
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-pink-500"
                                    value={formData.level}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            level: e.target.value,
                                        })
                                    }
                                >
                                    <option value="A1">A1</option>
                                    <option value="A2">A2</option>
                                    <option value="B1">B1</option>
                                    <option value="B2">B2</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 font-semibold text-gray-600 transition-all hover:bg-gray-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-pink-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-pink-200 transition-all hover:bg-pink-700 active:scale-95"
                                >
                                    {isEditing ? 'Зберегти' : 'Створити'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminVideos
