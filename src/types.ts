export type User = {
  username: string;
  email: string;
  is_superuser: boolean;
  picture_url: string;
  csrfmiddlewaretoken: string;
};

export type CategoryT = {
  id: number;
  name: string;
};

export type BlogitemT = {
  id: number;
  oid: string;
  title: string;
  pub_date: string;
  _is_published: boolean;
  modify_date: string;
  categories: CategoryT[];
  keywords: string[];
  summary: string;
  archived: null;
  has_split: boolean;
};

export type EditBlogitemT = {
  id: number;
  oid: string;
  title: string;
  pub_date: string;
  _published?: boolean;
  text: string;
  modify_date: string;
  categories: CategoryT[];
  keywords: string[];
  summary: string;
  url: string | null;
  display_format: string;
  codesyntax: string;
  disallow_comments: boolean;
  hide_comments: boolean;
  // modify_date: string;
  open_graph_image: string | null;
  _absolute_url: string;
  archived: null | string;
};

export type BlogitemsServerData = {
  blogitems: BlogitemT[];
  count: number;
};

export type PreviewData = {
  blogitem: {
    html?: string;
    errors?: Record<string, string[]>;
  };
};

export type QueryMetaResult = {
  took_seconds: number;
  count_rows: number;
  maxed_rows: boolean;
};

export type QueryResultRowValue = string | null | number;

export type QueryResultRow = {
  [key: string]: QueryResultRowValue;
};

export type QueryResult = {
  rows: QueryResultRow[];
  meta: QueryMetaResult;
  error: string | null;
};
