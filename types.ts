export type CanBeEncoded =
  | string
  | number
  | boolean
  | void
  | unknown[]
  | null
  | Record<string | number, unknown>;

export type ReqWithParams = Request & {
  params: Record<string, string> | null;
};

export type ReqWithQuery = ReqWithParams & {
  query: Record<string, string>;
};

export type FancyReq = ReqWithQuery;

export type ValidResponse =
  | CanBeEncoded
  | Response
  | Promise<CanBeEncoded>
  | Promise<Response>;
/**
 * Is any function that receives a request and returns serializable stuff.
 */
export type RequestHandler = (req: FancyReq) => ValidResponse;

export type Controller = (req: Request) => Response | Promise<Response>;

export type ToController = (reqHandler: RequestHandler) => Controller;

/**
 * Maps each route it's a controller, a.k.a. "Request Handler".
 */
export type ReqMap = {
  [route: string]: RequestHandler;
};

/**
 * Describes the routes of an API from a given method.
 */
export type RouteMap = {
  [method in HttpMethod]?: ReqMap;
};

export type MethodHandler = (reMap: ReqMap) => UnnamedAPI;
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"; //| "HEAD" | "OPTIONS" | "UPDATE";

export type UnnamedAPI = {
  init: (options: Deno.ListenOptions) => void;
  onPost: MethodHandler;
  onGet: MethodHandler;
  onDelete: MethodHandler;
  onPut: MethodHandler;
  routeMap: RouteMap;
};
