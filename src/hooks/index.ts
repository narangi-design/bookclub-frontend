import { useQuery } from '@tanstack/react-query'
import { fetchMembers, fetchBooks, fetchPolls, fetchPollVotes, fetchAwardVotes, fetchAwardEvents, fetchAuthors } from '@/api'
import { useAuth } from '@/context/AuthContext'
import type { MemberVisibility } from '@/types'

export function useMemberVisibility(): MemberVisibility {
  const { hasToken } = useAuth()
  return hasToken ? 'visible' : 'blur'
}

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

export function useAwardEvents() {
  return useQuery({ queryKey: ['awardEvents'], queryFn: fetchAwardEvents })
}

export function useAuthors() {
  return useQuery({ queryKey: ['authors'], queryFn: fetchAuthors })
}
