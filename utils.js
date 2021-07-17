/**
 * Parses query parameters from a string
 * Adapted from https://stackoverflow.com/a/7826782
 * @param {string} search
 * @returns {Object.<string, string>}
 */
export function parseQuery(search) {
  const args = search.substring(1).split("&");

  const argsParsed = {};

  let i, arg, kvp, key, value;

  for (i = 0; i < args.length; i++) {
    arg = args[i];

    if (-1 === arg.indexOf("=")) {
      argsParsed[decodeURIComponent(arg).trim()] = true;
    } else {
      kvp = arg.split("=");

      key = decodeURIComponent(kvp[0]).trim();

      value = decodeURIComponent(kvp[1]).trim();

      argsParsed[key] = value;
    }
  }

  return argsParsed;
}
