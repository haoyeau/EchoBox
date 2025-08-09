// Shared types for the EchoBox application

export interface Room {
  id: string;
  name: string;
  createdAt?: string; // was created_at
}

export interface Message {
  id: number;
  room_id?: string;
  content: string;
  timestamp: string;
}

export interface PaginatedMessages {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SocketMessage {
  roomId: string;
  message: string | { content: string };
}

export interface SocketJoinRoom {
  roomId: string;
}

export interface SocketLeaveRoom {
  roomId: string;
}

export interface SocketError {
  message: string;
}
