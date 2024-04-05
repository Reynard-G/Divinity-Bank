import { Select, SelectItem } from '@nextui-org/select';

import TransactionStatus from '@/constants/TransactionStatus';
import { capitalize } from '@/utils/humanize';

export default function StatusFilterButton({ ...props }) {
  return (
    <Select
      aria-label='Status Filter'
      label='Status'
      size='sm'
      color='primary'
      variant='bordered'
      selectionMode='multiple'
      classNames={{
        base: 'items-center justify-end max-w-fit',
        value: 'w-36',
      }}
      {...props}
    >
      {Object.values(TransactionStatus).map((status) => (
        <SelectItem key={status} value={status}>
          {capitalize(status)}
        </SelectItem>
      ))}
    </Select>
  );
}
