export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profileImage?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  role: 'user' | 'provider' | 'admin';
  createdAt: string;
  updatedAt: string;
} 