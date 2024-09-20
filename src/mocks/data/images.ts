import { HttpResponse } from "msw";
import type { ImageT } from "../../hooks/use-images";

const UPLOADED_IMAGES: Record<string, ImageT[]> = {
  "hello-world": [],
};
export const IMAGES = (slug: string | readonly string[]) => {
  if (typeof slug !== "string")
    return new HttpResponse("Not Found", { status: 404 });

  const images = UPLOADED_IMAGES[slug];
  if (images) {
    return HttpResponse.json({ images });
  }

  return new HttpResponse("Not Found", { status: 404 });
};

export const OPEN_GRAPH_IMAGE = (slug: string | readonly string[]) => {
  if (typeof slug !== "string")
    return new HttpResponse("Not Found", { status: 404 });

  if (slug === "hello-world") {
    return HttpResponse.json({ images: [] });
  }

  return new HttpResponse("Not Found", { status: 404 });
};
