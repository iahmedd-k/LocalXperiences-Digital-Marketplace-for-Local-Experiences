import { useEffect, useRef } from 'react'

const useInfiniteScroll = (callback, hasMore) => {
  const observer = useRef(null)
  const ref = useRef(null)

  useEffect(() => {
    if (observer.current) observer.current.disconnect()
    if (!hasMore) return

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) callback()
    })

    if (ref.current) observer.current.observe(ref.current)
    return () => observer.current?.disconnect()
  }, [hasMore, callback])

  return ref
}

export default useInfiniteScroll