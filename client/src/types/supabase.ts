export interface Room {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  amenities: string[];
  images: string[];
  status?: string;
  capacity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BookingRecord {
  id: string;
  user_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  room?: Room;
  profile?: Profile;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  created_at?: string;
  email?: string | null;
}

export interface BookingPayload {
  roomId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

export const toRoom = (row: any): Room => ({
  id: String(row?.id ?? ''),
  name: String(row?.name ?? ''),
  type: String(row?.type ?? ''),
  description: String(row?.description ?? ''),
  price: Number(row?.price ?? 0),
  amenities: Array.isArray(row?.amenities) ? row.amenities : [],
  images: Array.isArray(row?.images) ? row.images : [],
  status: row?.status ? String(row.status) : undefined,
  capacity: row?.capacity === undefined ? undefined : Number(row.capacity),
  created_at: row?.created_at ? String(row.created_at) : undefined,
  updated_at: row?.updated_at ? String(row.updated_at) : undefined,
});
