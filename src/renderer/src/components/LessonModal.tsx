import React, { useState } from 'react'
import type { Lesson } from '../services/lessons'

interface LessonModalProps {
  lessons: Lesson[]
  onLoadStarter: (lesson: Lesson) => void
  onClose: () => void
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lessons,
  onLoadStarter,
  onClose
}) => {
  const [selected, setSelected] = useState<Lesson>(lessons[0])

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-gray-850 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl flex overflow-hidden"
        style={{ backgroundColor: '#1a1f2e', maxHeight: '80vh' }}>

        {/* Lesson list sidebar */}
        <div className="w-52 border-r border-gray-700 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-sm font-bold text-white">📚 Lessons</h2>
          </div>
          <div className="flex-1 overflow-auto py-2">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setSelected(lesson)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selected.id === lesson.id
                    ? 'bg-indigo-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-base">{lesson.emoji}</div>
                <div className="text-xs font-medium mt-0.5">{lesson.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Lesson content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700 flex-shrink-0">
            <h1 className="text-lg font-bold text-white">
              {selected.emoji} {selected.title}
            </h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl leading-none transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-auto px-6 py-4 space-y-5">
            {/* Goal */}
            <div className="bg-indigo-900 bg-opacity-40 border border-indigo-700 rounded-lg px-4 py-3">
              <div className="text-xs text-indigo-300 font-semibold uppercase mb-1">What you'll learn</div>
              <p className="text-sm text-indigo-100">{selected.goal}</p>
            </div>

            {/* Explanation */}
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase mb-2">How it works</div>
              <p className="text-sm text-gray-300 leading-relaxed">{selected.explanation}</p>
            </div>

            {/* Challenge */}
            <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg px-4 py-3">
              <div className="text-xs text-green-300 font-semibold uppercase mb-1">🎯 Your Challenge</div>
              <p className="text-sm text-green-100">{selected.challenge}</p>
            </div>

            {/* Hints */}
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase mb-2">💡 Hints (try without first!)</div>
              <ol className="list-decimal list-inside space-y-1">
                {selected.hints.map((hint, i) => (
                  <li key={i} className="text-sm text-gray-400">{hint}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-700 flex gap-3 flex-shrink-0">
            <button
              onClick={() => { onLoadStarter(selected); onClose() }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded font-medium transition-colors"
            >
              Load starter blocks
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
