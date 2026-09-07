import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export function OrderCard({ order, onUpdateStatus }) {
  // Ensure items array exists
  const items = order.items || [];

  // Recalculate total if order.totalAmount is 0 or missing
  const calculatedTotal = items.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + price * qty;
  }, 0);

  const displayTotal = order.totalAmount && Number(order.totalAmount) > 0 
    ? Number(order.totalAmount) 
    : calculatedTotal;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new':
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="font-semibold text-stone-900">
              ORDER #{order.id ? order.id.slice(-4).toUpperCase() : '----'}
            </span>
            {order.customerName && (
              <p className="text-sm text-stone-600 mt-0.5">👤 {order.customerName}</p>
            )}
            {order.tableNumber && (
              <p className="text-xs text-stone-500 mt-0.5">Table: {order.tableNumber}</p>
            )}
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeClass(order.status)}`}>
            {order.status === 'new' || order.status === 'received' ? '⏱️ New / Received' : order.status}
          </span>
        </div>

        <div className="border-t border-b border-stone-100 py-3 my-3">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Items Ordered:</p>
          <div className="space-y-1.5">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-stone-700">
                  {item.name || item.title || 'Item'} × {item.quantity || 1}
                </span>
                <span className="text-stone-500">
                  {formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-base font-semibold text-stone-900 mt-3 pt-2 border-t border-dashed border-stone-200">
            <span>Total:</span>
            <span>{formatCurrency(displayTotal)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-2">
        <p className="text-xs text-stone-500 font-medium">Update Order Status:</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            disabled={order.status === 'preparing'}
            className="px-2 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            🍳 Mark Preparing
          </button>
          <button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            disabled={order.status === 'completed'}
            className="px-2 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ❇️ Mark Completed
          </button>
          <button
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            disabled={order.status === 'cancelled'}
            className="px-2 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 disabled:opacity-50 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}