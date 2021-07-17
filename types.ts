export type CanBeEncoded =
  | string
  | number
  | boolean
  | Record<string | number, unknown>;

export type FancyReq = Request & {
  query: Record<string, string>;
};

export type RequestHandler = (
  req: FancyReq
) => CanBeEncoded | Response | Promise<CanBeEncoded> | Promise<Response>;

export type Controller = (req: Request) => Response | Promise<Response>;

export type ToController = (reqHandler: RequestHandler) => Controller;

export type ReqMap = {
  [route: string]: RequestHandler;
};

export type MethodHandler = (reMap: ReqMap) => UnnamedAPI;
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"; //| "HEAD" | "OPTIONS" | "UPDATE";
export type RouteMap = {
  [method in HttpMethod]?: ReqMap;
};

export type UnnamedAPI = {
  init: (options: Deno.ListenOptions) => void;
  onPost: MethodHandler;
  onGet: MethodHandler;
  onDelete: MethodHandler;
  onPut: MethodHandler;
  routeMap: RouteMap;
};
