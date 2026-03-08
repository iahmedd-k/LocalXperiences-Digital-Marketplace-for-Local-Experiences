import ExperienceCard from './ExperienceCard.jsx'
import Spinner        from '../common/Spinner.jsx'
import EmptyState     from '../common/EmptyState.jsx'
import Pagination     from '../common/Pagination.jsx'

const ExperienceGrid = ({ experiences, isLoading, page, totalPages, onPageChange }) => {
  if (isLoading) return <Spinner size="lg" className="py-20" />

  if (!experiences?.length) return (
    <EmptyState
      icon="🔍"
      title="No experiences found"
      description="Try adjusting your search or filters"
    />
  )

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {experiences.map((exp) => <ExperienceCard key={exp._id} experience={exp} />)}
      </div>
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  )
}

export default ExperienceGrid