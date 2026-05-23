import { AsciiBackground } from '@/shared/ui/ascii-background';

const ScreenBackground = () => {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-shell-glow" />
      <AsciiBackground />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-shell-grid" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-shell-vignette" />
    </>
  );
};

export { ScreenBackground };
