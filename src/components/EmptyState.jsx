import { BookOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = BookOpen,
  title = 'No records found',
  description = 'Try adjusting your search or add a new item.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="h-14 w-14 rounded-full bg-crimson-light flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-crimson" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-md">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
