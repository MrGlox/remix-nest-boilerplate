import { ReactNode } from "react";

import { cn } from "~/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * A container component to center content with max width od 960px and auto margin.
 * By default, it will display its content in a row with wrap.
 * You can override this behavior by passing a `className` prop.
 *
 * @param children - The content to display.
 * @param className - The class name to apply to the container.
 *
 * @returns {JSX.Element}
 */
export function Container({ children, className, ...rest }: ContainerProps) {
  return (
    <div
      {...rest}
      className={cn("w-full max-w-[1340px] px-4 md:mx-auto", className)}
    >
      {children}
    </div>
  );
}
