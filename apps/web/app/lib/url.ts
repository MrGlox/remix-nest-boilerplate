export function generateUrlWithParams(
  baseUrl: string,
  params: Record<string, string | null | undefined>,
) {
  const url = new URL(baseUrl);

  const searchParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => [key, value as any]),
    ),
  );

  url.search = searchParams.toString();
  return url.toString();
}
