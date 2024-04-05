import { Select, SelectItem } from '@nextui-org/select';

import TransactionType from '@/constants/TransactionType';
import { capitalize } from '@/utils/humanize';

export default function TransactionTypeFilterButton({ ...props }) {
  return (
    <Select
      aria-label='Transaction Type Filter'
      label='Transaction Type'
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
      {Object.values(TransactionType).map((type) => (
        <SelectItem key={type} value={type}>
          {capitalize(type)}
        </SelectItem>
      ))}
    </Select>
  );
}
