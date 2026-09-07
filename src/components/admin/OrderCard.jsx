
import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export function OrderCard({ order, onUpdateStatus }) {
  // Ensure items array exists
  const items = Array.isArray(order.items) ? order.items : [];

  // Calculate total from items
  const calculatedTotal = items.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;

    return acc + price * quantity;
  }, 0);

  // Use stored totalAmount if available,
  // otherwise use calculated total
  const displayTotal =
    Number(order.totalAmount) > 0
      ? Number(order.totalAmount)
      : calculatedTotal;

  // Status badge styles
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

  // Status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'new':
        return '⏱️ New';

      case 'received':
        return '📥 Received';

      case 'preparing':
        return '🍳 Preparing';

      case 'completed':
        return '✅ Completed';

      case 'cancelled':
        return '❌ Cancelled';

      default:
        return status || 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 flex flex-col justify-between">
      {/* Order Information */}
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="font-semibold text-stone-900">
              ORDER #
              {order.id
                ? order.id.slice(-4).toUpperCase()
                : '----'}
            </span>

            {order.customerName && (
              <p className="text-sm text-stone-600 mt-0.5">
                👤 {order.customerName}
              </p>
            )}

            {order.tableNumber && (
              <p className="text-xs text-stone-500 mt-0.5">
                Table: {order.tableNumber}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeClass(
              order.status
            )}`}
          >
            {getStatusText(order.status)}
          </span>
        </div>

        {/* Ordered Items */}
        <div className="border-t border-b border-stone-100 py-3 my-3">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Items Ordered:
          </p>

          {items.length === 0 ? (
            <p className="text-sm text-stone-500">
              No items found.
            </p>
          ) : (
            <div className="space-y-1.5">
              {items.map((item, index) => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 1;
                const itemTotal = price * quantity;

                return (
                  <div
                    key={item.id || index}
                    className="flex justify-between text-sm gap-3"
                  >
                    <span className="text-stone-700">
                      {item.name || item.title || 'Item'} ×{' '}
                      {quantity}
                    </span>

                    <span className="text-stone-500 whitespace-nowrap">
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between text-base font-semibold text-stone-900 mt-3 pt-2 border-t border-dashed border-stone-200">
            <span>Total:</span>
            <span>{formatCurrency(displayTotal)}</span>
          </div>
        </div>
      </div>

      {/* Update Order Status */}
      <div className="space-y-2 mt-2">
        <p className="text-xs text-stone-500 font-medium">
          Update Order Status:
        </p>

        <div className="grid grid-cols-3 gap-2">
          {/* Preparing */}
          <button
            onClick={() =>
              onUpdateStatus(order.id, 'preparing')
            }
            disabled={order.status === 'preparing'}
            className="px-2 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
          >
            🍳 Mark Preparing
          </button>

          {/* Completed */}
          <button
            onClick={() =>
              onUpdateStatus(order.id, 'completed')
            }
            disabled={order.status === 'completed'}
            className="px-2 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ✅ Mark Completed
          </button>

          {/* Cancelled */}
          <button
            onClick={() =>
              onUpdateStatus(order.id, 'cancelled')
            }
            disabled={order.status === 'cancelled'}
            className="px-2 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
