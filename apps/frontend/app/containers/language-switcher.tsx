import { useLocation, useNavigate } from "@remix-run/react";
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
const langs = [
  { text: "🇺🇸 English", value: "en" },
  { text: "🇫🇷 Français", value: "fr" },
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
      <SelectTrigger className="w-[180px]">
        <SelectValue
          key={resolvedLanguage}
          placeholder={currentLanguage.text}
        />
      </SelectTrigger>
      <SelectContent>
        {langs.map(({ text, value }) => (
          <SelectItem key={value} {...{ value }}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
