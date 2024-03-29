import { Modal, ModalBody, ModalContent } from '@nextui-org/modal';

import SidebarCanvas from '@/components/Sidebar/SidebarCanvas';
import UserSidebarItem from '@/constants/UserSidebarItem';

export default function MobileUserSidebar({ isOpen, onOpenChange }) {
  return (
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
              x: {
                duration: 0.3,
                ease: [0, 0, 0.2, 1],
              },
            },
          },
          exit: {
            x: -288,
            transition: {
              x: {
                duration: 0.2,
                ease: [0, 0, 0.2, 1],
              },
            },
          },
        },
      }}
      style={{
        '--sidebar-width': '288px',
      }}
      classNames={{
        wrapper: 'w-[var(--sidebar-width)] !items-start !justify-start',
        base: 'w-[var(--sidebar-width)] !m-0 p-0 h-full !border-r-small border-divider inset-y-0 left-0 max-h-[none] rounded-l-none !justify-star',
        body: 'p-0',
        closeButton: 'z-50',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <ModalBody>
            <SidebarCanvas items={UserSidebarItem} onClose={onClose} />
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
}
