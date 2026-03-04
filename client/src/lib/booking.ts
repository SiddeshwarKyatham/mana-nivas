import { supabase } from '../supabaseClient';

export const ensureRoomAvailability = async (roomId: string, checkInISO: string, checkOutISO: string): Promise<void> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', roomId)
    .neq('status', 'cancelled')
    .lt('check_in', checkOutISO)
    .gt('check_out', checkInISO)
    .limit(1);

  if (error) {
    throw new Error(error.message || 'Failed to validate room availability');
  }

  if ((data || []).length > 0) {
    throw new Error('Selected dates are not available for this room.');
  }
};
