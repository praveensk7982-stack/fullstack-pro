import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-crimson" />
        <p className="text-sm font-medium text-gray-600">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-crimson" />
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}
