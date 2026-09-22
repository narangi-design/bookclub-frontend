export type MemberVisibility = 'visible' | 'blur'

export interface Member {
  id: number
  telegram_username?: string | null
  telegram_fullname: string
}

export interface Author {
  id: number
  name: string
}

export interface Book {
  id: number
  title: string
  author_id: number | null
  country: string | null
  added_by_member_id: number | null
  added_at: string | null        // ISO date string
  status: 'to_read' | 'read' | 'removed'
  elected_poll_id: number | null
  elected_at: string | null      // ISO date string
  annotation?: string | null
  discussion_url?: string | null
  cover_url?: string | null
}

export interface Poll {
  id: number
  parent_poll_id: number | null  // null for stage 1; references stage-1 poll id for runoffs
  stage: 1 | 2
  date: string                   // ISO date string
  winner_book_id: number | null
  total_voters: number | null
}

export interface PollVote {
  id: number
  poll_id: number
  book_id: number
  votes_count: number
}

export interface AwardEvent {
  year: number
  total_voters: number | null
}

export interface AwardVote {
  id: number
  year: number
  book_id: number
  liked_votes: number
  disliked_votes: number | null      // null for 2023 (no disliked question that year)
  round2_votes: number | null        // null if the "Книга года" race had only one round
  anti_round2_votes: number | null   // null if the "Антикнига года" race had only one round
  is_winner: boolean
}

export interface SurveyMeta {
  year: number
  deadline: string           // ISO datetime string
  candidate_count: number
  is_closed: boolean
}

export interface SurveyResponse {
  favorite_book_ids: number[]
  least_favorite_book_ids: number[]
  books_read_count: number | null
  open_text: string | null
}

export interface Tiebreak {
  category: 'favorite' | 'least_favorite'
  deadline: string            // ISO datetime string
  candidate_book_ids: number[]
  resolved: boolean
}

export interface BookHistoryPollEvent {
  type: 'poll'
  session_id: number       // stage-1 poll id; stage 1 + its stage-2 runoff are one timeline point
  date: string              // ISO date string, stage1.date
  is_win: boolean
  stage1: Poll
  stage2: Poll | null
  votes: PollVote[]         // full results for every candidate in the session, both stages
}

export interface BookHistoryAwardEvent {
  type: 'award'
  year: number
  liked_votes: number
  disliked_votes: number | null
  round2_votes: number | null
  total_voters: number | null
}

export interface BookHistoryAddedEvent {
  type: 'added'
  date: string | null       // ISO date string
  added_by_member_id: number | null
}

export interface BookHistoryRemovedEvent {
  type: 'removed'
}

// Reverse-chronological order (finish → start), as returned by the API.
export type BookHistoryEvent =
  | BookHistoryRemovedEvent
  | BookHistoryAwardEvent
  | BookHistoryPollEvent
  | BookHistoryAddedEvent
