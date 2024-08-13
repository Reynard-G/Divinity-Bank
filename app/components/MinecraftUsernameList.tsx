import { IconCheck } from "@tabler/icons-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { cn } from "~/lib/utils/cn";
import { NonSensitiveUser } from "~/types/User";

interface UsersListProps {
  users: NonSensitiveUser[];
  selectedUser: NonSensitiveUser | null;
  onUserSelect: (user: NonSensitiveUser) => void;
}

export default function UsersList({
  users,
  selectedUser,
  onUserSelect,
}: UsersListProps) {
  return (
    <Command>
      <CommandInput placeholder="Search for a user..." />
      <CommandList>
        <CommandEmpty>No users found.</CommandEmpty>
        <CommandGroup>
          {users.map((user) => (
            <CommandItem
              key={user.id}
              value={user.minecraft_username}
              onSelect={() => {
                onUserSelect(user);
              }}
            >
              <IconCheck
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedUser?.minecraft_username === user.minecraft_username
                    ? "opacity-100"
                    : "opacity-0",
                )}
              />
              {user.minecraft_username}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
