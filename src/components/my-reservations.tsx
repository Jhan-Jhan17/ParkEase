import { useState } from 'react';
import { Reservation, ParkingSlot, PricingRate, User } from '../App';
import { Calendar, Plus, XCircle } from 'lucide-react';

interface MyReservationsProps {
  reservations: Reservation[];
  setReservations: (reservations: Reservation[]) => void;
  parkingSlots: ParkingSlot[];
  pricingRates: PricingRate[];
  currentUser: User;
}

export function MyReservations({
  reservations,
  setReservations,
  parkingSlots,
  pricingRates,
  currentUser
}: MyReservationsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReservation, setNewReservation] = useState({
    plateNumber: '',
    vehicleType: 'car' as 'car' | 'motorcycle' | 'suv' | 'truck',
    slotId: 0,
    date: ''
  });

  const availableSlots = parkingSlots.filter(s => !s.isOccupied);

  const handleAddReservation = () => {
    if (!newReservation.plateNumber || !newReservation.slotId || !newReservation.date) {
      alert('Please fill in all fields');
      return;
    }

    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      username: currentUser.username,
      plateNumber: newReservation.plateNumber,
      vehicleType: newReservation.vehicleType,
      slotId: newReservation.slotId,
      date: new Date(newReservation.date),
      status: 'pending'
    };

    // Add to all reservations
    setReservations([...reservations, reservation]);
    setNewReservation({ plateNumber: '', vehicleType: 'car', slotId: 0, date: '' });
    setShowAddModal(false);
  };

  const handleCancelReservation = (id: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      setReservations(reservations.map(r =>
        r.id === id ? { ...r, status: 'cancelled' } : r
      ));
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">My Reservations</p>
              <p className="text-blue-600">{reservations.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active</p>
              <p className="text-green-600">
                {reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Available Slots</p>
              <p className="text-purple-600">{availableSlots.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Reservation Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Reservation
        </button>
      </div>

      {/* Reservations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <span className={`px-3 py-1 rounded-full capitalize ${getStatusColor(reservation.status)}`}>
                {reservation.status}
              </span>
              {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                <button
                  onClick={() => handleCancelReservation(reservation.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Cancel Reservation"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-gray-500">Plate Number</p>
                <p className="text-gray-900">{reservation.plateNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Vehicle Type</p>
                <p className="text-gray-900 capitalize">{reservation.vehicleType}</p>
              </div>
              <div>
                <p className="text-gray-500">Slot</p>
                <p className="text-gray-900">#{reservation.slotId}</p>
              </div>
              <div>
                <p className="text-gray-500">Date & Time</p>
                <p className="text-gray-900">{formatDate(reservation.date)}</p>
              </div>
              <div>
                <p className="text-gray-500">Rate</p>
                <p className="text-green-600">
                  ₱{pricingRates.find(r => r.vehicleType === reservation.vehicleType)?.hourlyRate || 0}/hour
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reservations.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">You don't have any reservations yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Your First Reservation
          </button>
        </div>
      )}

      {/* Add Reservation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-gray-900 mb-6">New Reservation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Plate Number</label>
                <input
                  type="text"
                  value={newReservation.plateNumber}
                  onChange={(e) => setNewReservation({ ...newReservation, plateNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ABC1234"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={newReservation.vehicleType}
                  onChange={(e) => setNewReservation({ ...newReservation, vehicleType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="motorcycle">Motorcycle</option>
                  <option value="car">Car</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Parking Slot</label>
                <select
                  value={newReservation.slotId}
                  onChange={(e) => setNewReservation({ ...newReservation, slotId: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Select a slot</option>
                  {availableSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      Slot #{slot.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={newReservation.date}
                  onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-gray-600">
                  Rate: ₱{pricingRates.find(r => r.vehicleType === newReservation.vehicleType)?.hourlyRate || 0}/hour
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddReservation}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Reservation
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
