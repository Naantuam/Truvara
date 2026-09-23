import BrandMark from "../../Reusable/BrandMark";

// Mobile-only fallback -- the desktop brand panel (AuthBrandPanel) carries
// the logo on larger screens, so this only needs to render below md.
export default function Logo() {
  return (
    <div className="flex md:hidden justify-center items-center py-2">
      <BrandMark variant="light" className="h-20 w-auto" />
    </div>
  );
}
