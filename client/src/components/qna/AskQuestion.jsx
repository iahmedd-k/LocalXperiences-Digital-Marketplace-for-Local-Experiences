import { useState }   from 'react'
import { useSelector } from 'react-redux'
import { Link }       from 'react-router-dom'
import toast          from 'react-hot-toast'
import { askQuestion } from '../../services/qnaService.js'
import { getErrorMessage } from '../../utils/helpers.js'
import Button         from '../common/Button.jsx'

const AskQuestion = ({ experienceId, onSuccess }) => {
  const { isAuthenticated } = useSelector((s) => s.auth)
  const [question, setQuestion] = useState('')
  const [loading,  setLoading]  = useState(false)

  if (!isAuthenticated) return (
    <p className="text-sm text-gray-500">
      <Link to="/login" className="text-orange-500 font-semibold hover:underline">Sign in</Link> to ask a question
    </p>
  )

  const handleSubmit = async () => {
    if (!question.trim()) return
    try {
      setLoading(true)
      await askQuestion({ experienceId, question })
      toast.success('Question posted!')
      setQuestion('')
      onSuccess?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask the host a question..."
        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
      />
      <Button size="sm" loading={loading} onClick={handleSubmit}>Ask</Button>
    </div>
  )
}

export default AskQuestion