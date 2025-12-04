import { useState } from 'react';
import { PricingRate } from '../App';
import { DollarSign, Edit2, Check, X } from 'lucide-react';

interface PricingManagerProps {
  pricingRates: PricingRate[];
  setPricingRates: (rates: PricingRate[]) => void;
}

export function PricingManager({ pricingRates, setPricingRates }: PricingManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const handleEdit = (rate: PricingRate) => {
    setEditingId(rate.id);
    setEditValue(rate.hourlyRate);
  };

  const handleSave = (id: string) => {
    setPricingRates(
      pricingRates.map(rate =>
        rate.id === id ? { ...rate, hourlyRate: editValue } : rate
      )
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="w-6 h-6 text-red-700" />
        <h2 className="text-gray-900">Pricing Management</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pricingRates.map((rate) => (
          <div
            key={rate.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <p className="text-gray-700 capitalize mb-3">{rate.vehicleType}</p>
            
            {editingId === rate.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">₱</span>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    min="0"
                    step="5"
                  />
                  <span className="text-gray-600">/hr</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(rate.id)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-blue-600">₱{rate.hourlyRate}/hour</p>
                <button
                  onClick={() => handleEdit(rate)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Rate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}