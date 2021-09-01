export const lazy =
  <T extends (args: any) => any, F extends Parameters<T>>(fn: T) =>
  (...args: F) =>
  () =>
    fn(args);

export const memoize = <T extends (args: any) => any, F extends Parameters<T>>(
  func: T
): T => {
  // a cache of results
  const results = {};
  // @ts-ignore return a function for the cache of results
  return (...args: F) => {
    // @ts-ignore a JSON key to save the results cache
    const argsKey = JSON.stringify(args);
    // @ts-ignore execute `func` only if there is no cached value of clumsysquare()
    if (!results[argsKey]) {
      // @ts-ignore store the return value of clumsysquare()
      results[argsKey] = func(...args);
    }
    // @ts-ignore return the cached results
    return results[argsKey];
  };
};

/**
 * Parses query parameters from a string
 * Adapted from https://stackoverflow.com/a/7826782
 * @param {string} search
 * @returns {Object.<string, string>}
 */
export function parseQuery(search: string) {
  const args = search.substring(1).split("&");
  const argsParsed = {};
  let i, arg, kvp, key, value;

  for (i = 0; i < args.length; i++) {
    arg = args[i];

    if (-1 === arg.indexOf("=")) {
      //@ts-expect-error
      argsParsed[decodeURIComponent(arg).trim()] = true;
    } else {
      kvp = arg.split("=");
      key = decodeURIComponent(kvp[0]).trim();
      value = decodeURIComponent(kvp[1]).trim();
      //@ts-expect-error
      argsParsed[key] = value;
    }
  }
  return argsParsed;
}
