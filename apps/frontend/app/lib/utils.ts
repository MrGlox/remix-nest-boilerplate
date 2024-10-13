import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = ({ date }: { date: Date | string }) => {
  return new Date(date).toLocaleDateString();
};

export const formatPrice = ({ price }: { price: number }) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

export function browseByKeyString(
  obj: { [key: string]: unknown } = {},
  path = ""
) {
  return path
    .split(".")
    .reduce<{ [key: string]: unknown } | null>((prev, curr) => {
      const key = Number.isNaN(Number(curr)) ? curr : Number.parseInt(curr);

      return prev && typeof prev === "object"
        ? ((prev as { [key: string]: unknown })[key] as {
            [key: string]: unknown;
          } | null)
        : null;
    }, obj);
}
