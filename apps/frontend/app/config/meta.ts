import { MetaFunction } from "@remix-run/node";

import { loader } from "~/root";

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.title || "Homepage | Boilerplate"}` },
  {
    name: "description",
    content:
      data?.description ||
      "This boilerplate is a modern web application template that provides a foundation for building full-stack applications using NestJS and Remix.",
  },
];
