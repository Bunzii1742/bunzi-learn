import React, { useState, useEffect } from 'react'
import { format, addDays, isToday } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

const SPACED_INTERVALS = [1, 3, 7, 14, 30]

export default function App() {
  const [lessons, setLessons] = useState([])
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [tag, setTag] = useState('')
  const [link, setLink] = useState('')
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('lessons')
    if (stored) setLessons(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem('lessons', JSON.stringify(lessons))
  }, [lessons])

  const addLesson = () => {
    const newLesson = {
      id: uuidv4(),
      title,
      note,
      tag,
      link,
      createdAt: new Date().toISOString(),
      status: 'not reviewed',
      reviews: 0,
      nextReview: addDays(new Date(), 1).toISOString(),
    }
    setLessons([newLesson, ...lessons])
    setTitle('')
    setNote('')
    setTag('')
    setLink('')
  }

  const markReviewed = (id) => {
    setLessons(lessons.map(l => {
      if (l.id === id) {
        const nextInterval = SPACED_INTERVALS[Math.min(l.reviews + 1, SPACED_INTERVALS.length - 1)]
        return { ...l, status: 'reviewed', reviews: l.reviews + 1, nextReview: addDays(new Date(), nextInterval).toISOString() }
      }
      return l
    }))
  }

  const resetReview = (id) => {
    setLessons(lessons.map(l =>
      l.id === id ? { ...l, status: 'not reviewed', reviews: 0, nextReview: addDays(new Date(), 1).toISOString() } : l
    ))
  }

  const deleteLesson = (id) => {
    setLessons(lessons.filter(l => l.id !== id))
  }

  const todayLessons = lessons.filter(l => isToday(new Date(l.nextReview)))
  const filteredLessons = lessons.filter(l =>
    (filterTag === '' || l.tag.toLowerCase().includes(filterTag.toLowerCase())) &&
    (l.title.toLowerCase().includes(search.toLowerCase()) || l.note.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-4 max-w-4xl mx-auto font-[Quicksand] bg-yellow-50 dark:bg-sky-900 min-h-screen text-slate-800 dark:text-slate-100">
      <h1 className="text-center text-4xl font-bold text-yellow-500 dark:text-yellow-300 mb-6">🍋 Lemon Learn 🍋</h1>

      <div className="bg-white dark:bg-sky-800 shadow-md rounded-2xl p-4 space-y-2">
        <input className="w-full rounded-xl p-2" placeholder="📘 Tên bài học" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="w-full rounded-xl p-2" placeholder="📝 Ghi chú" value={note} onChange={e => setNote(e.target.value)} />
        <input className="w-full rounded-xl p-2" placeholder="🔗 Link bài giảng" value={link} onChange={e => setLink(e.target.value)} />
        <input className="w-full rounded-xl p-2" placeholder="🏷️ Chủ đề" value={tag} onChange={e => setTag(e.target.value)} />
        <button className="w-full rounded-xl bg-yellow-400 hover:bg-yellow-300 text-white font-semibold py-2" onClick={addLesson}>🌟 Lưu bài học</button>
      </div>

      <h2 className="text-2xl mt-6 font-bold text-yellow-500 dark:text-yellow-300">📅 Bài cần ôn hôm nay</h2>
      {todayLessons.length === 0 && <p>Không có bài cần ôn hôm nay 🎉</p>}
      {todayLessons.map(l => (
        <div key={l.id} className="bg-green-50 dark:bg-green-900 border border-green-300 dark:border-green-600 rounded-xl p-4 mt-2">
          <h3 className="font-semibold text-lg">{l.title}</h3>
          <p className="text-sm">{l.tag}</p>
          <p>{l.note}</p>
          {l.link && <a href={l.link} target="_blank" className="text-blue-500 underline">🔗 Xem bài</a>}
          <div className="flex gap-2 mt-2">
            <button onClick={() => markReviewed(l.id)} className="rounded-full px-3 py-1 bg-green-400 hover:bg-green-500 text-white">✅ Đã ôn</button>
            <button onClick={() => resetReview(l.id)} className="rounded-full px-3 py-1 bg-yellow-300 hover:bg-yellow-400">🔁 Ôn lại</button>
            <button onClick={() => deleteLesson(l.id)} className="rounded-full px-3 py-1 bg-red-400 hover:bg-red-500 text-white">🗑 Xoá</button>
          </div>
        </div>
      ))}
    </div>
  )
}
