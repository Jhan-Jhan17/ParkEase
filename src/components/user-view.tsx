import { ParkingSlot, PricingRate } from '../App';
import { ParkingGrid } from './parking-grid';
import { DollarSign, Car, Bike, Truck } from 'lucide-react';

interface UserViewProps {
  parkingSlots: ParkingSlot[];
  pricingRates: PricingRate[];
}

export function UserView({ parkingSlots, pricingRates }: UserViewProps) {
  const availableSlots = parkingSlots.filter(slot => !slot.isOccupied).length;
  const totalSlots = parkingSlots.length;
  const occupancyRate = ((totalSlots - availableSlots) / totalSlots * 100).toFixed(1);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'motorcycle':
        return <Bike className="w-5 h-5" />;
      case 'truck':
        return <Truck className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Available Slots</p>
              <p className="text-green-600">{availableSlots} / {totalSlots}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Car className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Occupancy Rate</p>
              <p className="text-red-700">{occupancyRate}%</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Capacity</p>
              <p className="text-purple-600">{totalSlots} Slots</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Rates */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-gray-900 mb-4">Parking Rates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pricingRates.map((rate) => (
            <div
              key={rate.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-red-400 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                {getVehicleIcon(rate.vehicleType)}
                <span className="text-gray-700 capitalize">{rate.vehicleType}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-red-700">₱{rate.hourlyRate}</span>
                <span className="text-gray-500">/hour</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parking Grid */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-gray-900 mb-4">Parking Availability</h2>
        <div className="mb-4 flex items-center gap-6 text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Occupied</span>
          </div>
        </div>
        <ParkingGrid slots={parkingSlots} isAdmin={false} />
      </div>
    </div>
  );
}