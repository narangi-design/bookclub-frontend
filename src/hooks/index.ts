import { useQuery } from '@tanstack/react-query'
import { fetchMembers, fetchBooks, fetchPolls, fetchPollVotes, fetchAwardVotes, fetchAuthors } from '@/api'

export function useMembers() {
  return useQuery({ queryKey: ['members'], queryFn: fetchMembers })
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

export function useAuthors() {
  return useQuery({ queryKey: ['authors'], queryFn: fetchAuthors })
}
