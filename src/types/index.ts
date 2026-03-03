export interface User {
  id: number
  username: string
}

export interface Author {
  id: number
  value: string
}

export interface Book {
  id: number
  title: string
  author_id: number | null
  country: string | null
  added_by_user_id: number | null
  added_at: string | null        // ISO date string
  status: 'to_read' | 'read' | 'removed'
  elected_poll_id: number | null
  elected_at: string | null      // ISO date string
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

export interface PollRunoffVote {
  book_id: number
  votes_count: number
}

export interface PollRunoff {
  poll_id: number
  date: string            // ISO date of the runoff stage
  total_voters: number
  votes: PollRunoffVote[]
}

export interface AwardVote {
  id: number
  year: number
  book_id: number
  liked_votes: number
  disliked_votes: number | null  // null for 2023 (no disliked question that year)
  telegram_votes: number | null  // null except 2024 Telegram final poll nominees
  is_winner: boolean
}
