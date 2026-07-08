import {
  Briefcase,
  Compass,
  MessageCircle,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

import type { ShellStrings } from "@/lib/i18n";

export type NavItem = {
  href: string;
  labelKey: keyof ShellStrings;
  icon: LucideIcon;
};

export const nav: NavItem[] = [
  { href: "/chat", labelKey: "navChat", icon: MessageCircle },
  { href: "/compass", labelKey: "navCompass", icon: Compass },
  { href: "/jobs", labelKey: "navOpportunities", icon: Briefcase },
  { href: "/insight", labelKey: "navInsight", icon: Newspaper },
];

export const bottomNav: NavItem[] = [
  { href: "/compass", labelKey: "navCompass", icon: Compass },
  { href: "/jobs", labelKey: "navOpportunities", icon: Briefcase },
  { href: "/insight", labelKey: "navInsight", icon: Newspaper },
  { href: "/chat", labelKey: "navChat", icon: MessageCircle },
];
