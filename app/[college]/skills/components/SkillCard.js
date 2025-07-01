'use client';

import React from 'react';

export default function SkillCard({
  skill,
  session,
  isOwner,
  editing,
  form,
  onEdit,
  onDelete,
  onRequest,
  onBook,
  onChange,
  onSave,
  onCancel
}) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition">
      {editing ? (
        <>
          <input
            type="text"
            className="border p-2 mb-2 rounded w-full"
            placeholder="Title"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
          />
          <textarea
            className="border p-2 mb-2 rounded w-full"
            placeholder="Description"
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
          />
          <select
            className="border p-2 mb-2 rounded w-full"
            value={form.duration}
            onChange={(e) => onChange({ ...form, duration: e.target.value })}
          >
            <option value="">Select Duration</option>
            <option value="15 mins">15 mins</option>
            <option value="30 mins">30 mins</option>
            <option value="1 hour">1 hour</option>
          </select>
          <select
            className="border p-2 mb-2 rounded w-full"
            value={form.category}
            onChange={(e) => onChange({ ...form, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="Programming">Programming</option>
            <option value="Web Development">Web Development</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Aptitude">Aptitude</option>
            <option value="Notes">Notes</option>
          </select>

          <div className="flex gap-3 mt-2">
            <button onClick={() => onSave(skill.id)} className="text-sm text-green-600 hover:underline">Save</button>
            <button onClick={onCancel} className="text-sm text-gray-600 hover:underline">Cancel</button>
          </div>
        </>
      ) : (
        <>
          <h4 className="text-lg font-bold text-gray-800">{skill.title}</h4>
          <p className="text-gray-600">{skill.description}</p>
          <p className="text-sm text-gray-500 mt-1">⏱ {skill.duration}</p>
          <p className="text-sm mt-2 text-indigo-600 font-medium">📚 Category: {skill.category || 'Uncategorized'}</p>
          <p className="text-sm text-gray-500 mt-1">🧑‍🎓 Posted by: {skill.userEmail || 'Unknown'}</p>

          {/* Media Preview */}
          {skill.mediaUrl && skill.mediaType === 'video' && (
            <video src={skill.mediaUrl} controls className="mt-4 w-full rounded shadow-sm" />
          )}

          {skill.mediaUrl && skill.mediaType === 'pdf' && (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(skill.mediaUrl)}&embedded=true`}
              className="w-full mt-4 rounded border"
              height={300}
            />
          )}

          {isOwner ? (
            <div className="flex gap-3 mt-3">
              <button onClick={() => onEdit(skill)} className="text-sm text-blue-600 hover:underline">Edit</button>
              <button onClick={() => onDelete(skill.id)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <button
                onClick={() => onRequest(skill)}
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded"
              >
                Request to Learn
              </button>
              <button
                onClick={() => onBook(skill)}
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded"
              >
                📅 Book Session
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
