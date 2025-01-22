import {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
} from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";

interface ButtonProps extends ShadcnButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = ({ children, isLoading = false, ...props }: ButtonProps) => {
  return (
    <ShadcnButton {...props} disabled={isLoading || props.disabled}>
      {isLoading ? <Loader /> : children}
    </ShadcnButton>
  );
};

export { Button };
