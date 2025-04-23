import { NextRequest, NextResponse } from 'next/server';

// Mock bookings data with different statuses
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
      }
    ],
    totalAmount: 2999,
    status: "pending",
    bookingDate: new Date().toISOString(),
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    paymentId: {
      _id: "p001",
      status: "completed",
      amount: 2999,
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
        serviceId: "s002",
        name: "Plumbing Service",
        price: 799,
        quantity: 1
      }
    ],
    totalAmount: 799,
    status: "confirmed",
    bookingDate: new Date().toISOString(),
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    agentId: {
      _id: "ag001",
      name: "John Smith",
      phone: "+91 98765 43210",
      email: "john.smith@servicehub.com"
    },
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
        serviceId: "s003",
        name: "AC Service",
        price: 1499,
        quantity: 2
      }
    ],
    totalAmount: 2998,
    status: "pending",
    bookingDate: new Date().toISOString(),
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    paymentId: {
      _id: "p003",
      status: "completed",
      amount: 2998,
      paymentMethod: "online",
      transactionId: "txn_003"
    }
  },
  {
    _id: "bk004",
    userId: {
      _id: "u004",
      name: "Sarah Johnson",
      email: "sarah.j@gmail.com",
      phone: "+91 96666 55555"
    },
    services: [
      {
        serviceId: "s004",
        name: "Pest Control",
        price: 1999,
        quantity: 1
      }
    ],
    totalAmount: 1999,
    status: "completed",
    bookingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    agentId: {
      _id: "ag002",
      name: "Maria Garcia",
      phone: "+91 98765 43213",
      email: "maria.g@servicehub.com"
    },
    paymentId: {
      _id: "p004",
      status: "completed",
      amount: 1999,
      paymentMethod: "online",
      transactionId: "txn_004"
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For development/testing, return mock data
    if (process.env.NODE_ENV === 'development') {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      // Filter bookings based on status
      let filteredBookings = mockBookings;
      if (status && status !== 'all') {
        filteredBookings = mockBookings.filter(booking => booking.status === status);
      }

      // Filter by search term if provided
      if (search) {
        const searchLower = search.toLowerCase();
        filteredBookings = filteredBookings.filter(booking => 
          booking.userId.name.toLowerCase().includes(searchLower) ||
          booking.userId.email.toLowerCase().includes(searchLower) ||
          booking.userId.phone.includes(search)
        );
      }

      // Filter by date range if provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filteredBookings = filteredBookings.filter(booking => {
          const bookingDate = new Date(booking.bookingDate);
          return bookingDate >= start && bookingDate <= end;
        });
      }

      // Sort by booking date (newest first)
      filteredBookings.sort((a, b) => 
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );

      // Pagination
      const startIndex = (page - 1) * limit;
      const paginatedBookings = filteredBookings.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        success: true,
        data: paginatedBookings,
        pagination: {
          total: filteredBookings.length,
          page,
          limit,
          totalPages: Math.ceil(filteredBookings.length / limit)
        }
      });
    }

    // For production, fetch from backend
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query parameters
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(search && { search }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });

    // Fetch data from backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Authentication failed' },
          { status: 401 }
        );
      }
      throw new Error('Failed to fetch bookings');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 