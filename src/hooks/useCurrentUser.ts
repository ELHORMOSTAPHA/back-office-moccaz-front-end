import { useQuery } from '@tanstack/react-query'
import { getUserDetails, type User } from '@/services/userService'

export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: getUserDetails,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}
