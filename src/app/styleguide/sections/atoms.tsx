"use client";

import { useState } from "react";

import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Chip,
  Icon,
  Input,
  Modal,
  ProgressBar,
  Toggle,
  type BadgeTone,
  type ButtonVariant,
  type ChipTone,
} from "@/components/atoms";

import { Section } from "../_components";

const BUTTON_VARIANTS: ButtonVariant[] = ["primary", "secondary", "ghost", "destructive"];
const CHIP_TONES: ChipTone[] = [
  "neutral",
  "brand",
  "health",
  "career",
  "finances",
  "relationships",
  "personal",
  "fun",
  "spirituality",
];
const BADGE_TONES: BadgeTone[] = ["healthy", "wilting", "ill", "critical", "dead", "neutral"];

export function AtomsSection() {
  const [checked, setChecked] = useState(false);
  const [toggled, setToggled] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-12">
      <Section title="Buttons">
        <div className="bg-surface-card border-surface-muted space-y-3 rounded-md border p-5">
          <div className="flex flex-wrap gap-2">
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Section>

      <Section title="Chips">
        <div className="bg-surface-card border-surface-muted flex flex-wrap gap-2 rounded-md border p-5">
          {CHIP_TONES.map((tone) => (
            <Chip key={tone} tone={tone}>
              {tone}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Badges (health states)">
        <div className="bg-surface-card border-surface-muted flex flex-wrap gap-2 rounded-md border p-5">
          {BADGE_TONES.map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Inputs">
        <div className="bg-surface-card border-surface-muted grid max-w-md gap-3 rounded-md border p-5">
          <Input placeholder="Email" />
          <Input defaultValue="Run a 5K race" />
          <Input invalid defaultValue="Invalid value" />
          <Input disabled placeholder="Disabled" />
        </div>
      </Section>

      <Section title="Progress bar">
        <div className="bg-surface-card border-surface-muted max-w-md space-y-3 rounded-md border p-5">
          <ProgressBar value={0.25} label="Brand 25%" />
          <ProgressBar value={0.6} accent="var(--color-area-health)" label="Health 60%" />
          <ProgressBar value={0.9} accent="var(--color-res-water)" label="Water 90%" />
        </div>
      </Section>

      <Section title="Avatar">
        <div className="bg-surface-card border-surface-muted flex items-center gap-3 rounded-md border p-5">
          <Avatar size="sm" name="Ada Lovelace" />
          <Avatar size="md" name="Ada Lovelace" />
          <Avatar size="lg" name="Ada Lovelace" />
          <Avatar size="lg" name="X" />
        </div>
      </Section>

      <Section title="Toggle / Checkbox">
        <div className="bg-surface-card border-surface-muted flex flex-wrap items-center gap-6 rounded-md border p-5">
          <div className="flex items-center gap-2">
            <Toggle checked={toggled} onCheckedChange={setToggled} label="Resource animations" />
            <span className="text-sm">Animations {toggled ? "on" : "off"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={checked} onCheckedChange={setChecked} label="Demo task" />
            <span className="text-sm">Task {checked ? "done" : "pending"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked
              onCheckedChange={() => undefined}
              label="Tinted demo"
              tint="var(--color-area-relationships)"
            />
            <span className="text-sm">Tinted (Relations)</span>
          </div>
        </div>
      </Section>

      <Section title="Icon">
        <div className="bg-surface-card border-surface-muted text-brand-700 flex flex-wrap items-center gap-4 rounded-md border p-5">
          <Icon size="sm" label="Check (small)">
            <polyline points="3,8 7,12 13,4" />
          </Icon>
          <Icon size="md" label="Check (medium)">
            <polyline points="4,11 9,16 18,5" />
          </Icon>
          <Icon size="lg" label="Check (large)">
            <polyline points="5,14 11,20 23,7" />
          </Icon>
        </div>
      </Section>

      <Section title="Modal">
        <div className="bg-surface-card border-surface-muted rounded-md border p-5">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Set priorities">
            <p className="text-brand-muted text-sm">
              Modals close on backdrop click and Esc by default. Pass{" "}
              <code className="text-brand-700">dismissable={"{false}"}</code> to lock them open
              (used for required onboarding steps).
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Confirm</Button>
            </div>
          </Modal>
        </div>
      </Section>
    </div>
  );
}
