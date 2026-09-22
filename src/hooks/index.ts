import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchMembers, fetchBooks, fetchPolls, fetchPollVotes, fetchAwardVotes, fetchAwardEvents, fetchAuthors,
  fetchSurveyMeta, fetchSurveyCandidates, fetchSurveyResponse, submitSurveyResponse,
  fetchSurveyOpenTexts, fetchTiebreaks, fetchTiebreakVote, submitTiebreakVote,
} from '@/api'
import { useAuth } from '@/context/AuthContext'
import type { MemberVisibility, SurveyResponse, Tiebreak } from '@/types'

export { usePageTitle } from './usePageTitle'

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

export function useSurveyMeta() {
  return useQuery({ queryKey: ['surveyMeta'], queryFn: fetchSurveyMeta })
}

export function useSurveyCandidates() {
  return useQuery({ queryKey: ['surveyCandidates'], queryFn: fetchSurveyCandidates })
}

export function useSurveyResponse() {
  const { isAuthed } = useAuth()
  return useQuery({ queryKey: ['surveyResponse'], queryFn: fetchSurveyResponse, enabled: isAuthed })
}

export function useSubmitSurveyResponse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SurveyResponse) => submitSurveyResponse(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['surveyResponse'] }),
  })
}

export function useSurveyOpenTexts() {
  return useQuery({ queryKey: ['surveyOpenTexts'], queryFn: fetchSurveyOpenTexts })
}

export function useTiebreaks() {
  return useQuery({ queryKey: ['tiebreaks'], queryFn: fetchTiebreaks })
}

export function useTiebreakVote(category: Tiebreak['category']) {
  const { isAuthed } = useAuth()
  return useQuery({ queryKey: ['tiebreakVote', category], queryFn: () => fetchTiebreakVote(category), enabled: isAuthed })
}

export function useSubmitTiebreakVote(category: Tiebreak['category']) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookId: number) => submitTiebreakVote(category, bookId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tiebreakVote', category] }),
  })
}
