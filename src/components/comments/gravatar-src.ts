import { md5 } from "js-md5";
import type { Comment } from "./types";

export function gravatarSrc(comment: Comment) {
  const seed = comment.email ? md5(comment.email) : comment.oid;
  const default_ = new URL(
    `/avatar.${seed}.png`,
    "https://www.peterbe.com",
  ).toString();
  if (comment.email) {
    return `https://www.gravatar.com/avatar/${md5(
      comment.email,
    )}?d=${encodeURIComponent(default_)}&s=35`;
  }
  return default_;
}
