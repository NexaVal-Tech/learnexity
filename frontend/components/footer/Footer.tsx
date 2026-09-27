
import { FadeUpOnScroll } from "../animations/Animation";
import { useCmsGlobals } from "@/contexts/CmsGlobalsContext";
import { CmsImage, CmsLink, CmsText, SOCIAL_ICONS } from "@/components/cms/ui";
import type { FooterData } from "@/lib/cms/types";

/**
 * Site footer. Content comes from the CMS ("Footer" in Admin → Website
 * CMS); `data` is only passed explicitly by the admin preview.
 */
export default function Footer({ data }: { data?: FooterData } = {}) {
  const globals = useCmsGlobals();
  const d = data ?? globals.footer;
  const columns = (d.columns ?? []).filter((c) => c.title || c.links?.length);
  const socials = (d.socials ?? []).filter((s) => s.href);

  return (
    <FadeUpOnScroll>
    <div className="relative z-10 bg-[#5B1EF6] text-white mx-auto">
      {/* CTA Section */}
      {d.showCta && (
        <div className="text-center py-3 px-3">
          <h2 className="text-5xl font-semibold mb-4 leading-tight">
            <CmsText text={d.ctaHeading} accentColor="#fde68a" />
          </h2>
          {d.ctaText && (
            <p className="text-lg mb-6 max-w-4xl mx-auto leading-relaxed text-white opacity-90">
              <CmsText text={d.ctaText} accentColor="#fde68a" />
            </p>
          )}
          <div className="flex flex-row gap-4 justify-center items-center">
            {d.ctaPrimary?.label && (
              <CmsLink
                href={d.ctaPrimary.href}
                newTab={d.ctaPrimary.newTab}
                className="bg-white text-[#6D4AFF] px-3 py-1 text-sm md:px-4 md:py-2 md:text-lg rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                {d.ctaPrimary.label}
              </CmsLink>
            )}
            {d.ctaSecondary?.label && (
              <CmsLink
                href={d.ctaSecondary.href}
                newTab={d.ctaSecondary.newTab}
                className="text-white text-sm md:text-lg hover:no-underline transition-all"
              >
                {d.ctaSecondary.label}
              </CmsLink>
            )}
          </div>
        </div>
      )}

      {/* Footer Links Section */}
      <div className="px-6 pb-3 pt-2">
        <div className="max-w-screen-xl mx-auto">
          <div className={`grid gap-16 ${columns.length >= 3 ? "md:grid-cols-4" : columns.length === 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {/* Logo and Copyright */}
            <div>
              <div className="flex items-center gap-2 mb-12">
                {d.logo && <CmsImage src={d.logo} alt="Learnexity" width={140} height={40} className="object-contain h-10 w-auto" />}
              </div>
              <p className="text-white opacity-80">
                <CmsText text={d.copyright} />
              </p>
              {socials.length > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  {socials.map((s, i) => {
                    const Icon = SOCIAL_ICONS[s.platform?.toLowerCase()] ?? SOCIAL_ICONS.website;
                    return (
                      <CmsLink key={i} href={s.href} newTab aria-label={s.platform} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <Icon size={17} />
                      </CmsLink>
                    );
                  })}
                </div>
              )}
            </div>

            {columns.map((col, ci) => (
              <div key={ci}>
                <h3 className="text-xl font-semibold mb-2 text-white opacity-90 tracking-wider uppercase">
                  {col.title}
                </h3>
                <ul className="space-y-0">
                  {(col.links ?? []).filter((l) => l.label).map((link, li) => (
                    <li key={li}>
                      <CmsLink href={link.href} newTab={link.newTab} className="text-white opacity-80 hover:opacity-100 transition-opacity">
                        {link.label}
                      </CmsLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Powered by */}
          {d.showPoweredBy && (
            <div className="mt-6 pt-3 border-t border-white/15 flex justify-center">
              <CmsLink href={d.poweredByHref} newTab className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors duration-300">
                <span>{d.poweredByLabel}</span>
                {d.poweredByLogo && (
                  <CmsImage src={d.poweredByLogo} alt="Nexaval Tech" width={100} height={100} className="rounded-sm" />
                )}
              </CmsLink>
            </div>
          )}
        </div>
      </div>
    </div>
    </FadeUpOnScroll>
  );
}
