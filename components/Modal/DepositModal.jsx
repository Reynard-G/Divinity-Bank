'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { Button } from '@nextui-org/button';
import { Image } from '@nextui-org/image';
import { Input } from '@nextui-org/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/modal';
import { DollarSign, Image as ImageIcon } from 'lucide-react';

import { deposit } from '@/lib/actions/transaction.actions';
import base64FromFile from '@/utils/base64FromFile';

export default function DepositModal({ isOpen, onOpenChange, ...props }) {
  const router = useRouter();
  const fileLimit = 5 * 1024 ** 2; // 5MiB
  const [amount, setAmount] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isDepositLoading, setIsDepositLoading] = useState(false);

  const previewImage = (file) => {
    if (!file) return null;

    const imageUrl = URL.createObjectURL(file);
    return (
      <Image
        src={imageUrl}
        alt='Attachment preview'
        className='h-full w-full'
        onLoad={() => URL.revokeObjectURL(imageUrl)}
      />
    );
  };

  return (
    <Modal
      size='3xl'
      scrollBehavior='inside'
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      {...props}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Deposit</ModalHeader>
            <ModalBody>
              <Input
                type='number'
                placeholder='0.00'
                value={amount}
                startContent={<DollarSign size={20} />}
                onValueChange={setAmount}
              />
              <Dropzone
                loading={isDepositLoading}
                accept={IMAGE_MIME_TYPE}
                maxSize={fileLimit}
                maxFiles={1}
                onDrop={(file) => setAttachment(file[0])}
                className='box-border !rounded-lg !border-2 !border-dashed !border-neutral-500 !bg-neutral-800 !p-4'
              >
                <div className='pointer-events-none flex min-h-52 flex-col flex-wrap items-center justify-center gap-4 xl:flex-row xl:gap-8'>
                  <ImageIcon size={64} strokeWidth={1} />
                  <div>
                    <p className='text-lg font-semibold'>
                      Drag images here or click to select files
                    </p>
                    <p className='text-sm'>
                      Attach a maximum of 1 file, the file should not exceed{' '}
                      {fileLimit / 1024 ** 2} MiB
                    </p>
                  </div>
                </div>
              </Dropzone>
              <div className='mx-auto mt-4 max-w-72'>
                {previewImage(attachment)}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose} color='danger' variant='ghost'>
                Close
              </Button>
              <Button
                isDisabled={!amount || !attachment || amount <= 0}
                isLoading={isDepositLoading}
                color='primary'
                variant='ghost'
                onPress={async () => {
                  const base64 = await base64FromFile(attachment);

                  setIsDepositLoading(true);
                  await deposit(amount, base64).then((transaction) => {
                    if (transaction) {
                      onClose();
                      router.push(`/myaccount/transactions/${transaction.id}`);
                    }
                    setIsDepositLoading(false);
                  });
                }}
              >
                Deposit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
