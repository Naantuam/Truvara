export default function BrandMark({ size = "sm" }) {
  const badgeClasses = size === "lg" ? "w-16 h-16 text-2xl rounded-2xl" : "w-12 h-12 text-lg rounded-xl";
  const captionClasses = size === "lg" ? "text-sm" : "text-[10px]";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${badgeClasses} bg-blue-600 text-white font-black flex items-center justify-center tracking-tight`}>
        BMS
      </div>
      <span className={`${captionClasses} font-semibold text-gray-500 uppercase tracking-wider text-center leading-tight`}>
        Business Management System
      </span>
    </div>
  );
}
