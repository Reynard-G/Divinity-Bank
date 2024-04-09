import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

import { withdraw } from '@/lib/actions/transaction.actions';

export default function WithdrawModal({ isOpen, onOpenChange, ...props }) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [isWithdrawalLoading, setIsWithdrawalLoading] = useState(false);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} {...props}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Withdraw</ModalHeader>
            <ModalBody>
              {/**
               * Amount
               */}
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
                isDisabled={!amount}
                isLoading={isWithdrawalLoading}
                color='primary'
                variant='ghost'
                onPress={async () => {
                  setIsWithdrawalLoading(true);
                  await withdraw(amount).then((transaction) => {
                    if (transaction) {
                      onClose();
                      router.push(`/myaccount/transactions/${transaction.id}`);
                    }
                    setIsWithdrawalLoading(false);
                  });
                }}
              >
                Withdraw
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
