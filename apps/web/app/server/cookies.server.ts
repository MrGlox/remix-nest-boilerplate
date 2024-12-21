import { createCookie } from "react-router"; // or cloudflare/deno

export const cookieConsent = createCookie("_cookie-consent", {
  path: "/",
  sameSite: "lax",
  maxAge: 604_800, // one week
});

export const persistToken = createCookie("_persist-token", {
  path: "/",
  sameSite: "lax",
  maxAge: 60,
});

export const alertMessage = createCookie("alertMessage", {
  maxAge: 5,
});

export const alertMessageHelper = async (request) => {
  const cookieHeader = request.headers.get("Cookie");
  const message = await alertMessage.parse(cookieHeader);

  return {
    message,
    headers: [
      ["Set-Cookie", await alertMessage.serialize("", { maxAge: 0 })],
    ] as [string, string][],
  };
};

export const alertMessageGenerator = async (message, type) => {
  return ["Set-Cookie", await alertMessage.serialize([message, type])] as [
    string,
    string,
  ];
};
