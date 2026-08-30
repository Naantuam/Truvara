const COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"];

function getInitials(name = "") {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function DepartmentAvatar({ name, index = 0, size = "md" }) {
  const color = COLORS[index % COLORS.length];
  const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm";

  return (
    <div className={`${sizeClasses} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
}
