import app from "https://deno.land/x/unnamed/mod.ts";

app
  .onGet({
    "/hello": () => "Hello world",
    "/double/:number": ({ params }) => Number(params?.number) * 2,
  })
  .onPost({
    "/echo": (req) => req.json(),
  })
  //Works with onDelete and onPut too
  .init();
