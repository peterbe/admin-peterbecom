import { API_BASE } from "../config";

type Category = {
  id: number;
  name: string;
  count: number;
};

export type BlogitemLoaderData = {
  categories: Category[];
};

export async function loader(): Promise<BlogitemLoaderData> {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`);
  }
  return await response.json();
}
