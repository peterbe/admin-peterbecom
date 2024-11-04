import type { User } from "../../whoami/types";

export const USER = ({ cookies }: { cookies?: Record<string, string> }) => {
  if (cookies && cookies.mocksessionid === "mruser") {
    const user: User = {
      username: "mruser",
      email: "user@example.com",
      is_superuser: true,
      csrfmiddlewaretoken: "00000001111111122222222233333333444444",
      picture_url: "/avatar-128.png",
    };
    return {
      is_authenticated: true,
      user,
    };
  }
  return {
    is_authenticated: false,
  };
};
