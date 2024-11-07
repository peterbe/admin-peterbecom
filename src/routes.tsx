import { createBrowserRouter } from "react-router-dom"
import Blogitem from "./components/blogitem"
import Blogitems from "./components/blogitems"
import Comments from "./components/comments"
import ErrorPage from "./components/error-page"
import { Home } from "./components/home"
import { loader as rootLoader } from "./loaders/root"
import { Root } from "./routes/root"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    id: "root",
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Home />, loader: rootLoader },
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
                ],
              },
              { index: true, element: <Blogitems /> },
              { path: "add", element: <Blogitem /> },
              { path: "comments", element: <Comments /> },
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
        ],
      },
    ],
  },
])
