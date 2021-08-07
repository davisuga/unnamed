import app from "./framework.ts";
import { FancyReq } from "./types.ts";
import { pipe } from "./lib/pipe.ts";
import { connect } from "https://denopkg.com/keroxp/deno-redis/mod.ts";

const redis = await connect({
  hostname: "127.0.0.1",
  port: 6379,
});

const ok = await redis.set("hoge", "fuga");
const fuga = await redis.get("hoge");

const showMethod = (req: FancyReq) => {
  return `Oh, you sent a ${req.method}`;
};
const showParams = (req: FancyReq) => {
  return `Your params: ${JSON.stringify(req.query)}`;
};

const log = <T extends any>(something: any):T => {
  console.log(something);
  return something;
};

const trace = (label: string | Function) => <T>(value: T):any => {
  if(typeof label === "function") {
    label(value)
    return value
  }
  console.log(label, value)
  return value
}

type TodoContent = {
  uid: string;
  content: string;
};

const getTodoBody = (req: FancyReq) => req.json();

const createTodo = async (todoBody?: Promise<TodoContent>) => {
  const resolved = await todoBody;
  console.log(resolved);
  if (!resolved?.uid) {
    return ({ created: false });
  }
  const { uid, content } = resolved;
  const result = await redis.sadd(`todos:${uid}`, content);
  return ({ created: result });
};

const readTodos = async (uid: string) => {
  console.log({uid})
  const result = await redis.smembers(`todos:${uid}`);
  console.log({ redisResult: result });
  return result
};

const getQueryID = (req: FancyReq) => req.query.uid;

const getTodos = pipe(trace((x: FancyReq) => console.log(x.query)), getQueryID, readTodos);
const postTodo = pipe(getTodoBody, createTodo);

app()
  .onGet({
    "/method": showMethod,
    "/ssas/:id": () => "SSASS",
    "/params": showParams,
    "/todos": getTodos,
  })
  .onPost({
    "/todos/new": postTodo,
    "/posty": showMethod,
  })
  .init();
