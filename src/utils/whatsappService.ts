import axios from 'axios';

interface WhatsAppMessage {
  to: string;
  message: string;
}

const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add country code (91) if not present
  if (digits.length === 10) {
    return `91${digits}`;
  }
  
  // If number already has country code
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  
  throw new Error('Invalid phone number format');
};

const isValidPhoneNumber = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
};

export const sendWhatsAppMessage = async ({ to, message }: WhatsAppMessage) => {
  try {
    if (!isValidPhoneNumber(to)) {
      throw new Error('Invalid phone number format');
    }

    const formattedPhone = formatPhoneNumber(to);
    console.log('Sending WhatsApp to:', formattedPhone); // Debug log
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not configured. Please check your environment variables.');
    }

    const response = await axios.post(`${apiUrl}/whatsapp/send`, {
      to: formattedPhone,
      message
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to send WhatsApp message');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.status === 404) {
      throw new Error('WhatsApp service is not available. Please try again later.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error(error.message || 'Failed to send WhatsApp message');
    }
  }
};

export const formatBookingMessage = (booking: any) => {
  return `
Dear ${booking.customerName},

Your booking has been updated:
Service: ${booking.serviceName}
Amount: ₹${booking.amount}
Status: ${booking.status}
Date: ${new Date(booking.date).toLocaleDateString()}

Thank you for choosing our services!
  `.trim();
}; 