import { useState } from 'react'
import Button       from '../common/Button.jsx'
import Input        from '../common/Input.jsx'

const ItineraryForm = ({ initial, onSubmit, loading }) => {
  const [form, setForm] = useState({ title: initial?.title || '', description: initial?.description || '' })

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Itinerary Name"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="e.g. Lahore Weekend Trip"
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Description (optional)</label>
        <textarea rows={3} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What's this itinerary about?"
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
        />
      </div>
      <Button loading={loading} onClick={() => onSubmit(form)} fullWidth>
        {initial ? 'Save Changes' : 'Create Itinerary'}
      </Button>
    </div>
  )
}

export default ItineraryForm