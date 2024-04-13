'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Autocomplete, AutocompleteItem } from '@nextui-org/autocomplete';
import { Avatar } from '@nextui-org/avatar';
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
import useSWR from 'swr';

import API from '@/constants/API';
import { useUserContext } from '@/contexts';
import { transfer } from '@/lib/actions/transaction.actions';
import crafatarURL from '@/utils/crafatarURL';
import fetcher from '@/utils/fetcher';

export default function TransferModal({ isOpen, onOpenChange, ...props }) {
  const router = useRouter();
  const { userId } = useUserContext();
  const [recipientUserId, setRecipientUserId] = useState(null);
  const [amount, setAmount] = useState('');
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const { data: users } = useSWR(API.USERS, fetcher);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} {...props}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Transfer</ModalHeader>
            <ModalBody>
              <Autocomplete
                defaultItems={users.filter((user) => user.id !== userId)}
                label='Player'
                variant='bordered'
                placeholder='Search for a player'
                onSelectionChange={(userId) =>
                  setRecipientUserId(parseInt(userId))
                }
              >
                {(user) => (
                  <AutocompleteItem
                    key={user.id}
                    textValue={user.minecraft_username}
                  >
                    <div className='flex items-center gap-2'>
                      <Avatar
                        alt={user.minecraft_username}
                        className='flex-shrink-0'
                        size='sm'
                        src={crafatarURL(user.minecraft_uuid, 32)}
                      />
                      <div className='flex flex-col'>
                        <span className='text-small'>
                          {user.minecraft_username}
                        </span>
                        <span className='text-tiny text-default-400'>
                          {user.discord_username}
                        </span>
                      </div>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
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
                isDisabled={!recipientUserId || !amount || amount <= 0}
                isLoading={isTransferLoading}
                color='primary'
                variant='ghost'
                onPress={async () => {
                  setIsTransferLoading(true);
                  await transfer(amount, recipientUserId).then(
                    (transaction) => {
                      if (transaction) {
                        onClose();
                        router.push(
                          `/myaccount/transactions/${transaction.id}`,
                        );
                      }
                      setIsTransferLoading(false);
                    },
                  );
                }}
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
