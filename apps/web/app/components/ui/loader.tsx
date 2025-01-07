import { AllHTMLAttributes, FC } from "react";
import { cn } from "~/lib/utils";

interface LoaderProps extends AllHTMLAttributes<HTMLDivElement> {}

/**
 * A simple loader in CSS to show the user that something is happening.
 *
 * @returns {JSX.Element}
 */
export const Loader: FC<LoaderProps> = ({ ...rest }) => {
  return (
    <div className={cn("flex items-center", rest.className)}>
      <div data-testid="lds-ellipsis" className="relative inline-block w-[80px] h-[21px] transform scale-75">
        <div className="absolute top-[3px] w-[13px] h-[13px] bg-current rounded-full animate-lds-ellipsis1 left-[8px]"></div>
        <div className="absolute top-[3px] w-[13px] h-[13px] bg-current rounded-full animate-lds-ellipsis2 left-[8px]"></div>
        <div className="absolute top-[3px] w-[13px] h-[13px] bg-current rounded-full animate-lds-ellipsis2 left-[32px]"></div>
        <div className="absolute top-[3px] w-[13px] h-[13px] bg-current rounded-full animate-lds-ellipsis3 left-[54px]"></div>
      </div>
    </div>
  );
};
