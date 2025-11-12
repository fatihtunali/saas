/**
 * Voucher HTML Templates
 *
 * This file contains HTML template generators for all voucher types.
 * Each function generates a styled HTML document ready for PDF conversion.
 */

import {
  HotelVoucher,
  TransferVoucher,
  TourVoucher,
  GuideVoucher,
  RestaurantVoucher,
  VoucherTemplateConfig,
} from './types';

/**
 * Common CSS styles for all vouchers
 */
const getCommonStyles = (config?: VoucherTemplateConfig): string => {
  const primaryColor = config?.primaryColor || '#2563eb';
  const secondaryColor = config?.secondaryColor || '#64748b';
  const fontFamily = config?.fontFamily || 'Arial, sans-serif';

  return `
    body {
      font-family: ${fontFamily};
      padding: 20px;
      margin: 0;
      color: #1e293b;
      line-height: 1.6;
    }
    .voucher-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid ${primaryColor};
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
      color: white;
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 2px;
    }
    .header .voucher-meta {
      font-size: 14px;
      opacity: 0.95;
      margin-top: 15px;
    }
    .header .voucher-meta span {
      display: inline-block;
      margin: 0 15px;
      padding: 5px 15px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
    .content {
      padding: 40px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: ${primaryColor};
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .info-table tr {
      border-bottom: 1px solid #e2e8f0;
    }
    .info-table tr:last-child {
      border-bottom: none;
    }
    .info-table td {
      padding: 12px 8px;
      vertical-align: top;
    }
    .info-table td:first-child {
      font-weight: 600;
      color: ${secondaryColor};
      width: 35%;
    }
    .info-table td:last-child {
      color: #334155;
    }
    .highlight-box {
      background: #f1f5f9;
      border-left: 4px solid ${primaryColor};
      padding: 15px 20px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .guest-list {
      list-style: none;
      padding: 0;
      margin: 10px 0;
    }
    .guest-list li {
      padding: 8px 12px;
      background: #f8fafc;
      margin: 5px 0;
      border-radius: 4px;
      border-left: 3px solid ${primaryColor};
    }
    .footer {
      background: #f8fafc;
      padding: 30px 40px;
      border-top: 2px solid #e2e8f0;
      font-size: 14px;
      color: ${secondaryColor};
    }
    .footer-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    .footer-note {
      font-style: italic;
      color: #64748b;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #cbd5e1;
    }
    .logo {
      max-height: 60px;
      margin-bottom: 15px;
    }
    .important-notice {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .important-notice strong {
      color: #92400e;
      display: block;
      margin-bottom: 5px;
    }
    ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    ul li {
      margin: 5px 0;
      color: #475569;
    }
  `;
};

/**
 * Generate Hotel Voucher HTML
 */
export function generateHotelVoucherHTML(
  data: HotelVoucher,
  config?: VoucherTemplateConfig
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hotel Voucher - ${data.voucherNumber}</title>
      <style>${getCommonStyles(config)}</style>
    </head>
    <body>
      <div class="voucher-container">
        <div class="header">
          ${config?.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" class="logo" />` : ''}
          <h1>HOTEL VOUCHER</h1>
          <div class="voucher-meta">
            <span>Voucher: ${data.voucherNumber}</span>
            <span>Booking: ${data.bookingCode}</span>
            <span>Issued: ${new Date(data.issueDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div class="content">
          <!-- Hotel Information -->
          <div class="section">
            <h3 class="section-title">Hotel Information</h3>
            <table class="info-table">
              <tr>
                <td>Hotel Name:</td>
                <td><strong style="font-size: 16px;">${data.hotelName}</strong></td>
              </tr>
              <tr>
                <td>Address:</td>
                <td>${data.hotelAddress}</td>
              </tr>
              <tr>
                <td>Phone:</td>
                <td>${data.hotelPhone}</td>
              </tr>
              ${
                data.hotelEmail
                  ? `
              <tr>
                <td>Email:</td>
                <td>${data.hotelEmail}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>

          <!-- Reservation Details -->
          <div class="section">
            <h3 class="section-title">Reservation Details</h3>
            <div class="highlight-box">
              <table class="info-table">
                <tr>
                  <td>Guest Name:</td>
                  <td><strong>${data.clientName}</strong></td>
                </tr>
                <tr>
                  <td>Check-In:</td>
                  <td><strong style="color: #059669;">${new Date(data.checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></td>
                </tr>
                <tr>
                  <td>Check-Out:</td>
                  <td><strong style="color: #dc2626;">${new Date(data.checkOut).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></td>
                </tr>
                <tr>
                  <td>Number of Nights:</td>
                  <td><strong>${data.nights}</strong></td>
                </tr>
              </table>
            </div>

            <table class="info-table">
              <tr>
                <td>Room Type:</td>
                <td>${data.roomType}</td>
              </tr>
              <tr>
                <td>Number of Rooms:</td>
                <td>${data.numberOfRooms}</td>
              </tr>
              <tr>
                <td>Meal Plan:</td>
                <td>${data.mealPlan}</td>
              </tr>
              <tr>
                <td>Number of Guests:</td>
                <td>${data.adults} Adult(s)${data.children > 0 ? `, ${data.children} Child(ren)` : ''}</td>
              </tr>
              ${
                data.confirmationNumber
                  ? `
              <tr>
                <td>Confirmation Number:</td>
                <td><strong>${data.confirmationNumber}</strong></td>
              </tr>
              `
                  : ''
              }
              ${
                data.supplierReference
                  ? `
              <tr>
                <td>Supplier Reference:</td>
                <td>${data.supplierReference}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>

          <!-- Guest List -->
          ${
            data.guests.length > 0
              ? `
          <div class="section">
            <h3 class="section-title">Guest List</h3>
            <ul class="guest-list">
              ${data.guests.map(guest => `<li>${guest}</li>`).join('')}
            </ul>
          </div>
          `
              : ''
          }

          <!-- Special Requests -->
          ${
            data.specialRequests
              ? `
          <div class="section">
            <h3 class="section-title">Special Requests</h3>
            <div class="highlight-box">
              ${data.specialRequests}
            </div>
          </div>
          `
              : ''
          }

          <!-- Important Notice -->
          <div class="important-notice">
            <strong>IMPORTANT:</strong>
            Please present this voucher at the hotel reception during check-in.
            Early check-in and late check-out are subject to availability and may incur additional charges.
          </div>
        </div>

        <div class="footer">
          <div class="footer-info">
            <div>
              <strong>${data.operatorName}</strong><br/>
              ${data.operatorContact}
              ${data.operatorEmail ? `<br/>${data.operatorEmail}` : ''}
            </div>
            <div style="text-align: right;">
              <strong>Issue Date</strong><br/>
              ${new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div class="footer-note">
            This is a computer-generated voucher and serves as confirmation of your hotel reservation.
            Please verify all details and contact us immediately if any information is incorrect.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Transfer Voucher HTML
 */
export function generateTransferVoucherHTML(
  data: TransferVoucher,
  config?: VoucherTemplateConfig
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transfer Voucher - ${data.voucherNumber}</title>
      <style>${getCommonStyles(config)}</style>
    </head>
    <body>
      <div class="voucher-container">
        <div class="header">
          ${config?.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" class="logo" />` : ''}
          <h1>TRANSFER VOUCHER</h1>
          <div class="voucher-meta">
            <span>Voucher: ${data.voucherNumber}</span>
            <span>Booking: ${data.bookingCode}</span>
            <span>Service Date: ${new Date(data.serviceDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div class="content">
          <!-- Transfer Details -->
          <div class="section">
            <h3 class="section-title">Transfer Details</h3>
            <div class="highlight-box">
              <table class="info-table">
                <tr>
                  <td>Transfer Type:</td>
                  <td><strong>${data.transferType}</strong></td>
                </tr>
                <tr>
                  <td>Service Date:</td>
                  <td><strong>${new Date(data.serviceDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></td>
                </tr>
                <tr>
                  <td>Pickup Time:</td>
                  <td><strong style="font-size: 18px; color: #059669;">${data.pickupTime}</strong></td>
                </tr>
                <tr>
                  <td>Vehicle Type:</td>
                  <td>${data.vehicleType}</td>
                </tr>
                <tr>
                  <td>Number of Passengers:</td>
                  <td>${data.numberOfPassengers}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Route Information -->
          <div class="section">
            <h3 class="section-title">Route Information</h3>
            <table class="info-table">
              <tr>
                <td>Pickup Location:</td>
                <td><strong style="color: #059669;">📍 ${data.pickupLocation}</strong></td>
              </tr>
              <tr>
                <td>Drop-off Location:</td>
                <td><strong style="color: #dc2626;">📍 ${data.dropoffLocation}</strong></td>
              </tr>
            </table>
          </div>

          <!-- Flight Information -->
          ${
            data.flightNumber
              ? `
          <div class="section">
            <h3 class="section-title">Flight Information</h3>
            <table class="info-table">
              <tr>
                <td>Flight Number:</td>
                <td><strong>${data.flightNumber}</strong></td>
              </tr>
              ${
                data.flightArrivalTime
                  ? `
              <tr>
                <td>Arrival Time:</td>
                <td>${data.flightArrivalTime}</td>
              </tr>
              `
                  : ''
              }
              ${
                data.flightDepartureTime
                  ? `
              <tr>
                <td>Departure Time:</td>
                <td>${data.flightDepartureTime}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>
          `
              : ''
          }

          <!-- Driver Information -->
          ${
            data.driverName
              ? `
          <div class="section">
            <h3 class="section-title">Driver Information</h3>
            <table class="info-table">
              <tr>
                <td>Driver Name:</td>
                <td><strong>${data.driverName}</strong></td>
              </tr>
              ${
                data.driverPhone
                  ? `
              <tr>
                <td>Driver Phone:</td>
                <td><strong>${data.driverPhone}</strong></td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>
          `
              : ''
          }

          <!-- Passenger List -->
          <div class="section">
            <h3 class="section-title">Passenger List</h3>
            <table class="info-table">
              <tr>
                <td>Lead Passenger:</td>
                <td><strong>${data.clientName}</strong></td>
              </tr>
            </table>
            ${
              data.passengers.length > 0
                ? `
            <ul class="guest-list">
              ${data.passengers.map(passenger => `<li>${passenger}</li>`).join('')}
            </ul>
            `
                : ''
            }
          </div>

          <!-- Special Instructions -->
          ${
            data.specialInstructions
              ? `
          <div class="section">
            <h3 class="section-title">Special Instructions</h3>
            <div class="highlight-box">
              ${data.specialInstructions}
            </div>
          </div>
          `
              : ''
          }

          <!-- Emergency Contact -->
          ${
            data.emergencyContact
              ? `
          <div class="section">
            <h3 class="section-title">Emergency Contact</h3>
            <table class="info-table">
              <tr>
                <td>Contact Name:</td>
                <td>${data.emergencyContact}</td>
              </tr>
              ${
                data.emergencyPhone
                  ? `
              <tr>
                <td>Phone:</td>
                <td><strong>${data.emergencyPhone}</strong></td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>
          `
              : ''
          }

          <!-- Important Notice -->
          <div class="important-notice">
            <strong>IMPORTANT:</strong>
            Please be ready at the pickup location at the scheduled time. The driver will wait for a maximum of 15 minutes.
            For airport pickups, the driver will be waiting at the arrival hall with a name sign.
          </div>
        </div>

        <div class="footer">
          <div class="footer-info">
            <div>
              <strong>${data.operatorName}</strong><br/>
              ${data.operatorContact}
              ${data.operatorEmail ? `<br/>${data.operatorEmail}` : ''}
            </div>
            <div style="text-align: right;">
              <strong>Issue Date</strong><br/>
              ${new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div class="footer-note">
            This voucher confirms your transfer service. Please keep it with you during the journey.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Tour Voucher HTML
 */
export function generateTourVoucherHTML(data: TourVoucher, config?: VoucherTemplateConfig): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tour Voucher - ${data.voucherNumber}</title>
      <style>${getCommonStyles(config)}</style>
    </head>
    <body>
      <div class="voucher-container">
        <div class="header">
          ${config?.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" class="logo" />` : ''}
          <h1>TOUR VOUCHER</h1>
          <div class="voucher-meta">
            <span>Voucher: ${data.voucherNumber}</span>
            <span>Booking: ${data.bookingCode}</span>
          </div>
        </div>

        <div class="content">
          <!-- Tour Information -->
          <div class="section">
            <h3 class="section-title">Tour Information</h3>
            <div class="highlight-box">
              <h2 style="margin: 0 0 10px 0; color: #1e40af; font-size: 20px;">${data.tourName}</h2>
              <table class="info-table">
                <tr>
                  <td>Tour Company:</td>
                  <td><strong>${data.tourCompanyName}</strong></td>
                </tr>
                <tr>
                  <td>Date:</td>
                  <td><strong>${new Date(data.serviceDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></td>
                </tr>
                <tr>
                  <td>Time:</td>
                  <td><strong style="font-size: 18px; color: #059669;">${data.serviceTime}</strong></td>
                </tr>
                <tr>
                  <td>Duration:</td>
                  <td>${data.duration}</td>
                </tr>
                <tr>
                  <td>Meeting Point:</td>
                  <td><strong>📍 ${data.meetingPoint}</strong></td>
                </tr>
                <tr>
                  <td>Language:</td>
                  <td>${data.language}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="section">
            <h3 class="section-title">Tour Operator Contact</h3>
            <table class="info-table">
              <tr>
                <td>Phone:</td>
                <td><strong>${data.tourCompanyPhone}</strong></td>
              </tr>
              ${
                data.tourCompanyEmail
                  ? `
              <tr>
                <td>Email:</td>
                <td>${data.tourCompanyEmail}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>

          <!-- Guide Information -->
          ${
            data.guideName
              ? `
          <div class="section">
            <h3 class="section-title">Guide Information</h3>
            <table class="info-table">
              <tr>
                <td>Guide Name:</td>
                <td><strong>${data.guideName}</strong></td>
              </tr>
              ${
                data.guidePhone
                  ? `
              <tr>
                <td>Guide Phone:</td>
                <td><strong>${data.guidePhone}</strong></td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>
          `
              : ''
          }

          <!-- Participants -->
          <div class="section">
            <h3 class="section-title">Participants</h3>
            <table class="info-table">
              <tr>
                <td>Lead Participant:</td>
                <td><strong>${data.clientName}</strong></td>
              </tr>
              <tr>
                <td>Total Participants:</td>
                <td>${data.numberOfParticipants} (${data.adults} Adult(s)${data.children > 0 ? `, ${data.children} Child(ren)` : ''})</td>
              </tr>
            </table>
            ${
              data.participants.length > 0
                ? `
            <ul class="guest-list">
              ${data.participants.map(participant => `<li>${participant}</li>`).join('')}
            </ul>
            `
                : ''
            }
          </div>

          <!-- Inclusions -->
          ${
            data.inclusions && data.inclusions.length > 0
              ? `
          <div class="section">
            <h3 class="section-title">Tour Inclusions</h3>
            <ul>
              ${data.inclusions.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          `
              : ''
          }

          <!-- Exclusions -->
          ${
            data.exclusions && data.exclusions.length > 0
              ? `
          <div class="section">
            <h3 class="section-title">Tour Exclusions</h3>
            <ul>
              ${data.exclusions.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          `
              : ''
          }

          <!-- What to Bring -->
          ${
            data.whatToBring && data.whatToBring.length > 0
              ? `
          <div class="section">
            <h3 class="section-title">What to Bring</h3>
            <ul>
              ${data.whatToBring.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          `
              : ''
          }

          <!-- Special Requests -->
          ${
            data.specialRequests
              ? `
          <div class="section">
            <h3 class="section-title">Special Requests</h3>
            <div class="highlight-box">
              ${data.specialRequests}
            </div>
          </div>
          `
              : ''
          }

          <!-- Cancellation Policy -->
          ${
            data.cancellationPolicy
              ? `
          <div class="section">
            <h3 class="section-title">Cancellation Policy</h3>
            <div class="highlight-box">
              ${data.cancellationPolicy}
            </div>
          </div>
          `
              : ''
          }

          <!-- Important Notice -->
          <div class="important-notice">
            <strong>IMPORTANT:</strong>
            Please arrive at the meeting point at least 15 minutes before the scheduled departure time.
            This voucher must be presented to the tour guide before the tour begins.
          </div>
        </div>

        <div class="footer">
          <div class="footer-info">
            <div>
              <strong>${data.operatorName}</strong><br/>
              ${data.operatorContact}
              ${data.operatorEmail ? `<br/>${data.operatorEmail}` : ''}
            </div>
            <div style="text-align: right;">
              <strong>Issue Date</strong><br/>
              ${new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div class="footer-note">
            This voucher confirms your tour booking. Please keep it with you during the tour.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Guide Voucher HTML
 */
export function generateGuideVoucherHTML(
  data: GuideVoucher,
  config?: VoucherTemplateConfig
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Guide Voucher - ${data.voucherNumber}</title>
      <style>${getCommonStyles(config)}</style>
    </head>
    <body>
      <div class="voucher-container">
        <div class="header">
          ${config?.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" class="logo" />` : ''}
          <h1>GUIDE VOUCHER</h1>
          <div class="voucher-meta">
            <span>Voucher: ${data.voucherNumber}</span>
            <span>Booking: ${data.bookingCode}</span>
          </div>
        </div>

        <div class="content">
          <!-- Service Details -->
          <div class="section">
            <h3 class="section-title">Service Details</h3>
            <div class="highlight-box">
              <table class="info-table">
                <tr>
                  <td>Service Type:</td>
                  <td><strong>${data.serviceType}</strong></td>
                </tr>
                <tr>
                  <td>Date:</td>
                  <td><strong>${new Date(data.serviceDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></td>
                </tr>
                <tr>
                  <td>Start Time:</td>
                  <td><strong style="font-size: 18px; color: #059669;">${data.serviceTime}</strong></td>
                </tr>
                ${
                  data.endTime
                    ? `
                <tr>
                  <td>End Time:</td>
                  <td><strong style="font-size: 18px; color: #dc2626;">${data.endTime}</strong></td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td>Duration:</td>
                  <td>${data.duration}</td>
                </tr>
                <tr>
                  <td>Meeting Point:</td>
                  <td><strong>📍 ${data.meetingPoint}</strong></td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Guide Information -->
          <div class="section">
            <h3 class="section-title">Guide Information</h3>
            <table class="info-table">
              <tr>
                <td>Guide Name:</td>
                <td><strong style="font-size: 16px;">${data.guideName}</strong></td>
              </tr>
              <tr>
                <td>Phone:</td>
                <td><strong>${data.guidePhone}</strong></td>
              </tr>
              ${
                data.guideEmail
                  ? `
              <tr>
                <td>Email:</td>
                <td>${data.guideEmail}</td>
              </tr>
              `
                  : ''
              }
              <tr>
                <td>Languages:</td>
                <td>${data.languages.join(', ')}</td>
              </tr>
            </table>
          </div>

          <!-- Guest Information -->
          <div class="section">
            <h3 class="section-title">Guest Information</h3>
            <table class="info-table">
              <tr>
                <td>Lead Guest:</td>
                <td><strong>${data.clientName}</strong></td>
              </tr>
              <tr>
                <td>Number of Guests:</td>
                <td>${data.numberOfGuests}</td>
              </tr>
            </table>
            ${
              data.guests.length > 0
                ? `
            <ul class="guest-list">
              ${data.guests.map(guest => `<li>${guest}</li>`).join('')}
            </ul>
            `
                : ''
            }
          </div>

          <!-- Itinerary -->
          ${
            data.itinerary && data.itinerary.length > 0
              ? `
          <div class="section">
            <h3 class="section-title">Itinerary</h3>
            <ul>
              ${data.itinerary.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          `
              : ''
          }

          <!-- Special Requirements -->
          ${
            data.specialRequirements
              ? `
          <div class="section">
            <h3 class="section-title">Special Requirements</h3>
            <div class="highlight-box">
              ${data.specialRequirements}
            </div>
          </div>
          `
              : ''
          }

          <!-- Important Notice -->
          <div class="important-notice">
            <strong>IMPORTANT:</strong>
            Please meet the guide at the designated meeting point at the scheduled time.
            The guide's contact information is provided above for any last-minute coordination.
          </div>
        </div>

        <div class="footer">
          <div class="footer-info">
            <div>
              <strong>${data.operatorName}</strong><br/>
              ${data.operatorContact}
              ${data.operatorEmail ? `<br/>${data.operatorEmail}` : ''}
            </div>
            <div style="text-align: right;">
              <strong>Issue Date</strong><br/>
              ${new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div class="footer-note">
            This voucher confirms your guide service booking. Please present it to the guide.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate Restaurant Voucher HTML
 */
export function generateRestaurantVoucherHTML(
  data: RestaurantVoucher,
  config?: VoucherTemplateConfig
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restaurant Voucher - ${data.voucherNumber}</title>
      <style>${getCommonStyles(config)}</style>
    </head>
    <body>
      <div class="voucher-container">
        <div class="header">
          ${config?.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" class="logo" />` : ''}
          <h1>RESTAURANT VOUCHER</h1>
          <div class="voucher-meta">
            <span>Voucher: ${data.voucherNumber}</span>
            <span>Booking: ${data.bookingCode}</span>
          </div>
        </div>

        <div class="content">
          <!-- Restaurant Information -->
          <div class="section">
            <h3 class="section-title">Restaurant Information</h3>
            <div class="highlight-box">
              <h2 style="margin: 0 0 10px 0; color: #1e40af; font-size: 20px;">${data.restaurantName}</h2>
              <table class="info-table">
                <tr>
                  <td>Address:</td>
                  <td>${data.restaurantAddress}</td>
                </tr>
                <tr>
                  <td>Phone:</td>
                  <td><strong>${data.restaurantPhone}</strong></td>
                </tr>
                ${
                  data.restaurantEmail
                    ? `
                <tr>
                  <td>Email:</td>
                  <td>${data.restaurantEmail}</td>
                </tr>
                `
                    : ''
                }
              </table>
            </div>
          </div>

          <!-- Reservation Details -->
          <div class="section">
            <h3 class="section-title">Reservation Details</h3>
            <table class="info-table">
              <tr>
                <td>Guest Name:</td>
                <td><strong style="font-size: 16px;">${data.clientName}</strong></td>
              </tr>
              <tr>
                <td>Date:</td>
                <td><strong>${new Date(data.reservationDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></td>
              </tr>
              <tr>
                <td>Time:</td>
                <td><strong style="font-size: 18px; color: #059669;">${data.reservationTime}</strong></td>
              </tr>
              <tr>
                <td>Number of Guests:</td>
                <td><strong>${data.numberOfGuests}</strong></td>
              </tr>
              <tr>
                <td>Meal Type:</td>
                <td>${data.mealType}</td>
              </tr>
              ${
                data.menuType
                  ? `
              <tr>
                <td>Menu Type:</td>
                <td>${data.menuType}</td>
              </tr>
              `
                  : ''
              }
              ${
                data.confirmationNumber
                  ? `
              <tr>
                <td>Confirmation Number:</td>
                <td><strong>${data.confirmationNumber}</strong></td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>

          <!-- Guest List -->
          ${
            data.guests.length > 0
              ? `
          <div class="section">
            <h3 class="section-title">Guest List</h3>
            <ul class="guest-list">
              ${data.guests.map(guest => `<li>${guest}</li>`).join('')}
            </ul>
          </div>
          `
              : ''
          }

          <!-- Dietary Requirements -->
          ${
            data.dietaryRequirements && data.dietaryRequirements.length > 0
              ? `
          <div class="section">
            <h3 class="section-title">Dietary Requirements</h3>
            <ul>
              ${data.dietaryRequirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
          </div>
          `
              : ''
          }

          <!-- Special Requests -->
          ${
            data.specialRequests
              ? `
          <div class="section">
            <h3 class="section-title">Special Requests</h3>
            <div class="highlight-box">
              ${data.specialRequests}
            </div>
          </div>
          `
              : ''
          }

          <!-- Important Notice -->
          <div class="important-notice">
            <strong>IMPORTANT:</strong>
            Please present this voucher to the restaurant staff upon arrival.
            It is recommended to arrive 5-10 minutes before your reservation time.
            If you need to cancel or modify your reservation, please contact us at least 24 hours in advance.
          </div>
        </div>

        <div class="footer">
          <div class="footer-info">
            <div>
              <strong>${data.operatorName}</strong><br/>
              ${data.operatorContact}
              ${data.operatorEmail ? `<br/>${data.operatorEmail}` : ''}
            </div>
            <div style="text-align: right;">
              <strong>Issue Date</strong><br/>
              ${new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div class="footer-note">
            This voucher confirms your restaurant reservation. Please present it upon arrival.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
