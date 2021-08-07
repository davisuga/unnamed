import {
  Controller,
  FancyReq,
  HttpMethod,
  ReqMap,
  RequestHandler,
  RouteMap,
  ToController,
  UnnamedAPI,
} from "./types.ts";
import { parseQuery } from "./utils.js";

const defaultResponse = () =>
  Promise.resolve(new Response(new TextEncoder().encode("It's working!")));

const defaultRouteMap: RouteMap = {
  GET: {
    "/": defaultResponse,
  },
};

const fancifyRequest = (req: Request): FancyReq => {
  const { search } = new URL(req.url);
  return Object.assign(req, { query: parseQuery(search) });
};

/**
 * Creates a controller from any function that returns serializable stuff
 * @param reqHandler A function that returns what will be transformed into a response and sent to the user
 */
// @ts-expect-error It will return a Response anyway
const toController: ToController = (reqHandler?: RequestHandler) =>
  async (req: Request) => {
    if (!reqHandler) {
      return defaultResponse();
    }
    const result = await reqHandler(fancifyRequest(req));
    if (!result) {
      return defaultResponse();
    }
    // deno-lint-ignore no-prototype-builtins We need to verify if its a response
    if (Response.prototype.isPrototypeOf(result)) {
      return result;
    }
    if (typeof result === "number" || typeof result === "boolean") {
      return new Response(result.toString());
    }
    return new Response(JSON.stringify(result), {status: 200, headers: { "Content-Type": "application/json" }});
  };

type App = () => UnnamedAPI;

const matchRoute = (pathname: keyof ReqMap, reqMap?: ReqMap) => {
  return reqMap ? reqMap[pathname] : defaultResponse;
};

const buildHandler = (routeMap: RouteMap): Controller =>
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

  const buildMethodHandler = (method: HttpMethod) =>
    (reMap: ReqMap) =>
      App({
        ...currentRouteMap,
        [method]: { ...currentRouteMap[method], ...reMap },
      });

  const init = async (options: Deno.ListenOptions = { port: 4500 }) => {
    const listener = Deno.listen(options);
    for await (const conn of listener) {
      for await (const { respondWith, request } of Deno.serveHttp(conn)) {
        const r = await handler(request);
        console.log("handled ", r);
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
