"use client";

import { useState, useCallback } from "react";

import { Check } from "lucide-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { searchMinecraftUsers } from "@/lib/db/queries/user.queries";
import type { MinecraftUser } from "@/lib/db/queries/user.queries";
import { cn } from "@/lib/utils/cn";

interface MinecraftUsernameListProps {
  selectedUser: MinecraftUser | null;
  onUserSelect: (user: MinecraftUser) => void;
}

export function MinecraftUsernameList({
  selectedUser,
  onUserSelect,
}: MinecraftUsernameListProps) {
  const [users, setUsers] = useState<MinecraftUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUsers = useCallback(async (query: string) => {
    if (query.length < 3) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await searchMinecraftUsers(query);
      setUsers(result);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedFetchUsers = useDebouncedCallback(fetchUsers, 300);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (value.length < 3) {
        setUsers([]);
        setIsLoading(false);
      } else {
        debouncedFetchUsers(value);
      }
    },
    [debouncedFetchUsers]
  );

  return (
    <Command>
      <CommandInput
        placeholder="Search for a user..."
        value={searchQuery}
        onValueChange={handleSearchChange}
      />
      <CommandList>
        {isLoading ? (
          <CommandEmpty>Searching...</CommandEmpty>
        ) : searchQuery.length < 3 ? (
          <CommandEmpty>
            Type at least 3 characters to search for users...
          </CommandEmpty>
        ) : users.length === 0 ? (
          <CommandEmpty>No users found.</CommandEmpty>
        ) : (
          <CommandGroup>
            {users.map((user) => (
              <CommandItem
                key={user.id}
                value={user.minecraftUsername}
                onSelect={() => {
                  onUserSelect(user);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedUser?.minecraftUsername === user.minecraftUsername
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <Avatar className="mr-2 h-6 w-6 rounded-sm">
                  <AvatarImage
                    src={`https://crafatar.com/avatars/${user.minecraftUuid}?size=24&overlay`}
                    alt={user.minecraftUsername}
                  />
                </Avatar>
                {user.minecraftUsername}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
