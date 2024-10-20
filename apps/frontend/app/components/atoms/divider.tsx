import { cn } from "~/lib/utils";

const Divider = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
    </div>
  );
};

export { Divider };
