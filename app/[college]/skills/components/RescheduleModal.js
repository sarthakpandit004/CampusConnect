'use client';

export default function RescheduleModal({
  booking,
  newTimeSlot,
  setNewTimeSlot,
  onConfirm,
  onClose
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4">Reschedule Booking</h2>
        <p className="mb-2 text-gray-700">
          <strong>Skill:</strong> {booking.skillTitle}
        </p>

        <input
          type="datetime-local"
          className="w-full border p-2 rounded mb-4"
          value={newTimeSlot}
          onChange={(e) => setNewTimeSlot(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-gray-600 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Confirm New Time
          </button>
        </div>
      </div>
    </div>
  );
}
