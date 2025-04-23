'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  services: {
    serviceId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookingDate: string;
  scheduledDate: string;
  paymentId: {
    _id: string;
    status: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
  };
  agentId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    rating: number;
  };
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  completedAt?: string;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  rating: number;
  totalBookings: number;
  completedBookings: number;
  availability: boolean;
}

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch booking details
        const bookingResponse = await fetch(`/api/admin/booking/${params.id}`, {
          credentials: 'include' // Include cookies in the request
        });
        
        if (bookingResponse.status === 401) {
          router.push('/login');
          return;
        }

        const bookingData = await bookingResponse.json();

        if (!bookingData.success) {
          throw new Error(bookingData.error || 'Failed to fetch booking details');
        }

        setBooking(bookingData.data);

        // If booking is pending, fetch available agents
        if (bookingData.data.status === 'pending') {
          const agentsResponse = await fetch('/api/admin/available-agents', {
            credentials: 'include' // Include cookies in the request
          });
          
          if (agentsResponse.status === 401) {
            router.push('/login');
            return;
          }

          const agentsData = await agentsResponse.json();

          if (!agentsData.success) {
            throw new Error(agentsData.error || 'Failed to fetch available agents');
          }

          setAvailableAgents(agentsData.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleConfirmBooking = async () => {
    if (!selectedAgent) {
      setError('Please select an agent');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/confirm-booking/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ agentId: selectedAgent }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to confirm booking');
      }

      // Refresh the page to show updated booking status
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/booking/${params.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      // Refresh the page to show updated booking status
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBooking = async () => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/booking/${params.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete booking');
      }

      // Refresh the page to show updated booking status
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete booking');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">{error || 'Booking not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Booking Status */}
        <div className="mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {booking.userId.name}</p>
              <p><span className="font-medium">Email:</span> {booking.userId.email}</p>
              <p><span className="font-medium">Phone:</span> {booking.userId.phone}</p>
            </div>
          </div>

          {/* Booking Information */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Booking Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Booking ID:</span> {booking._id}</p>
              <p><span className="font-medium">Booking Date:</span> {format(new Date(booking.bookingDate), 'MMM d, yyyy')}</p>
              <p><span className="font-medium">Scheduled Date:</span> {format(new Date(booking.scheduledDate), 'MMM d, yyyy')}</p>
              <p><span className="font-medium">Total Amount:</span> ₹{booking.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Services</h2>
          <div className="space-y-2">
            {booking.services.map((service, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {service.quantity}</p>
                </div>
                <p className="font-medium">₹{service.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Payment Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Status:</span> {booking.paymentId.status}</p>
            <p><span className="font-medium">Method:</span> {booking.paymentId.paymentMethod}</p>
            <p><span className="font-medium">Transaction ID:</span> {booking.paymentId.transactionId || 'N/A'}</p>
          </div>
        </div>

        {/* Assigned Agent */}
        {booking.agentId && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Assigned Agent</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {booking.agentId.name}</p>
              <p><span className="font-medium">Email:</span> {booking.agentId.email}</p>
              <p><span className="font-medium">Phone:</span> {booking.agentId.phone}</p>
              <p><span className="font-medium">Rating:</span> {booking.agentId.rating.toFixed(1)}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Notes</h2>
            <p className="text-gray-600">{booking.notes}</p>
          </div>
        )}

        {/* Cancellation Reason */}
        {booking.cancellationReason && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Cancellation Reason</h2>
            <p className="text-gray-600">{booking.cancellationReason}</p>
            <p className="text-sm text-gray-500 mt-1">
              Cancelled on: {format(new Date(booking.cancelledAt!), 'MMM d, yyyy')}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-4">
          {booking.status === 'pending' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Agent
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select an agent</option>
                  {availableAgents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} - {agent.services.join(', ')} (Rating: {agent.rating.toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleConfirmBooking}
                disabled={!selectedAgent || actionLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          )}

          {booking.status === 'confirmed' && (
            <div className="space-y-4">
              <button
                onClick={handleCompleteBooking}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Completing...' : 'Mark as Completed'}
              </button>
            </div>
          )}

          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <button
              onClick={handleCancelBooking}
              disabled={actionLoading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 