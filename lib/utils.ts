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
