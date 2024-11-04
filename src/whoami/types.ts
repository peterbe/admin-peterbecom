export type User = {
  username: string;
  email: string;
  is_superuser: boolean;
  picture_url: string;
  csrfmiddlewaretoken: string;
};

export type UserData = {
  user: null | User;
};

export type UserContext = {
  userData: UserData | null;
  userError: Error | null;
};
