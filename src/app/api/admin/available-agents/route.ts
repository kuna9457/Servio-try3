import { NextRequest, NextResponse } from 'next/server';

// Mock agent data
const mockAgents = [
  {
    _id: "ag001",
    name: "John Smith",
    email: "john.smith@servicehub.com",
    phone: "+91 98765 43210",
    services: ["Cleaning", "Plumbing"],
    rating: 4.8,
    totalBookings: 156,
    completedBookings: 150
  },
  {
    _id: "ag002",
    name: "Sarah Johnson",
    email: "sarah.j@servicehub.com",
    phone: "+91 98765 43211",
    services: ["Electrical", "Appliance Repair"],
    rating: 4.9,
    totalBookings: 203,
    completedBookings: 198
  },
  {
    _id: "ag003",
    name: "Raj Patel",
    email: "raj.patel@servicehub.com",
    phone: "+91 98765 43212",
    services: ["Plumbing", "Carpentry"],
    rating: 4.7,
    totalBookings: 128,
    completedBookings: 125
  },
  {
    _id: "ag004",
    name: "Maria Garcia",
    email: "maria.g@servicehub.com",
    phone: "+91 98765 43213",
    services: ["Cleaning", "Pest Control"],
    rating: 4.6,
    totalBookings: 89,
    completedBookings: 85
  },
  {
    _id: "ag005",
    name: "David Chen",
    email: "david.chen@servicehub.com",
    phone: "+91 98765 43214",
    services: ["Electrical", "HVAC"],
    rating: 5.0,
    totalBookings: 167,
    completedBookings: 167
  }
];

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data
    return NextResponse.json({
      success: true,
      data: mockAgents
    });
  } catch (error: any) {
    console.error('Error in available-agents route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 