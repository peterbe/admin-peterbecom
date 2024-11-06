import { createBrowserRouter } from "react-router-dom";
import Blogitem from "./components/blogitem";
import Blogitems from "./components/blogitems";
import Comments from "./components/comments";
import ErrorPage from "./components/error-page";
import { Home } from "./components/home";
import { Root } from "./routes/root";

const Images = () => import("./components/blogitem/images");
const SpamSignatures = () => import("./components/spam/signatures");
const SpamPatterns = () => import("./components/spam/patterns");

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
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
                  { index: true, element: <Blogitem /> },
                  {
                    path: "open-graph-image",
                    lazy: () =>
                      import("./components/blogitem/open-graph-image"),
                  },
                  {
                    path: "images",
                    lazy: Images,
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
            lazy: SpamSignatures,
          },
          {
            path: "spam/patterns",
            lazy: SpamPatterns,
          },
        ],
      },
    ],
  },
]);
