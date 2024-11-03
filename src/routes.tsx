import { Suspense, lazy } from "react";
import { Route, Router, Switch } from "wouter";

import { LoadingOverlay } from "@mantine/core";
import { Custom404 } from "./components/404";
import Blogitem from "./components/blogitem";
import Blogitems from "./components/blogitems";
import Comments from "./components/comments";
import { Home } from "./components/home";

type LazyComponentT = React.LazyExoticComponent<() => JSX.Element>;

function LC(Component: LazyComponentT, loadingText = "") {
  return () => {
    return (
      // <Suspense fallback={<p>{loadingText}</p>}>
      <Suspense fallback={loadingText || <LoadingOverlay />}>
        <Component />
      </Suspense>
    );
  };
}

const OpenGraphImage = LC(
  lazy(() => import("./components/blogitem/open-graph-image")),
);
const Images = LC(lazy(() => import("./components/blogitem/images")));
const SpamSignatures = LC(lazy(() => import("./components/spam/signatures")));
const SpamPatterns = LC(lazy(() => import("./components/spam/patterns")));

export function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/plog/add" component={Blogitem} />
        <Route path="/plog/comments" component={Comments} />
        <Route path="/plog/:oid" component={Blogitem} />
        <Route path="/plog/:oid/open-graph-image" component={OpenGraphImage} />
        <Route path="/plog/:oid/images" component={Images} />
        <Route path="/plog" component={Blogitems} />
        <Route path="/spam/signatures" component={SpamSignatures} />
        <Route path="/spam/patterns" component={SpamPatterns} />
        <Route>
          <Custom404 />
        </Route>
      </Switch>
    </Router>
  );
}
