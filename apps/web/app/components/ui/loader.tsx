import { AllHTMLAttributes, FC } from "react";
import { cn } from "~/lib/utils";

import "./loader.css";

interface LoaderProps extends AllHTMLAttributes<HTMLDivElement> {}

/**
 * A simple loader in CSS to show the user that something is happening.
 *
 * @returns {JSX.Element}
 */
export const Loader: FC<LoaderProps> = ({ ...rest }) => {
  return (
    <div className={cn("flex items-center", rest.className)}>
      <div data-testid="lds-ellipsis" className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};
