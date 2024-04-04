import { createContext, useState } from 'react';

export const UserContext = createContext({
  userId: '',
  accountType: '',
  minecraftUUID: '',
  minecraftUsername: '',
  discordUsername: '',
  interestRate: 0,
  transactionFee: 0,
  createdAt: 0, // Unix timestamp for creation time
  updatedAt: 0, // Unix timestamp for last update time
  setUserId: () => {},
  setAccountType: () => {},
  setMinecraftUUID: () => {},
  setMinecraftUsername: () => {},
  setDiscordUsername: () => {},
  setInterestRate: () => {},
  setTransactionFee: () => {},
  setCreatedAt: () => {},
  setUpdatedAt: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [userId, setUserId] = useState('');
  const [accountType, setAccountType] = useState('');
  const [minecraftUUID, setMinecraftUUID] = useState('');
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [interestRate, setInterestRate] = useState(0);
  const [transactionFee, setTransactionFee] = useState(0);
  const [createdAt, setCreatedAt] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(0);

  return (
    <UserContext.Provider
      value={{
        userId,
        accountType,
        minecraftUUID,
        minecraftUsername,
        discordUsername,
        interestRate,
        transactionFee,
        createdAt,
        updatedAt,
        setUserId,
        setAccountType,
        setMinecraftUUID,
        setMinecraftUsername,
        setDiscordUsername,
        setInterestRate,
        setTransactionFee,
        setCreatedAt,
        setUpdatedAt,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
