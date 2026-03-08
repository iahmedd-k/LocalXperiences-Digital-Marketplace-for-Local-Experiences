import { useState }    from 'react'
import { useSelector } from 'react-redux'
import toast           from 'react-hot-toast'
import Avatar          from '../common/Avatar.jsx'
import Button          from '../common/Button.jsx'
import { answerQuestion } from '../../services/qnaService.js'
import { formatDate }  from '../../utils/formatters.js'
import { getErrorMessage } from '../../utils/helpers.js'

const QnAItem = ({ item, onUpdate }) => {
  const { user }   = useSelector((s) => s.auth)
  const [answer,   setAnswer]  = useState('')
  const [showForm, setShowForm]= useState(false)
  const [loading,  setLoading] = useState(false)

  const isHost = user?.role === 'host'

  const handleAnswer = async () => {
    if (!answer) return
    try {
      setLoading(true)
      await answerQuestion(item._id, { answer })
      toast.success('Answer posted!')
      setShowForm(false)
      onUpdate?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-gray-100 rounded-2xl p-5">
      {/* Question */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={item.askedBy?.name} src={item.askedBy?.profilePic} size="sm" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{item.askedBy?.name}</p>
            <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 mt-1">❓ {item.question}</p>
        </div>
      </div>

      {/* Answer */}
      {item.isAnswered ? (
        <div className="ml-9 pl-4 border-l-2 border-green-200 bg-green-50 rounded-r-xl p-3">
          <p className="text-xs font-bold text-green-600 mb-1">Host Answer</p>
          <p className="text-sm text-gray-700">{item.answer?.text}</p>
        </div>
      ) : isHost && (
        <div className="ml-9 mt-2">
          {showForm ? (
            <div className="flex gap-2">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your answer..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
              <Button size="sm" loading={loading} onClick={handleAnswer}>Post</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="text-xs text-orange-500 font-semibold hover:underline">
              + Answer this question
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default QnAItem