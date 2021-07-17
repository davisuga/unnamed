import app from "./framework.ts";
import { FancyReq } from "./types.ts";

const showMethod = (req: FancyReq) => {
  return `Oh, you sent a ${req.method}`;
};
const showParams = (req: FancyReq) => {
  return `Your params: ${JSON.stringify(req.query)}`;
};
app()
  .onGet({
    "/method": showMethod,
    "/ssas": () => "SSASS",
    "/params": showParams,
  })
  .onPost({
    "/posty": showMethod,
  })
  .init();
