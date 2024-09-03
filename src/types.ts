export type User = {
  username: string;
  email: string;
  is_superuser: boolean;
  picture_url: string;
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
};

export type EditBlogitemT = {
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
};

export type BlogitemsServerData = {
  blogitems: BlogitemT[];
  count: number;
};
