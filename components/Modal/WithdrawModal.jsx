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

export default function WithdrawModal({ isOpen, onOpenChange, ...props }) {
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
                placeholder='Enter the amount to withdraw'
                startContent={<DollarSign size={20} />}
              />
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose} color='danger' variant='ghost'>
                Close
              </Button>
              <Button onPress={onClose} color='primary' variant='ghost'>
                Withdraw
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
