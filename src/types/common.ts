export interface NewsItem {
  id: number
  by: string
  title: string
  score: number
  time: number
  url?: string
  text?: string
  deleted?: boolean
  descendants?: number
  kids?: number[]
}

export interface NHComment {
  id: number
  by?: string
  text?: string
  time?: number
  type: string
  kids?: number[]
  deleted?: boolean
  dead?: boolean
  replies?: NHComment[]
}
