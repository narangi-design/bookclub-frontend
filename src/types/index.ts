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

export interface AwardVote {
  id: number
  year: number
  book_id: number
  liked_votes: number
  disliked_votes: number | null  // null for 2023 (no disliked question that year)
  round2_votes: number | null    // null if award had only one round
  is_winner: boolean
}
