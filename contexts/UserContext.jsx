import { createContext, useState } from 'react';

export const UserContext = createContext({
  userId: '',
  minecraftUUID: '',
  minecraftUsername: '',
  discordUsername: '',
  createdAt: 0, // Unix timestamp for creation time
  updatedAt: 0, // Unix timestamp for last update time
  setUserId: () => {},
  setMinecraftUUID: () => {},
  setMinecraftUsername: () => {},
  setDiscordUsername: () => {},
  setCreatedAt: () => {},
  setUpdatedAt: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [userId, setUserId] = useState('');
  const [minecraftUUID, setMinecraftUUID] = useState('');
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [createdAt, setCreatedAt] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(0);

  return (
    <UserContext.Provider
      value={{
        userId,
        minecraftUUID,
        minecraftUsername,
        discordUsername,
        createdAt,
        updatedAt,
        setUserId,
        setMinecraftUUID,
        setMinecraftUsername,
        setDiscordUsername,
        setCreatedAt,
        setUpdatedAt,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
