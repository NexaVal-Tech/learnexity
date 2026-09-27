// components/cms/SectionRenderer.tsx
//
// Renders a page's sections in order. Each section gets its own error
// boundary, so a broken or half-filled section can never take the rest of
// the page down with it (it just renders nothing, and logs in the console).
import React from "react";
import { BLOCK_COMPONENTS } from "@/lib/cms/components";
import type { CmsSection } from "@/lib/cms/types";

class SectionBoundary extends React.Component<{ type: string; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[cms] Section "${this.props.type}" failed to render:`, error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function SectionRenderer({ sections }: { sections: CmsSection[] | null | undefined }) {
  return (
    <>
      {(sections ?? []).map((section) => {
        if (section.hidden) return null;
        const Component = BLOCK_COMPONENTS[section.type];
        if (!Component) return null; // e.g. a block type removed from the code
        const rendered = (
          <SectionBoundary key={section.id} type={section.type}>
            <Component data={section.data} />
          </SectionBoundary>
        );
        return section.anchor ? (
          <div key={section.id} id={section.anchor} style={{ scrollMarginTop: 80 }}>
            {rendered}
          </div>
        ) : (
          rendered
        );
      })}
    </>
  );
}
