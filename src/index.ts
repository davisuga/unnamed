import {
  Controller,
  ReqWithQuery,
  HttpMethod,
  ReqMap,
  RequestHandler,
  RouteMap,
  ToController,
  UnnamedAPI,
  ReqWithParams,
  FancyReq,
} from "./types.ts";

import { parse } from "https://esm.sh/teki";
import { pathToRegexp } from "https://esm.sh/path-to-regexp";
import { memoize, parseQuery } from "./lib/utils.ts";

const defaultResponse = () =>
  Promise.resolve(new Response(new TextEncoder().encode("It's working!")));

const defaultRouteMap: RouteMap = {
  GET: {
    "/": defaultResponse,
  },
};

const addQueryParams = <T extends { url: string }>(
  req: T
): T & { query: Record<string, unknown> } => {
  const { search } = new URL(req.url);
  return Object.assign(req, { query: parseQuery(search) });
};

/**
 * Creates a controller from any function that returns serializable stuff
 * @param reqHandler A function that returns what will be transformed into a response and sent to the user
 */
// @ts-expect-error It will return a Response anyway
const toController: ToController =
  (reqHandler?: RequestHandler) => async (req: Request) => {
    if (!reqHandler) {
      return defaultResponse();
    }
    const result = await reqHandler(addQueryParams(req) as ReqWithQuery);
    if (!result) {
      return new Response();
    }
    // deno-lint-ignore no-prototype-builtins
    if (Response.prototype.isPrototypeOf(result)) {
      return result;
    }
    if (typeof result === "number" || typeof result === "boolean") {
      return new Response(result.toString());
    }
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

type App = () => UnnamedAPI;

const matchRoute = memoize(
  (pathname: keyof ReqMap, reqMap?: ReqMap): RequestHandler => {
    if (!reqMap) return defaultResponse;

    const reqestMapEntry = Object.entries(reqMap).find(([path]) => {
      return pathToRegexp(path).test(pathname.toString());
    });

    if (!reqestMapEntry) return () => defaultResponse();
    const [path, handler] = reqestMapEntry;
    const paramParser = parse(path.toString());
    console.log({ url: pathname.toString() });

    return (req: ReqWithParams) => {
      return handler({
        ...req,
        params: paramParser(`http://localhost${pathname.toString()}`),
      } as FancyReq);
    };
  }
);

const buildHandler =
  (routeMap: RouteMap): Controller =>
  (req: Request) => {
    const method = req.method as HttpMethod;
    const { pathname } = new URL(req.url);

    console.log("got: ", { method, pathname, routeMap });
    const requestMap = routeMap[method];
    const reqHandler = matchRoute(pathname, requestMap);
    const controller = toController(reqHandler);
    return controller ? controller(req) : defaultResponse();
  };

const App = (currentRouteMap: RouteMap = defaultRouteMap) => {
  const handler = buildHandler(currentRouteMap);

  const buildMethodHandler = (method: HttpMethod) => (reMap: ReqMap) =>
    App({
      ...currentRouteMap,
      [method]: { ...currentRouteMap[method], ...reMap },
    });

  const init = async (options: Deno.ListenOptions = { port: 4500 }) => {
    const listener = Deno.listen(options);
    for await (const conn of listener) {
      for await (const { respondWith, request } of Deno.serveHttp(conn)) {
        const r = await handler(request);
        await respondWith(r);
      }
    }
  };

  const onDelete = buildMethodHandler("DELETE");
  const onPut = buildMethodHandler("PUT");
  const onGet = buildMethodHandler("GET");
  const onPost = buildMethodHandler("POST");

  return {
    init,
    onPost,
    onGet,
    onDelete,
    onPut,
    routeMap: currentRouteMap,
  };
};

export default App;
export * from "./types.ts";
