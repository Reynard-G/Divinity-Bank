'use client';

import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/use-disclosure';

import TransferModal from '@/components/Modal/TransferModal';

export default function TransferModalButton({ ...props }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen} {...props}>
        Transfer
      </Button>
      <TransferModal isOpen={isOpen} onClose={onOpenChange} />
    </>
  );
}
