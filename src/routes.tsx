import { Suspense, lazy } from "react";
import { Route, Router, Switch } from "wouter";

import { Custom404 } from "./components/404";
import { Home } from "./components/home";

type LazyComponentT = React.LazyExoticComponent<() => JSX.Element>;

function LC(Component: LazyComponentT, loadingText = "Loading") {
  return () => {
    return (
      <Suspense fallback={<p>{loadingText}</p>}>
        <Component />
      </Suspense>
    );
  };
}

const Blogitems = LC(lazy(() => import("./components/blogitems")));
const Blogitem = LC(lazy(() => import("./components/blogitem")));

export function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        {/* <Route path="/plog" nest>
          <Route path="/add" component={Blogitem} />
          <Route path="/:oid" component={Blogitem} />
          <Route path="/" component={Blogitems} />
        </Route> */}
        <Route path="/plog" component={Blogitems} nest>
          <Route path="/add" component={Blogitem} />
          <Route path="/:oid" component={Blogitem} />
          {/* <Route path="/" /> */}
        </Route>

        <Route>
          <Custom404 />
        </Route>
      </Switch>
    </Router>
  );
}
