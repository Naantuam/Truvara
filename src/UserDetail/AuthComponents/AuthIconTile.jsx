// The black tile with a gold icon at the top of each auth page -- the same
// look an input's icon takes while that field is focused.
export default function AuthIconTile({ children, className = "" }) {
  return (
    <div className={`w-14 h-14 rounded-2xl bg-black text-gold-300 flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}
