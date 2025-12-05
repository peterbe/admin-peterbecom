import { createBrowserRouter } from "react-router"
import Blogitem from "./components/blogitem"
import Blogitems from "./components/blogitems"
import Comments from "./components/comments"
import ErrorPage from "./components/error-page"
import { Home } from "./components/home"
import { Root } from "./routes/root"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    id: "root",
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Home /> },
          {
            path: "plog",
            children: [
              {
                path: ":oid",
                children: [
                  {
                    index: true,
                    element: <Blogitem />,
                  },
                  {
                    path: "open-graph-image",
                    lazy: () =>
                      import("./components/blogitem/open-graph-image"),
                  },
                  {
                    path: "images",
                    lazy: () => import("./components/blogitem/images"),
                  },
                  {
                    path: "videos",
                    lazy: () => import("./components/blogitem/videos"),
                  },
                ],
              },
              { index: true, element: <Blogitems /> },
              { path: "add", element: <Blogitem /> },
              { path: "comments", element: <Comments /> },
              {
                path: "categories",
                lazy: () => import("./components/categories"),
              },
            ],
          },
          {
            path: "spam/signatures",
            lazy: () => import("./components/spam/signatures"),
          },
          {
            path: "spam/patterns",
            lazy: () => import("./components/spam/patterns"),
          },
          {
            path: "cdn",
            lazy: () => import("./components/cdn"),
          },
          {
            path: "analytics/query",
            lazy: () => import("./components/analytics/query"),
          },
          {
            path: "analytics/charts",
            lazy: () => import("./components/analytics/charts"),
          },
        ],
      },
    ],
  },
])
