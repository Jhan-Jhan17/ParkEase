import { useState } from 'react';
import { ParkingSlot, PricingRate, Transaction } from '../App';
import { ParkingGrid } from './parking-grid';
import { VehicleForm } from './vehicle-form';
import { PricingManager } from './pricing-manager';
import { Car, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  parkingSlots: ParkingSlot[];
  setParkingSlots: (slots: ParkingSlot[]) => void;
  pricingRates: PricingRate[];
  setPricingRates: (rates: PricingRate[]) => void;
  addTransaction: (transaction: Transaction) => void;
}

export function AdminDashboard({
  parkingSlots,
  setParkingSlots,
  pricingRates,
  setPricingRates,
  addTransaction
}: AdminDashboardProps) {
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const availableSlots = parkingSlots.filter(slot => !slot.isOccupied).length;
  const totalSlots = parkingSlots.length;
  
  // Calculate total revenue
  const totalRevenue = parkingSlots.reduce((sum, slot) => {
    if (slot.isOccupied && slot.vehicle) {
      const hours = (Date.now() - slot.vehicle.checkInTime.getTime()) / (1000 * 60 * 60);
      const rate = pricingRates.find(r => r.vehicleType === slot.vehicle!.vehicleType)?.hourlyRate || 0;
      return sum + (hours * rate);
    }
    return sum;
  }, 0);

  const handleSlotClick = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
  };

  const handleCheckIn = (slotId: number, plateNumber: string, vehicleType: 'car' | 'motorcycle' | 'suv' | 'truck') => {
    setParkingSlots(parkingSlots.map(slot => 
      slot.id === slotId 
        ? { 
            ...slot, 
            isOccupied: true, 
            vehicle: { plateNumber, vehicleType, checkInTime: new Date() }
          }
        : slot
    ));
    setSelectedSlot(null);
  };

  const handleCheckOut = (slotId: number) => {
    const slot = parkingSlots.find(s => s.id === slotId);
    if (slot?.vehicle) {
      const checkOutTime = new Date();
      const hours = (checkOutTime.getTime() - slot.vehicle.checkInTime.getTime()) / (1000 * 60 * 60);
      const rate = pricingRates.find(r => r.vehicleType === slot.vehicle!.vehicleType)?.hourlyRate || 0;
      const cost = hours * rate;
      
      if (confirm(`Total cost: ₱${cost.toFixed(2)}\nDuration: ${hours.toFixed(2)} hours\n\nConfirm checkout?`)) {
        // Create transaction record
        const transaction: Transaction = {
          id: `txn-${Date.now()}`,
          plateNumber: slot.vehicle.plateNumber,
          vehicleType: slot.vehicle.vehicleType,
          checkInTime: slot.vehicle.checkInTime,
          checkOutTime: checkOutTime,
          duration: hours,
          cost: cost,
          slotId: slotId
        };
        
        addTransaction(transaction);
        
        setParkingSlots(parkingSlots.map(s => 
          s.id === slotId 
            ? { ...s, isOccupied: false, vehicle: undefined }
            : s
        ));
        setSelectedSlot(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Available Slots</p>
              <p className="text-green-600">{availableSlots}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Car className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Occupied Slots</p>
              <p className="text-red-600">{totalSlots - availableSlots}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Car className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active Revenue</p>
              <p className="text-red-700">₱{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Occupancy Rate</p>
              <p className="text-purple-600">{((totalSlots - availableSlots) / totalSlots * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Manager */}
      <PricingManager pricingRates={pricingRates} setPricingRates={setPricingRates} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parking Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-gray-900 mb-4">Parking Layout</h2>
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
          <ParkingGrid 
            slots={parkingSlots} 
            isAdmin={true} 
            onSlotClick={handleSlotClick}
            selectedSlot={selectedSlot}
          />
        </div>

        {/* Vehicle Management Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-gray-900 mb-4">Vehicle Management</h2>
          <VehicleForm
            selectedSlot={selectedSlot}
            pricingRates={pricingRates}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </div>
      </div>
    </div>
  );
}