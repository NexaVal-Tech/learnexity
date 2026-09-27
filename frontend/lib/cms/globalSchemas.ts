// lib/cms/globalSchemas.ts — admin form schemas for the navbar and footer.
import { f, type Field } from "./fields";
import { NAVBAR_DEFAULTS, FOOTER_DEFAULTS } from "./globalDefaults";

const linkFields = (labelHelp?: string): Field[] => [
  f.text("label", "Text", labelHelp ? { help: labelHelp } : {}),
  f.url("href", "Link", "A page path like /about, or a full https:// URL."),
  f.bool("newTab", "Open in a new tab"),
];

export const NAVBAR_FIELDS: Field[] = [
  f.image("logo", "Logo", "Shown at the top-left. A wide PNG/SVG about 136×38 works best."),
  f.text("logoAlt", "Logo description (for screen readers)"),
  f.list(
    "entries",
    "Menu items",
    [
      f.select("kind", "Type", [
        { value: "link", label: "Single link" },
        { value: "group", label: "Dropdown menu" },
      ]),
      f.text("label", "Menu text", { help: "e.g. Home, Courses, About…" }),
      { ...f.url("href", "Link"), showIf: { key: "kind", equals: "link" } },
      { ...f.bool("newTab", "Open in a new tab"), showIf: { key: "kind", equals: "link" } },
      {
        ...f.list(
          "items",
          "Dropdown items",
          [
            f.text("label", "Text"),
            f.url("href", "Link"),
            f.text("description", "Short description"),
            f.select(
              "coursePanel",
              "Show a live course list beside it",
              [
                { value: "none", label: "No — just a link" },
                { value: "deeptech", label: "Deep Tech courses" },
                { value: "intermediate", label: "Career Accelerator courses" },
                { value: "flex", label: "Flexible / self-paced courses" },
                { value: "free", label: "Free courses" },
              ],
              "The course list comes from Course Management and updates automatically."
            ),
            { ...f.text("panelTitle", "Course list heading"), showIf: { key: "coursePanel", equals: ["deeptech", "intermediate", "flex", "free"] } },
            f.bool("hidden", "Hide this item"),
          ],
          {
            itemLabelKey: "label",
            addLabel: "Add dropdown item",
            itemDefaults: { label: "New item", href: "/", description: "", coursePanel: "none", panelTitle: "", hidden: false },
          }
        ),
        showIf: { key: "kind", equals: "group" },
      },
      f.bool("hidden", "Hide this menu item"),
    ],
    {
      itemLabelKey: "label",
      addLabel: "Add menu item",
      max: 12,
      itemDefaults: { kind: "link", label: "New link", href: "/", newTab: false, items: [], hidden: false },
    }
  ),
  f.group("cta", "Highlighted button (right side)", [...linkFields(), f.bool("show", "Show this button")]),
  f.text("loginLabel", "“Log in” text"),
  f.url("loginHref", "“Log in” link"),
  f.text("dashboardLabel", "“Dashboard” text (signed-in students)"),
  f.text("browseAllLabel", "“Browse all” text in course lists"),
  f.bool("showThemeToggle", "Show the light/dark theme switch"),
];

export const FOOTER_FIELDS: Field[] = [
  f.bool("showCta", "Show the call-to-action band at the top"),
  { ...f.textarea("ctaHeading", "Heading", { rows: 2 }), showIf: { key: "showCta", equals: true } },
  { ...f.textarea("ctaText", "Text", { rows: 2 }), showIf: { key: "showCta", equals: true } },
  { ...f.group("ctaPrimary", "Main button (white)", linkFields()), showIf: { key: "showCta", equals: true } },
  { ...f.group("ctaSecondary", "Second button (text link)", linkFields()), showIf: { key: "showCta", equals: true } },
  f.image("logo", "Logo (optional)"),
  f.textarea("copyright", "Copyright line", { rows: 1 }),
  f.list(
    "columns",
    "Link columns",
    [
      f.text("title", "Column heading"),
      f.list("links", "Links", linkFields(), {
        itemLabelKey: "label",
        addLabel: "Add link",
        itemDefaults: { label: "New link", href: "/", newTab: false },
      }),
    ],
    { itemLabelKey: "title", addLabel: "Add column", max: 5, itemDefaults: { title: "New column", links: [] } }
  ),
  f.list(
    "socials",
    "Social media icons",
    [
      f.select("platform", "Platform", [
        { value: "instagram", label: "Instagram" },
        { value: "facebook", label: "Facebook" },
        { value: "linkedin", label: "LinkedIn" },
        { value: "youtube", label: "YouTube" },
        { value: "x", label: "X / Twitter" },
        { value: "whatsapp", label: "WhatsApp" },
        { value: "email", label: "Email" },
        { value: "website", label: "Website" },
      ]),
      f.url("href", "URL"),
    ],
    { itemLabelKey: "platform", addLabel: "Add social icon", itemDefaults: { platform: "instagram", href: "" } }
  ),
  f.bool("showPoweredBy", "Show “Powered by”"),
  { ...f.text("poweredByLabel", "“Powered by” text"), showIf: { key: "showPoweredBy", equals: true } },
  { ...f.image("poweredByLogo", "“Powered by” logo"), showIf: { key: "showPoweredBy", equals: true } },
  { ...f.url("poweredByHref", "“Powered by” link"), showIf: { key: "showPoweredBy", equals: true } },
];

export const GLOBAL_EDITORS = {
  navbar: { title: "Navbar", fields: NAVBAR_FIELDS, defaults: NAVBAR_DEFAULTS },
  footer: { title: "Footer", fields: FOOTER_FIELDS, defaults: FOOTER_DEFAULTS },
} as const;
