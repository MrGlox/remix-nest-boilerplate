export const kebabize = (str: string) =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($: string, ofs: string) => (ofs ? '-' : '') + $.toLowerCase(),
  );
