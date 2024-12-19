import { useLocation, useNavigate } from "react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// Hardcoded languages for demo purposes.
export const langs = [
  { label: "🇺🇸 English", value: "en" },
  { label: "🇫🇷 Français", value: "fr" },
];

export function LanguageSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const pathname = location.pathname.replace(/\/$/, "");

  const { currentLanguage, resolvedLanguage } = useMemo(() => {
    return {
      currentLanguage: langs.filter(
        ({ value }) => value === i18n.resolvedLanguage,
      )[0],
      resolvedLanguage: i18n.resolvedLanguage,
    };
  }, [i18n.resolvedLanguage]);

  return (
    <Select
      onValueChange={(value) => {
        i18n.changeLanguage(value);
        navigate(`${pathname}?lng=${value}`);
      }}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue
          key={resolvedLanguage}
          placeholder={currentLanguage.text}
        />
      </SelectTrigger>
      <SelectContent>
        {langs.map(({ label, value }) => (
          <SelectItem
            key={value}
            {...{ value }}
            className={currentLanguage.value === value ? "hidden" : ""}
          >
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
