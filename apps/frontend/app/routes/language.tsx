import { type ActionFunctionArgs } from "@remix-run/node";

import i18next from "i18next";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("request", i18next);
  i18next.changeLanguage("en");

  // return redirect(`/todos/${todo.id}`);
  return null;
};

export default function Language() {
  return <></>;
}
