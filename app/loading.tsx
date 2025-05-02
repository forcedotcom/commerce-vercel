export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
      <div className="flex items-center justify-center space-x-2">
        <div className="h-2 w-2 animate-[blink_1.4s_infinite] rounded-full bg-gray-500"></div>
        <div className="h-2 w-2 animate-[blink_1.4s_0.2s_infinite] rounded-full bg-gray-500"></div>
        <div className="h-2 w-2 animate-[blink_1.4s_0.4s_infinite] rounded-full bg-gray-500"></div>
      </div>
    </div>
  );
} 