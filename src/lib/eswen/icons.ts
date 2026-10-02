import {
  Stethoscope,
  Sparkles,
  HeartPulse,
  Flower2,
  ClipboardList,
  ShieldPlus,
  CalendarCheck,
  UserRound,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  Building2,
  Microscope,
  Hand,
  Smile,
  Brain,
  Activity,
  Syringe,
  Pill,
  Heart,
  Bandage,
  Thermometer,
  Droplet,
  Sun,
  type LucideIcon,
} from "lucide-react";

/**
 * Resolve a lucide-react icon by name (the admin stores icon names as strings).
 * Falls back to Stethoscope if the name isn't in our curated set.
 *
 * To add more icons, extend the MAP below. The admin "icon" field accepts any
 * name listed here (case-sensitive, exact lucide export name).
 */
const MAP: Record<string, LucideIcon> = {
  Stethoscope,
  Sparkles,
  HeartPulse,
  Flower2,
  ClipboardList,
  ShieldPlus,
  CalendarCheck,
  UserRound,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  Building2,
  Microscope,
  Hand,
  Smile,
  Brain,
  Activity,
  Syringe,
  Pill,
  Heart,
  Bandage,
  Thermometer,
  Droplet,
  Sun,
};

export function getLucideIcon(name: string | undefined | null): LucideIcon {
  if (name && MAP[name]) return MAP[name];
  return Stethoscope;
}

/** The list of valid icon names (for the admin editor's datalist/autocomplete). */
export const VALID_ICON_NAMES = Object.keys(MAP).sort();
