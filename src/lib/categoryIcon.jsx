import {
  Smartphone, Laptop, Tablet, Monitor, Tv, Camera, Headphones, Speaker,
  Gamepad2, Watch, Cpu, HardDrive, Printer, Wifi, BatteryCharging, Lightbulb,
  Utensils, Plug, Cable, Shield, Package,
} from 'lucide-react';

/**
 * One place to turn a catalog category into a Lucide icon, so every product
 * placeholder across the app (cards, rails, the detail hero) shows the same
 * consistent glyph instead of a bare first-letter or a stray emoji.
 *
 * Matching is case-insensitive and substring-based, so close variants
 * ("headphones & audio", "home appliances", "storage & memory") all resolve.
 * Anything unmapped falls back to a neutral Package icon.
 */
const RULES = [
  [/smart\s?phone|mobile/, Smartphone],
  [/laptop|notebook|ultrabook/, Laptop],
  [/tablet|ipad/, Tablet],
  [/desktop|\bpc\b|computer/, Cpu],
  [/monitor|display/, Monitor],
  [/\btv\b|televis/, Tv],
  [/camera/, Camera],
  [/headphone|earbud|earphone|\baudio\b/, Headphones],
  [/speaker|sound/, Speaker],
  [/gaming|console|\bgame/, Gamepad2],
  [/watch|wearable/, Watch],
  [/storage|memory|\bssd\b|\bhdd\b|drive|disk/, HardDrive],
  [/printer|scanner/, Printer],
  [/network|wifi|router/, Wifi],
  [/power|battery|\bups\b|backup/, BatteryCharging],
  [/light|lamp|electric/, Lightbulb],
  [/kitchen|cook/, Utensils],
  [/appliance/, Plug],
  [/security|cctv|surveil/, Shield],
  [/accessor|cable|charger|adapter/, Cable],
];

/** Resolve a category string to its Lucide icon component. */
export function categoryIcon(category) {
  const c = (category || '').toLowerCase();
  for (const [re, Icon] of RULES) if (re.test(c)) return Icon;
  return Package;
}

/** Convenience wrapper: <CategoryIcon category={p.category} className="w-8 h-8" /> */
export function CategoryIcon({ category, className, strokeWidth = 1.75 }) {
  const Icon = categoryIcon(category);
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
