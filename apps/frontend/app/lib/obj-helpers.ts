export function browseByKeyString(
  obj: { [key: string]: unknown } = {},
  path = "",
) {
  return path
    .split(".")
    .reduce<{ [key: string]: unknown } | null>((prev, curr) => {
      const key = Number.isNaN(Number(curr)) ? curr : Number.parseInt(curr);

      return prev && typeof prev === "object"
        ? ((prev as { [key: string]: unknown })[key] as {
            [key: string]: unknown;
          } | null)
        : null;
    }, obj);
}

export function getFirstObjKey(obj) {
  return Object.keys(obj)[0];
}
