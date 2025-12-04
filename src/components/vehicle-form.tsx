import { useState } from 'react';
import { ParkingSlot, PricingRate } from '../App';
import { Car, Clock, DollarSign } from 'lucide-react';

interface VehicleFormProps {
  selectedSlot: ParkingSlot | null;
  pricingRates: PricingRate[];
  onCheckIn: (slotId: number, plateNumber: string, vehicleType: 'car' | 'motorcycle' | 'suv' | 'truck') => void;
  onCheckOut: (slotId: number) => void;
}

export function VehicleForm({ selectedSlot, pricingRates, onCheckIn, onCheckOut }: VehicleFormProps) {
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle' | 'suv' | 'truck'>('car');

  if (!selectedSlot) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Select a parking slot to manage</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plateNumber.trim()) {
      onCheckIn(selectedSlot.id, plateNumber.trim(), vehicleType);
      setPlateNumber('');
    }
  };

  if (selectedSlot.isOccupied && selectedSlot.vehicle) {
    const duration = (Date.now() - selectedSlot.vehicle.checkInTime.getTime()) / (1000 * 60 * 60);
    const rate = pricingRates.find(r => r.vehicleType === selectedSlot.vehicle!.vehicleType)?.hourlyRate || 0;
    const currentCost = duration * rate;

    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900">Slot #{selectedSlot.id}</p>
          <p className="text-red-700">Occupied</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-700">
            <Car className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-gray-500">Plate Number</p>
              <p>{selectedSlot.vehicle.plateNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Car className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-gray-500">Vehicle Type</p>
              <p className="capitalize">{selectedSlot.vehicle.vehicleType}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-gray-500">Duration</p>
              <p>{duration.toFixed(2)} hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-gray-500">Current Cost</p>
              <p>₱{currentCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onCheckOut(selectedSlot.id)}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Check Out Vehicle
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-900">Slot #{selectedSlot.id}</p>
        <p className="text-green-600">Available</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="plateNumber" className="block text-gray-700 mb-2">
            Plate Number
          </label>
          <input
            type="text"
            id="plateNumber"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ABC1234"
            required
          />
        </div>

        <div>
          <label htmlFor="vehicleType" className="block text-gray-700 mb-2">
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="motorcycle">Motorcycle</option>
            <option value="car">Car</option>
            <option value="suv">SUV</option>
            <option value="truck">Truck</option>
          </select>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-gray-600">Rate: ₱{pricingRates.find(r => r.vehicleType === vehicleType)?.hourlyRate || 0}/hour</p>
        </div>

        <button
          type="submit"
          className="w-full bg-red-700 text-white py-3 rounded-lg hover:bg-red-800 transition-colors"
        >
          Check In Vehicle
        </button>
      </form>
    </div>
  );
}