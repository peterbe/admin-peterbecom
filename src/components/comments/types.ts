type CommentBlogitem = {
  id: number;
  oid: string;
  title: string;
  _absolute_url: string;
};

export type LocationT = {
  city: string;
  continent_code: string;
  continent_name: string;
  country_code: string;
  country_name: string;
  latitude: number;
  longitude: number;
  postal_code: string | null;
  region: string | null;
  time_zone: string;
};

export type Clues = {
  good: { [key: string]: string };
  bad: { [key: string]: string };
};

type InlineCommentClassification = {
  classification: string;
};

export type Comment = {
  id: number;
  oid: string;
  add_date: string;
  age_seconds: number;
  approved: boolean;
  auto_approved: boolean;
  blogitem: CommentBlogitem;
  comment: string;
  email: string;
  name: string;
  location: LocationT | null;
  max_add_date: string;
  modify_date: string;
  page: number;
  rendered: string;
  replies: Comment[];
  user_agent: string;
  user_other_comments_count: number;
  _absolute_url: string;
  _bumped: boolean;
  _clues: Clues;
  gravatar_url: string;
  classification: InlineCommentClassification | null;
};

export type CommentsServerData = {
  comments: Comment[];
  count: number;
  oldest: string;
};

export type Classification = {
  id: number;
  text: string;
  classification: string;
  add_date: string;
  modify_date: string;
};
