import { io } from 'socket.io-client';
import { SERVER_URL } from '@env';

const useSocket = () => {
  const socket = io(SERVER_URL);

  return socket;
};
export default useSocket;
