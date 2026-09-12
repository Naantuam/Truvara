import { STAGES } from "./stages";

export default function ProgressDots({ stage }) {
  const currentIndex = STAGES.indexOf(stage);

  return (
    <div className="flex items-center">
      {STAGES.map((s, index) => (
        <div key={s} className="flex items-center">
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              index < currentIndex ? "bg-green-500" : index === currentIndex ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
          {index < STAGES.length - 1 && (
            <span className={`w-6 h-px ${index < currentIndex ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
