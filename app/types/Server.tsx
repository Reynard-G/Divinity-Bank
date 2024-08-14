import { Server as DBServer } from "~/lib/db/schema";

export type Server = {
  selectedServer: DBServer | null;
  setSelectedServer: (server: DBServer | null) => void;
};
