/**
 * Voucher System - Main Export File
 *
 * This file exports all voucher-related functionality for easy imports.
 */

// Type definitions
export type {
  BaseVoucher,
  HotelVoucher,
  TransferVoucher,
  TourVoucher,
  GuideVoucher,
  RestaurantVoucher,
  Voucher,
  VoucherGenerationOptions,
  VoucherTemplateConfig,
} from './types';

// Generator functions
export {
  generateVoucherPDF,
  downloadVoucherPDF,
  generateMultipleVouchersPDF,
  downloadMultipleVouchers,
  previewVoucherHTML,
  getVoucherAsBase64,
} from './generator';

// Utility functions
export {
  generateVoucherNumber,
  getOperatorInfo,
  formatPassengerNames,
  createHotelVoucher,
  createTransferVoucher,
  createTourVoucher,
  createGuideVoucher,
  createRestaurantVoucher,
  createVoucherFromService,
  createVouchersFromBooking,
  formatCurrency,
  formatVoucherDate,
  formatVoucherTime,
  calculateNights,
  validateVoucherData,
} from './utils';

// Template functions (usually not needed externally, but exported for customization)
export {
  generateHotelVoucherHTML,
  generateTransferVoucherHTML,
  generateTourVoucherHTML,
  generateGuideVoucherHTML,
  generateRestaurantVoucherHTML,
} from './templates';
