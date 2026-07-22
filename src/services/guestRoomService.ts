import api from "./api";

export interface GuestRoom {
  id: string;
  roomNo: string;
  type: string;
  price: number;
  status: string;
  amenities: string[];
  photo: string;
  photos?: string[];
  description?: string;
}

export interface GetGuestRoomsParams {
  status?: string;
  roomType?: string;
  maxPrice?: number;
}

interface GuestRoomsResponse {
  message: string;
  rooms: GuestRoom[];
}

interface GuestRoomResponse {
  message: string;
  room: GuestRoom;
}

export async function getGuestRooms(
  params?: GetGuestRoomsParams
): Promise<GuestRoom[]> {
  const response = await api.get<GuestRoomsResponse>(
    "/guest/rooms",
    {
      params,
    }
  );

  return response.data.rooms;
}

export async function getGuestRoom(
  roomId: string
): Promise<GuestRoom> {
  const response = await api.get<GuestRoomResponse>(
    `/guest/rooms/${roomId}`
  );

  return response.data.room;
}