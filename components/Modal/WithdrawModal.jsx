import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/modal';
import { Button } from '@nextui-org/button';

export default function WithdrawModal({ isOpen, onOpenChange, ...props }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} {...props}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Withdraw</ModalHeader>
            <ModalBody>
              <p>Withdraw funds from your account</p>
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