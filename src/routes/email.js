import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

/**
 * @route POST /api/email/send-confirmation
 * @desc Send confirmation emails to customer and company
 * @access Public
 */
router.post('/send-confirmation', async (req, res) => {
  try {
    const { orderDetails, customerDetails } = req.body;

    // Get company details from environment variables
    const companyDetails = {
      name: process.env.COMPANY_NAME || 'Service Hub',
      email: process.env.COMPANY_EMAIL,
      phone: process.env.COMPANY_PHONE || 'Not Available',
      address: process.env.COMPANY_ADDRESS || 'Not Available',
      website: process.env.COMPANY_WEBSITE || 'Not Available',
      supportEmail: process.env.SUPPORT_EMAIL || process.env.COMPANY_EMAIL
    };
    
    // Validate required fields
    if (!customerDetails?.email) {
      return res.status(400).json({
        success: false,
        error: 'Customer email is required'
      });
    }
    
    if (!companyDetails.email) {
      return res.status(400).json({
        success: false,
        error: 'Company email is not configured in environment variables'
      });
    }
    
    if (!orderDetails?.items) {
      return res.status(400).json({
        success: false,
        error: 'Order details with items are required'
      });
    }

    // Debug logging
    console.log('Processing email request:', {
      customer: customerDetails.email,
      company: companyDetails.email,
      orderRef: orderDetails.transactionId,
      itemCount: orderDetails.items.length
    });

    // Add pay later specific content if applicable
    const payLaterContent = orderDetails.paymentMethod === 'pay_later' ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333; margin-top: 0;">Pay Later Details</h2>
        <p>Your payment is due by: ${new Date(orderDetails.dueDate).toLocaleDateString()}</p>
        <p>Amount to be paid: ₹${orderDetails.total.toFixed(2)}</p>
        ${orderDetails.qrCode ? `
          <p>You can pay using the QR code below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <img src="${orderDetails.qrCode}" alt="Payment QR Code" style="max-width: 200px; height: auto;"/>
          </div>
        ` : ''}
        ${orderDetails.upiLink ? `
          <p>Or use this UPI link: <a href="${orderDetails.upiLink}">${orderDetails.upiLink}</a></p>
        ` : ''}
      </div>
    ` : '';

    // Email to customer
    const customerMailOptions = {
      from: `"${companyDetails.name}" <${process.env.EMAIL_USER}>`,
      to: customerDetails.email,
      subject: `Order Confirmation - ${companyDetails.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #4f46e5;">
            <h1 style="color: #333; margin: 0;">${companyDetails.name}</h1>
          </div>

          <div style="padding: 20px;">
            <h2 style="color: #333;">Thank you for your order!</h2>
            <p>Dear ${customerDetails.fullName},</p>
            <p>Your order has been successfully placed. Here are the details:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Service</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
                    <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderDetails.items.map(item => `
                    <tr>
                      <td style="padding: 10px; border: 1px solid #ddd;">${item.service.category}</td>
                      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${(item.service.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  <tr style="background-color: #f8f9fa;">
                    <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>Subtotal:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${orderDetails.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr style="background-color: #f8f9fa;">
                    <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>Tax (10%):</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${orderDetails.tax.toFixed(2)}</td>
                  </tr>
                  <tr style="background-color: #f8f9fa;">
                    <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>Total:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>₹${orderDetails.total.toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${payLaterContent}

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Delivery Details</h3>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${customerDetails.address}</p>
              <p style="margin: 5px 0;"><strong>City:</strong> ${customerDetails.city}</p>
              <p style="margin: 5px 0;"><strong>State:</strong> ${customerDetails.state}</p>
              <p style="margin: 5px 0;"><strong>ZIP Code:</strong> ${customerDetails.zipCode}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerDetails.phone}</p>
            </div>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Company Details</h3>
              <p style="margin: 5px 0;">${companyDetails.name}</p>
              <p style="margin: 5px 0;">${companyDetails.phone}</p>
              <p style="margin: 5px 0;">${companyDetails.address}</p>
              <p style="margin: 5px 0;">Website: ${companyDetails.website}</p>
              <p style="margin: 5px 0;">Support: ${companyDetails.supportEmail}</p>
            </div>

            <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 5px;">
              <h3 style="color: #333; margin-top: 0;">Next Steps</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Our team will contact you shortly to confirm the service schedule.</li>
                <li>An agent will be assigned to your order and their details will be shared with you.</li>
                ${orderDetails.paymentMethod === 'pay_later' 
                  ? '<li>Payment will be collected after the service is completed to your satisfaction.</li>' 
                  : '<li>Your payment will be verified and confirmed shortly.</li>'}
              </ul>
            </div>

            <p style="margin-top: 20px;">Thank you for choosing our services!</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>If you have any questions, please contact our support team at ${companyDetails.supportEmail}</p>
              <p>Order Reference: ${orderDetails.transactionId}</p>
            </div>
          </div>
        </div>
      `
    };

    // Email to company
    const companyMailOptions = {
      from: process.env.EMAIL_USER,
      to: companyDetails.email,
      subject: `New Order Received - ${orderDetails.transactionId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Order Notification</h1>
          <p>A new order has been placed. Here are the details:</p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${customerDetails.fullName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${customerDetails.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerDetails.phone}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${customerDetails.address}</p>
            <p style="margin: 5px 0;"><strong>City:</strong> ${customerDetails.city}</p>
            <p style="margin: 5px 0;"><strong>State:</strong> ${customerDetails.state}</p>
            <p style="margin: 5px 0;"><strong>ZIP Code:</strong> ${customerDetails.zipCode}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Service</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderDetails.items.map(item => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.service.category}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${(item.service.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr style="background-color: #f8f9fa;">
                  <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>Subtotal:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${orderDetails.subtotal.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>Tax (10%):</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${orderDetails.tax.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>Total:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>₹${orderDetails.total.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          ${payLaterContent}

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Order Reference: ${orderDetails.transactionId}</p>
            <p>Payment Method: ${orderDetails.paymentMethod === 'pay_later' ? 'Pay Later' : 'QR Code Payment'}</p>
          </div>
        </div>
      `
    };

    // Send emails
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(companyMailOptions);

    res.status(200).json({ 
      success: true,
      message: 'Emails sent successfully' 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send emails',
      details: error.message 
    });
  }
});

export default router; 