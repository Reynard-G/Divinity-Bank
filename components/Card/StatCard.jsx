import cn from '@/utils/cn';

export default function StatCard({
  title,
  percentageChange,
  value,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t-1 border-gray-200/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8',
        className,
      )}
    >
      <dt className='text-sm font-medium leading-6 text-gray-400'>{title}</dt>

      {percentageChange && (
        <dd
          className={cn('text-xs font-medium', {
            'text-emerald-500': percentageChange > 0,
            'text-rose-600': percentageChange < 0,
          })}
        >
          {Intl.NumberFormat('en-US', {
            style: 'percent',
            signDisplay: 'exceptZero',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(percentageChange / 100)}
        </dd>
      )}

      <dd className='w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-100'>
        {value}
      </dd>
    </div>
  );
}
