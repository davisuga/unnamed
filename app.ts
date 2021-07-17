import app from "./framework.ts";

app()
  .onGet({
    "/method": (req) => {
      return `Oh, you sent a ${req.method}`;
    },
    "/ssas": () => "SSASS",
  })
  .init();
