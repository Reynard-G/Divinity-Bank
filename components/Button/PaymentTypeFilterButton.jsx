import { Select, SelectItem } from '@nextui-org/select';

import PaymentType from '@/constants/PaymentType';
import { capitalize } from '@/utils/humanize';

export default function PaymentTypeFilterButton({ ...props }) {
  return (
    <Select
      aria-label='Payment Type Filter'
      label='Payment Type'
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
      {Object.values(PaymentType).map((type) => (
        <SelectItem key={type} value={type}>
          {capitalize(type)}
        </SelectItem>
      ))}
    </Select>
  );
}
