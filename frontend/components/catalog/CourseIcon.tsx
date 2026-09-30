// components/catalog/CourseIcon.tsx
//
// Courses don't have an icon field, so pick one from the course title
// (first matching rule wins). Falls back to an open book.
import {
  BookOpen, Bot, BrainCircuit, ChartLine, ChartPie, Cloud, CodeXml, Database,
  Hash, Laptop, Megaphone, MonitorPlay, Network, Palette, PenTool, ShieldCheck,
  Smartphone, Sparkles, Video, WandSparkles, Boxes, Briefcase,
  type LucideIcon,
} from "lucide-react";

const RULES: [RegExp, LucideIcon][] = [
  [/secur|secops|cyber/i, ShieldCheck],
  [/mlops|ai system|machine learning|\bml\b/i, Network],
  [/automation|agent/i, Bot],
  [/data engineer|cloud data|database|\bsql\b/i, Database],
  [/data science|scien/i, ChartPie],
  [/analy|\bbi\b|excel|power ?bi/i, ChartLine],
  [/\bai\b.*(\bui\b|\bux\b|design)/i, WandSparkles],
  [/\bui\b|\bux\b|ui\/ux|product design/i, PenTool],
  [/motion|video|animation|editing/i, Video],
  [/vibe/i, Laptop],
  [/front.?end|web|html|javascript|react|software|develop|programm|coding|python/i, CodeXml],
  [/mobile|android|ios|flutter/i, Smartphone],
  [/social/i, Hash],
  [/content|youtube|creator/i, MonitorPlay],
  [/graphic|brand/i, Palette],
  [/market|\bseo\b|\bads\b/i, Megaphone],
  [/cloud|devops|aws|azure/i, Cloud],
  [/product|project|management/i, Boxes],
  [/business|career|consult/i, Briefcase],
  [/deep|neural|llm|\bai\b|artificial/i, BrainCircuit],
];

export function iconForCourse(title: string | null | undefined): LucideIcon {
  const t = title ?? "";
  for (const [re, Icon] of RULES) if (re.test(t)) return Icon;
  return /\bai\b/i.test(t) ? Sparkles : BookOpen;
}

export function CourseIcon({ title, className, size = 18 }: { title: string; className?: string; size?: number }) {
  const Icon = iconForCourse(title);
  return <Icon size={size} className={className} aria-hidden="true" />;
}
