// components/catalog/CatalogTheme.tsx
//
// The site's design language for the courses pages: brand purple
// #4A3AFF, the signature uneven corners (2rem / 0.75rem), glass surfaces
// with a purple glow on hover, and Geist semibold headings. Used by the
// listing pages and the course details page so they match the rest of
// the site in light and dark mode.
import { BRAND } from "./pathways";

/** Corner shapes used across the site. */
export const RADIUS = "2rem 0.75rem 2rem 0.75rem";
export const RADIUS_SM = "1.25rem 0.5rem 1.25rem 0.5rem";

export function CatalogTheme() {
  return (
    <style>{`
      .lx-r { border-radius: ${RADIUS}; }
      .lx-r-sm { border-radius: ${RADIUS_SM}; }

      /* Glass card (same as the homepage pathway cards) */
      .lx-card {
        border-radius: ${RADIUS};
        border: 1px solid var(--border-subtle);
        background: var(--surface-elevated);
        backdrop-filter: blur(8px);
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.18);
        transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
      }
      [data-theme="dark"] .lx-card { box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6); }
      .lx-hover:hover {
        border-color: ${BRAND}66;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 0 30px ${BRAND}33;
        transform: translateY(-4px);
      }
      [data-theme="dark"] .lx-hover:hover { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px ${BRAND}33; }

      /* Inner boxes inside a card */
      .lx-inset {
        border-radius: ${RADIUS_SM};
        border: 1px solid var(--border-subtle);
        background: var(--surface-alt);
        transition: border-color 0.25s, background 0.25s;
      }
      .lx-inset-hover:hover { border-color: ${BRAND}44; background: ${BRAND}0a; }

      /* Small uppercase label above headings */
      .lx-label {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: ${BRAND};
      }

      /* Buttons */
      .lx-btn {
        border-radius: ${RADIUS};
        background: ${BRAND};
        color: #fff;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: box-shadow 0.3s, transform 0.3s, gap 0.3s;
      }
      .lx-btn:hover:not(:disabled) { box-shadow: 0 8px 28px ${BRAND}55; transform: translateY(-2px); }
      .lx-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .lx-btn-outline {
        border-radius: ${RADIUS};
        border: 1.5px solid ${BRAND}66;
        color: ${BRAND};
        background: ${BRAND}10;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s;
      }
      .lx-btn-outline:hover { background: ${BRAND}18; border-color: ${BRAND}; gap: 0.75rem; box-shadow: 0 0 20px ${BRAND}44; }

      /* Course picture zoom on hover */
      .lx-pic { transition: transform 0.5s ease; }
      .group:hover .lx-pic { transform: scale(1.05); }
    `}</style>
  );
}
