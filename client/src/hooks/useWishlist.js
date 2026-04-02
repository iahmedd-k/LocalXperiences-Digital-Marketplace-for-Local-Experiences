import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService.js'

const useWishlist = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useSelector((s) => s.auth)

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => getWishlist().then((r) => r.data.data || []),
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 60 * 5,
  })

  const wishlistIds = useMemo(
    () => new Set((wishlist || []).map((item) => String(item._id))),
    [wishlist]
  )

  const addMutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => {
      toast.success('Saved to wishlist')
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['pickedForYou'] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Could not save item')
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      toast.success('Removed from wishlist')
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['pickedForYou'] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Could not remove item')
    },
  })

  const isSaved = (id) => wishlistIds.has(String(id))

  const toggleWishlist = (id) => {
    if (!isAuthenticated) {
      toast.error('Please login to save experiences')
      return
    }

    if (isSaved(id)) removeMutation.mutate(id)
    else addMutation.mutate(id)
  }

  const isPendingFor = (id) => {
    const key = String(id)
    return (
      (addMutation.isPending && String(addMutation.variables) === key) ||
      (removeMutation.isPending && String(removeMutation.variables) === key)
    )
  }

  return {
    isAuthenticated,
    wishlist,
    isSaved,
    toggleWishlist,
    isPendingFor,
  }
}

export default useWishlist
