import { NextRequest, NextResponse } from 'next/server';

// Mock booking data
const mockBookings = [
  {
    _id: "bk001",
    userId: {
      _id: "u001",
      name: "Alex Thompson",
      email: "alex.t@gmail.com",
      phone: "+91 99999 88888"
    },
    services: [
      {
        serviceId: "s001",
        name: "Deep Cleaning",
        price: 2999,
        quantity: 1
      },
      {
        serviceId: "s002",
        name: "Pest Control",
        price: 1499,
        quantity: 1
      }
    ],
    totalAmount: 4498,
    status: "pending",
    bookingDate: new Date().toISOString(),
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    paymentId: {
      _id: "p001",
      status: "completed",
      amount: 4498,
      paymentMethod: "online",
      transactionId: "txn_001"
    }
  },
  {
    _id: "bk002",
    userId: {
      _id: "u002",
      name: "Priya Sharma",
      email: "priya.s@gmail.com",
      phone: "+91 98888 77777"
    },
    services: [
      {
        serviceId: "s003",
        name: "Plumbing Service",
        price: 799,
        quantity: 1
      }
    ],
    totalAmount: 799,
    status: "pending",
    bookingDate: new Date().toISOString(),
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    paymentId: {
      _id: "p002",
      status: "completed",
      amount: 799,
      paymentMethod: "qr",
      transactionId: "txn_002"
    }
  },
  {
    _id: "bk003",
    userId: {
      _id: "u003",
      name: "Mike Wilson",
      email: "mike.w@gmail.com",
      phone: "+91 97777 66666"
    },
    services: [
      {
        serviceId: "s004",
        name: "Electrical Repair",
        price: 1299,
        quantity: 1
      },
      {
        serviceId: "s005",
        name: "AC Service",
        price: 1999,
        quantity: 2
      }
    ],
    totalAmount: 5297,
    status: "pending",
    bookingDate: new Date().toISOString(),
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    paymentId: {
      _id: "p003",
      status: "completed",
      amount: 5297,
      paymentMethod: "online",
      transactionId: "txn_003"
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data
    return NextResponse.json({
      success: true,
      data: mockBookings
    });
  } catch (error: any) {
    console.error('Error in pending-bookings route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 