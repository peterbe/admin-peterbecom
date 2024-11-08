export type Category = {
  id: number
  name: string
  count: number
  modify_date: string
}

export type ServerData = {
  categories: Category[]
}
