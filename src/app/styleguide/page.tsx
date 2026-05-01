import type { Metadata } from "next";

import { AreasSection } from "./sections/areas";
import { AtomsSection } from "./sections/atoms";
import { HealthSection } from "./sections/health";
import { MoleculesSection } from "./sections/molecules";
import { OnboardingSection } from "./sections/onboarding";
import { RadiiSection, SpacingSection } from "./sections/radii-spacing";
import { ResourcesSection } from "./sections/resources";
import { StagesSection } from "./sections/stages";
import { BrandSection, SurfacesSection } from "./sections/surfaces";
import { TypographySection } from "./sections/typography";

export const metadata: Metadata = {
  title: "Growth · Style Guide",
};

export default function StyleGuide() {
  return (
    <main className="bg-surface-app text-brand-700 min-h-screen py-10">
      <div className="mx-auto max-w-5xl space-y-12 px-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Growth · Style Guide</h1>
          <p className="text-brand-muted text-sm">
            The single source of truth for design tokens, atoms, and molecules. Every color, font
            weight, radius, and reusable component lives here. If you need a hex code or write a new
            variant inline in a feature, you&rsquo;re probably doing it wrong — add a token or an
            atom variant first.
          </p>
        </header>

        <TypographySection />
        <SurfacesSection />
        <BrandSection />
        <AreasSection />
        <ResourcesSection />
        <StagesSection />
        <HealthSection />
        <RadiiSection />
        <SpacingSection />

        <hr className="border-surface-muted" />
        <h2 className="text-2xl font-extrabold tracking-tight">Atoms</h2>
        <AtomsSection />

        <hr className="border-surface-muted" />
        <h2 className="text-2xl font-extrabold tracking-tight">Molecules</h2>
        <MoleculesSection />

        <hr className="border-surface-muted" />
        <h2 className="text-2xl font-extrabold tracking-tight">Onboarding</h2>
        <OnboardingSection />
      </div>
    </main>
  );
}
