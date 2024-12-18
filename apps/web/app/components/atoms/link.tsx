import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from "@remix-run/react";

import { cn } from "~/lib/utils";

interface LinkProps extends RouterLinkProps {
  reversed?: boolean;
}

const Link = ({ className, reversed = false, ...props }: LinkProps) => {
  return (
    <RouterLink
      {...props}
      className={cn(
        "hover:underline cursor-pointer underline-offset-1",
        reversed ? "underline hover:no-underline" : "",
        className,
      )}
    />
  );
};

export { Link };
