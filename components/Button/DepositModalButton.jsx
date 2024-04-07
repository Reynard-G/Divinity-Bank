import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/use-disclosure';

import DepositModal from '@/components/Modal/DepositModal';

export default function DepositModalButton({ ...props }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen} {...props}>
        Deposit
      </Button>
      <DepositModal isOpen={isOpen} onClose={onOpenChange} />
    </>
  );
}