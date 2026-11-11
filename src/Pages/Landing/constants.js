// BrandMark (src/Reusable/BrandMark.jsx) only maps to the vertical lockup
// (tree stacked over "TRUVARA") -- fine in the sidebar where it's sized by
// width, but squashed illegible at navbar height. This page needs the
// actual horizontal lockup, loaded directly. Dark mode uses a lightened
// recolor of the same mark (the original dark-green ink is unreadable
// against a dark background) -- no tagline baked into either file.
// The plain crop renders muddy at the small sizes used here (nav/footer are
// ~28-36px tall, and the tree icon's fine detail collapses at that size) --
// these are a sharpened, higher-contrast render of the same artwork, sized
// for compact UI use rather than the full-size hero/marketing lockup.
export const HORIZONTAL_LOGO_LIGHT = "/assets/truvara-logo-horizontal-compact.png";
export const HORIZONTAL_LOGO_DARK = "/assets/truvara-logo-horizontal-compact-dark.png";
