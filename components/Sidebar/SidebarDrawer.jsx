import { Modal, ModalBody, ModalContent } from '@nextui-org/modal';

import SidebarCanvas from '@/components/Sidebar/SidebarCanvas';
import UserSidebarItem from '@/constants/UserSidebarItem';

export default function SidebarDrawer({
  isOpen,
  onOpenChange,
  ...props
}) {
  return (
    <div {...props}>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        radius='none'
        scrollBehavior='inside'
        motionProps={{
          variants: {
            enter: {
              x: 0,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              x: -288,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}
        classNames={{
          wrapper: '!items-start !justify-start max-w-[288px]',
          base: 'justify-start !m-0 p-0 h-full max-h-full !border-r-small border-divider',
          body: 'p-0',
          closeButton: 'z-50',
        }}
      >
        <ModalContent>
          <ModalBody>
            <SidebarCanvas items={UserSidebarItem} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
