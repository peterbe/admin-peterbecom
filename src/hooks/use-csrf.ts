import { useQuery } from "@tanstack/react-query";

type WhoAmI = {
  user: {
    csrfmiddlewaretoken: string;
  };
};
export function useCsrf() {
  const { data, error } = useQuery<WhoAmI>({
    queryKey: ["whoami"],
    queryFn: async () => {
      const response = await fetch("/api/v0/whoami");
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return response.json();
    },
  });

  if (error) {
    throw error;
  }

  return data?.user.csrfmiddlewaretoken;
}
