# Unnamed web framework

## Disclaimer

This is just a RUSHED layer over Deno's native HTTP api. \
It has no support for middlewares. \
It's obviously not ready for production, but is relatively easy to extend.

## Basic usage

```typescript
import app from "https://denopkg.com/davisuga/unnamed/mod.ts";

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
```
