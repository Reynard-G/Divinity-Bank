import { useState } from 'react';

//import { useRouter } from 'next/navigation';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/modal';
import { DollarSign } from 'lucide-react';

import { transfer } from '@/lib/actions/transaction.actions';

export default function TransferModal({ isOpen, onOpenChange, ...props }) {
  //const router = useRouter();
  const [amount, setAmount] = useState('');
  const [isTransferLoading /*, setIsTransferLoading*/] = useState(false);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} {...props}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Transfer</ModalHeader>
            <ModalBody>
              {/**
               * Player
               * Amount
               */}
              <Input
                type='text'
                placeholder='Player'
                startContent={<DollarSign size={20} />}
                onValueChange={setAmount}
              />
              <Input
                type='number'
                placeholder='0.00'
                value={amount}
                startContent={<DollarSign size={20} />}
                onValueChange={setAmount}
              />
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='ghost' onPress={onClose}>
                Close
              </Button>
              <Button
                isDisabled={!amount || amount <= 0}
                isLoading={isTransferLoading}
                color='primary'
                variant='ghost'
              >
                Transfer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
