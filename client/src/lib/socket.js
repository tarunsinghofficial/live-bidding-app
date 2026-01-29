import { io } from "socket.io-client";

const DEFAULT_SOCKET_URL = "http://localhost:5000";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.trim() || DEFAULT_SOCKET_URL;

export function createSocket() {
  return io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
  });
}
