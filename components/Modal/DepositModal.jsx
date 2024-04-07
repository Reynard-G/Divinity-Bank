import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/modal';

export default function DepositModal({ isOpen, onOpenChange, ...props }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} {...props}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Deposit</ModalHeader>
            <ModalBody>
              {/**
               * Amount
               * Screenshot
               */}
              <Input
                label='Amount'
                placeholder='Enter the amount to deposit'
                type='number'
              />
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose} color='danger' variant='ghost'>
                Close
              </Button>
              <Button onPress={onClose} color='primary' variant='ghost'>
                Deposit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
