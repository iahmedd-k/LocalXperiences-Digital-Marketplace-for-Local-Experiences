import { useQuery }    from '@tanstack/react-query'
import { getQnA }      from '../../services/qnaService.js'
import QnAItem         from './QnAItem.jsx'
import AskQuestion     from './AskQuestion.jsx'
import Spinner         from '../common/Spinner.jsx'

const QnAList = ({ experienceId }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['qna', experienceId],
    queryFn:  () => getQnA(experienceId).then((r) => r.data.data),
  })

  return (
    <div>
      <h3 className="font-clash text-xl font-bold text-gray-900 mb-4">Questions & Answers</h3>
      <div className="mb-5">
        <AskQuestion experienceId={experienceId} onSuccess={refetch} />
      </div>
      {isLoading ? <Spinner className="py-6" /> : (
        <div className="flex flex-col gap-3">
          {data?.length ? data.map((q) => <QnAItem key={q._id} item={q} onUpdate={refetch} />) : (
            <p className="text-gray-400 text-sm">No questions yet — ask the host anything!</p>
          )}
        </div>
      )}
    </div>
  )
}

export default QnAList