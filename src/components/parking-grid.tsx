import { ParkingSlot } from '../App';

interface ParkingGridProps {
  slots: ParkingSlot[];
  isAdmin: boolean;
  onSlotClick?: (slot: ParkingSlot) => void;
  selectedSlot?: ParkingSlot | null;
}

export function ParkingGrid({ slots, isAdmin, onSlotClick, selectedSlot }: ParkingGridProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.id}
          onClick={() => isAdmin && onSlotClick?.(slot)}
          disabled={!isAdmin}
          className={`
            aspect-square rounded-lg border-2 transition-all
            ${slot.isOccupied ? 'bg-red-500 border-red-600' : 'bg-green-500 border-green-600'}
            ${isAdmin ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
            ${selectedSlot?.id === slot.id ? 'ring-4 ring-blue-400 scale-105' : ''}
          `}
          title={`Slot ${slot.id}${slot.vehicle ? ` - ${slot.vehicle.plateNumber}` : ''}`}
        >
          <span className="text-white">{slot.id}</span>
        </button>
      ))}
    </div>
  );
}
