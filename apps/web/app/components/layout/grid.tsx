import { cn } from "~/lib/utils";

interface GridProps {
  tag?:
    | "ul"
    | "li"
    | "ol"
    | "nav"
    | "form"
    | "div"
    | "header"
    | "footer"
    | "section"
    | "article"
    | "main";
  children: React.ReactNode;
  className?: string;
}

/**
 * The basiciest layout component to display content in a flexGrid.
 * By default, it will display its content in a row with wrap.
 * You can override this behavior by passing a `className` prop.
 *
 * @param tag - The tag to use for the Grid. Defaults to `div`.
 * @param children - The content to display.
 *
 * @returns {JSX.Element}
 */
export function Grid({ tag = "div", children, ...rest }: GridProps) {
  const DynamicTag = `${tag}` as keyof JSX.IntrinsicElements;

  return (
    <DynamicTag
      {...rest}
      className={cn(
        "grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-x-2 w-full",
        rest.className,
      )}
    >
      {children}
    </DynamicTag>
  );
}
