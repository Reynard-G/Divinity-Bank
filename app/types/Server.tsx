import { Server as DBServer } from "~/lib/db/schema";

export type Server = {
  selectedServer: DBServer;
  setSelectedServer: (server: DBServer) => void;
};
