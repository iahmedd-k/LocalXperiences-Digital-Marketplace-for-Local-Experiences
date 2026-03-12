import { useState } from 'react'
import { formatShortDate } from '../../utils/formatters.js'

const AvailabilityPicker = ({ availability = [], onSelect, selected }) => {
  const available = availability.filter((a) => a.slots - a.booked > 0 && new Date(a.date) >= new Date())

  if (!available.length) return (
    <div className="text-center py-4 text-gray-500 text-sm">No available dates at the moment</div>
  )

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Select Date & Time</p>
      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
        {available.map((slot, i) => {
          const spotsLeft = slot.slots - slot.booked
          const isSelected = selected?._id === slot._id
          return (
            <button
              key={i}
              onClick={() => onSelect(slot)}
              className={`flex items-center justify-between p-3 rounded-xl border-2 text-sm transition
                ${isSelected
                  ? 'border-[#00AA6C] bg-[#E8F8F2]'
                  : 'border-gray-100 hover:border-[#C6F0DC]'}`}
            >
              <div className="text-left">
                <p className="font-semibold text-gray-800">{formatShortDate(slot.date)}</p>
                <p className="text-gray-500 text-xs">{slot.startTime}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full
                ${spotsLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AvailabilityPicker