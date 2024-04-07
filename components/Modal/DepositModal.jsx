import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/modal';
import { Button } from '@nextui-org/button';

export default function DepositModal({ isOpen, onOpenChange, ...props }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} {...props}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Deposit</ModalHeader>
            <ModalBody>
              <p>Deposit funds into your account</p>
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