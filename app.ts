import app from "./framework.ts";
import { FancyReq } from "./types.ts";
import { pipe } from "./lib/pipe.ts";

const showMethod = (req: FancyReq) => {
  return `Oh, you sent a ${req.method}`;
};
const showParams = (req: FancyReq) => {
  return `Your params: ${JSON.stringify(req.query)}`;
};

const log = <T>(something: T) => {
  console.log(something);
  return something;
};

const getTodoBody = (req: FancyReq) => req.json();
const createTodo = async <T extends unknown>(todoBody?: Promise<T>) => {
  const resolved = await todoBody;
  console.log(resolved);
  return ({ created: true })
};

const postTodo = pipe(getTodoBody, createTodo);

app()
  .onGet({
    "/method": showMethod,
    "/ssas/:id": () => "SSASS",
    "/params": showParams,
  })
  .onPost({
    "/todos/new": postTodo,
    "/posty": showMethod,
  })
  .init();
