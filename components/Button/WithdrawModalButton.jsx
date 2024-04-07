import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/use-disclosure';

import WithdrawModal from '@/components/Modal/WithdrawModal';

export default function WithdrawModalButton({ ...props }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen} {...props}>
        Withdraw
      </Button>
      <WithdrawModal isOpen={isOpen} onClose={onOpenChange} />
    </>
  );
}
