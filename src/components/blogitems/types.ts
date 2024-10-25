export type PageviewsByDate = {
  date: string;
  count: number;
};

export type PageviewsByOID = Map<string, PageviewsByDate[]>;
