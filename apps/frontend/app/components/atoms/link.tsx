import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from "@remix-run/react";

import { cn } from "~/lib/utils";

interface LinkProps extends RouterLinkProps {}

const Link = ({ className, ...props }: LinkProps) => {
  return (
    <RouterLink
      {...props}
      className={cn("hover:underline cursor-pointer", className)}
    />
  );
};

export { Link };
