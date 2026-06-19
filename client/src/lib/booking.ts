import { api } from './api';

export const ensureRoomAvailability = async (roomId: string, checkInISO: string, checkOutISO: string): Promise<void> => {
  try {
    const res = await api.get(`/bookings/check-availability?room_id=${roomId}&check_in=${checkInISO}&check_out=${checkOutISO}`);
    if (!res.available) {
      throw new Error('Selected dates are not available for this room.');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to validate room availability');
  }
};

