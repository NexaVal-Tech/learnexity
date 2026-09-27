// components/cms/ui.tsx
//
// Small rendering primitives every CMS block uses, so admin-entered content
// is rendered the same (safe) way everywhere:
//   CmsText   — plain text with **emphasis** and line breaks
//   RichText  — HTML from a rich-text field (already sanitized server-side)
//   CmsImage  — next/image that won't crash on hosts it can't optimize
//   CmsLink   — link that blocks script URLs and opens external links safely
//   CmsIcon   — curated lucide icon ("lucide:Name") or an uploaded image
import React from 'react';
import Link from 'next/link';
import Image, { ImageProps } from 'next/image';
import {
  ArrowRight, Award, BarChart3, Bell, BookOpen, Brain, Briefcase, Building2, Calendar, Check,
  CheckCircle, Clock, Cloud, Code, Compass, Cpu, CreditCard, Database, DollarSign, Download,
  Eye, FileText, Flag, FolderOpen, Gift, Globe, GraduationCap, Handshake, Heart, HelpCircle,
  Home, Headphones, Laptop, Layers, LayoutDashboard, Lightbulb, LineChart, Link as LinkIcon,
  Lock, Mail, MapPin, Megaphone, MessageCircle, Mic, Monitor, Palette, PenTool, Phone,
  PieChart, Play, Puzzle, Rocket, Search, Settings, Share2, Shield, ShieldCheck, Smartphone,
  Sparkles, Star, Target, Trophy, TrendingUp, User, UserCheck, Users, Video, Wallet, Wrench,
  Zap, BadgeCheck, Presentation, School, Library, Network, Server, Bot, Workflow, Timer, Coins,
  Folder, Quote, Linkedin, Instagram, Facebook, Twitter, Youtube, type LucideIcon,
} from 'lucide-react';
import { canOptimizeImage, isExternalHref, safeHref } from '@/lib/cms/url';

export const BRAND = '#4A3AFF';

// ─── Text with **emphasis** ───────────────────────────────────────────────────

/**
 * Renders plain admin text. `**words**` become a highlighted span (brand
 * colour by default) and newlines become <br/>, which covers every inline
 * styling the original hand-written sections used without needing HTML.
 */
export function CmsText({
  text,
  accentColor = BRAND,
  accentClassName,
}: {
  text?: string | null;
  accentColor?: string;
  accentClassName?: string;
}) {
  if (!text) return null;
  const lines = String(text).split('\n');
  return (
    <>
      {lines.map((line, li) => (
        <React.Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
            part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
              <span key={pi} className={accentClassName} style={accentClassName ? undefined : { color: accentColor }}>
                {part.slice(2, -2)}
              </span>
            ) : (
              <React.Fragment key={pi}>{part}</React.Fragment>
            )
          )}
        </React.Fragment>
      ))}
    </>
  );
}

// ─── Rich text ────────────────────────────────────────────────────────────────

/**
 * HTML from a rich-text field. The backend sanitizes it on save
 * (CmsContentSanitizer), and built-in defaults are trusted code, so it's
 * rendered as-is — which keeps the server-rendered and hydrated HTML
 * identical. Styling comes from the `.cms-prose` rules in globals.css.
 */
export function RichText({ html, className = '' }: { html?: string | null; className?: string }) {
  if (!html) return null;
  return <div className={`cms-prose ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─── Images ───────────────────────────────────────────────────────────────────

export function CmsImage(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  if (typeof props.src === 'string' && !src) return null;
  return <Image {...props} unoptimized={props.unoptimized ?? !canOptimizeImage(src)} />;
}

// ─── Links ────────────────────────────────────────────────────────────────────

export function CmsLink({
  href,
  newTab,
  className,
  style,
  children,
  onClick,
  ...rest
}: {
  href?: string | null;
  newTab?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  'aria-label'?: string;
}) {
  const url = safeHref(href);
  const openNew = newTab || (/^https?:\/\//i.test(url) && newTab !== false);
  if (isExternalHref(url) || url === '#') {
    return (
      <a
        href={url}
        className={className}
        style={style}
        onClick={onClick}
        {...(openNew && url !== '#' && !/^(mailto|tel):/i.test(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={url} className={className} style={style} onClick={onClick} {...(newTab ? { target: '_blank' } : {})} {...rest}>
      {children}
    </Link>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

/** Curated set offered in the admin icon picker (value stored as "lucide:Name"). */
export const CMS_ICONS: Record<string, LucideIcon> = {
  ArrowRight, Award, BarChart3, Bell, BookOpen, Brain, Briefcase, Building2, Calendar, Check,
  CheckCircle, Clock, Cloud, Code, Compass, Cpu, CreditCard, Database, DollarSign, Download,
  Eye, FileText, Flag, FolderOpen, Gift, Globe, GraduationCap, Handshake, Heart, HelpCircle,
  Home, Headphones, Laptop, Layers, LayoutDashboard, Lightbulb, LineChart, Link: LinkIcon,
  Lock, Mail, MapPin, Megaphone, MessageCircle, Mic, Monitor, Palette, PenTool, Phone,
  PieChart, Play, Puzzle, Rocket, Search, Settings, Share2, Shield, ShieldCheck, Smartphone,
  Sparkles, Star, Target, Trophy, TrendingUp, User, UserCheck, Users, Video, Wallet, Wrench,
  Zap, BadgeCheck, Presentation, School, Library, Network, Server, Bot, Workflow, Timer, Coins,
  Folder, Quote, Linkedin, Instagram, Facebook, Twitter, Youtube,
};

/**
 * `value` is either "lucide:Name" (a built-in icon) or an image URL
 * (an uploaded icon/logo). Renders nothing for an empty value.
 */
export function CmsIcon({
  value,
  size = 24,
  color,
  className,
  strokeWidth,
  alt = '',
}: {
  value?: string | null;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
  alt?: string;
}) {
  if (!value) return null;
  if (value.startsWith('lucide:')) {
    const Icon = CMS_ICONS[value.slice(7)];
    return Icon ? <Icon size={size} color={color} className={className} strokeWidth={strokeWidth} aria-hidden="true" /> : null;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={value} alt={alt} width={size} height={size} className={className} style={{ width: size, height: size, objectFit: 'contain' }} />;
}

export const SOCIAL_ICONS: Record<string, LucideIcon> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  website: Globe,
};
