import { useQuery } from '@tanstack/react-query'
import { fetchUsers, fetchBooks, fetchPolls, fetchPollVotes, fetchAwardVotes, fetchPollRunoffs, fetchAuthors } from '@/api'

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: fetchUsers })
}

export function useBooks() {
  return useQuery({ queryKey: ['books'], queryFn: fetchBooks })
}

export function usePolls() {
  return useQuery({ queryKey: ['polls'], queryFn: fetchPolls })
}

export function usePollVotes() {
  return useQuery({ queryKey: ['pollVotes'], queryFn: fetchPollVotes })
}

export function useAwardVotes() {
  return useQuery({ queryKey: ['awardVotes'], queryFn: fetchAwardVotes })
}

export function usePollRunoffs() {
  return useQuery({ queryKey: ['pollRunoffs'], queryFn: fetchPollRunoffs })
}

export function useAuthors() {
  return useQuery({ queryKey: ['authors'], queryFn: fetchAuthors })
}
