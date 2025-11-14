import { apiClient } from './api/client';
import { buildQueryString } from './utils/query-builder';
import {
  City,
  Hotel,
  VehicleCompany,
  VehicleType,
  VehicleRental,
  TransferRoute,
  Guide,
  Restaurant,
  EntranceFee,
  ExtraExpense,
  TourCompany,
  CreateHotelDto,
  UpdateHotelDto,
  CreateVehicleCompanyDto,
  UpdateVehicleCompanyDto,
  CreateVehicleTypeDto,
  UpdateVehicleTypeDto,
  CreateVehicleRentalDto,
  UpdateVehicleRentalDto,
  CreateTransferRouteDto,
  UpdateTransferRouteDto,
  CreateGuideDto,
  UpdateGuideDto,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  CreateEntranceFeeDto,
  UpdateEntranceFeeDto,
  CreateExtraExpenseDto,
  UpdateExtraExpenseDto,
  CreateTourCompanyDto,
  UpdateTourCompanyDto,
  PaginatedResponse,
  QueryParams,
} from '@/types/services';
import {
  Operator,
  B2BClient,
  B2CClient,
  CreateOperatorDto,
  UpdateOperatorDto,
  CreateB2BClientDto,
  UpdateB2BClientDto,
  CreateB2CClientDto,
  UpdateB2CClientDto,
} from '@/types/clients';
import {
  BankAccount,
  ClientPayment,
  SupplierPayment,
  Refund,
  Commission,
  CreateBankAccountDto,
  UpdateBankAccountDto,
  CreateClientPaymentDto,
  UpdateClientPaymentDto,
  CreateSupplierPaymentDto,
  UpdateSupplierPaymentDto,
  CreateRefundDto,
  UpdateRefundDto,
  CreateCommissionDto,
  UpdateCommissionDto,
  PaginatedResponse as PaymentPaginatedResponse,
  QueryParams as PaymentQueryParams,
} from '@/types/payments';
import {
  Quotation,
  QuotationService,
  CreateQuotationDto,
  UpdateQuotationDto,
  CreateQuotationServiceDto,
  UpdateQuotationServiceDto,
} from '@/types/quotations';

// Export the base API client
export const api = apiClient;

// Cities
export const citiesApi = {
  getAll: () => api.get<{ data: City[] }>('/cities'),
};

// Hotels
export const hotelsApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<Hotel>>(`/hotels${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: Hotel }>(`/hotels/${id}`),
  create: (data: CreateHotelDto) => api.post<{ data: Hotel }>('/hotels', data),
  update: (id: number, data: UpdateHotelDto) => api.put<{ data: Hotel }>(`/hotels/${id}`, data),
  delete: (id: number) => api.delete(`/hotels/${id}`),
  activate: (id: number) => api.patch(`/hotels/${id}/activate`),
};

// Vehicle Companies
export const vehicleCompaniesApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<VehicleCompany>>(
      `/vehicle-companies${buildQueryString(params || {})}`
    ),
  getById: (id: number) => api.get<{ data: VehicleCompany }>(`/vehicle-companies/${id}`),
  create: (data: CreateVehicleCompanyDto) =>
    api.post<{ data: VehicleCompany }>('/vehicle-companies', data),
  update: (id: number, data: UpdateVehicleCompanyDto) =>
    api.put<{ data: VehicleCompany }>(`/vehicle-companies/${id}`, data),
  delete: (id: number) => api.delete(`/vehicle-companies/${id}`),
};

// Vehicle Types
export const vehicleTypesApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<VehicleType>>(`/vehicle-types${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: VehicleType }>(`/vehicle-types/${id}`),
  create: (data: CreateVehicleTypeDto) => api.post<{ data: VehicleType }>('/vehicle-types', data),
  update: (id: number, data: UpdateVehicleTypeDto) =>
    api.put<{ data: VehicleType }>(`/vehicle-types/${id}`, data),
  delete: (id: number) => api.delete(`/vehicle-types/${id}`),
};

// Vehicle Rentals
export const vehicleRentalsApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<VehicleRental>>(`/vehicle-rentals${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: VehicleRental }>(`/vehicle-rentals/${id}`),
  create: (data: CreateVehicleRentalDto) =>
    api.post<{ data: VehicleRental }>('/vehicle-rentals', data),
  update: (id: number, data: UpdateVehicleRentalDto) =>
    api.put<{ data: VehicleRental }>(`/vehicle-rentals/${id}`, data),
  delete: (id: number) => api.delete(`/vehicle-rentals/${id}`),
};

// Transfer Routes (added - exists in database)
export const transferRoutesApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<TransferRoute>>(`/transfer-routes${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: TransferRoute }>(`/transfer-routes/${id}`),
  create: (data: CreateTransferRouteDto) =>
    api.post<{ data: TransferRoute }>('/transfer-routes', data),
  update: (id: number, data: UpdateTransferRouteDto) =>
    api.put<{ data: TransferRoute }>(`/transfer-routes/${id}`, data),
  delete: (id: number) => api.delete(`/transfer-routes/${id}`),
};

// Guides
export const guidesApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<Guide>>(`/guides${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: Guide }>(`/guides/${id}`),
  create: (data: CreateGuideDto) => api.post<{ data: Guide }>('/guides', data),
  update: (id: number, data: UpdateGuideDto) => api.put<{ data: Guide }>(`/guides/${id}`, data),
  delete: (id: number) => api.delete(`/guides/${id}`),
};

// Restaurants
export const restaurantsApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<Restaurant>>(`/restaurants${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: Restaurant }>(`/restaurants/${id}`),
  create: (data: CreateRestaurantDto) => api.post<{ data: Restaurant }>('/restaurants', data),
  update: (id: number, data: UpdateRestaurantDto) =>
    api.put<{ data: Restaurant }>(`/restaurants/${id}`, data),
  delete: (id: number) => api.delete(`/restaurants/${id}`),
};

// Entrance Fees
export const entranceFeesApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<EntranceFee>>(`/entrance-fees${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: EntranceFee }>(`/entrance-fees/${id}`),
  create: (data: CreateEntranceFeeDto) => api.post<{ data: EntranceFee }>('/entrance-fees', data),
  update: (id: number, data: UpdateEntranceFeeDto) =>
    api.put<{ data: EntranceFee }>(`/entrance-fees/${id}`, data),
  delete: (id: number) => api.delete(`/entrance-fees/${id}`),
};

// Extra Expenses
export const extrasApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<ExtraExpense>>(`/extra-expenses${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: ExtraExpense }>(`/extra-expenses/${id}`),
  create: (data: CreateExtraExpenseDto) =>
    api.post<{ data: ExtraExpense }>('/extra-expenses', data),
  update: (id: number, data: UpdateExtraExpenseDto) =>
    api.put<{ data: ExtraExpense }>(`/extra-expenses/${id}`, data),
  delete: (id: number) => api.delete(`/extra-expenses/${id}`),
};

// Tour Companies (added - exists in database)
export const tourCompaniesApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<TourCompany>>(`/tour-companies${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: TourCompany }>(`/tour-companies/${id}`),
  create: (data: CreateTourCompanyDto) => api.post<{ data: TourCompany }>('/tour-companies', data),
  update: (id: number, data: UpdateTourCompanyDto) =>
    api.put<{ data: TourCompany }>(`/tour-companies/${id}`, data),
  delete: (id: number) => api.delete(`/tour-companies/${id}`),
};

// Operators
export const operatorsApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<Operator>>(`/operators${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: Operator }>(`/operators/${id}`),
  create: (data: CreateOperatorDto) => api.post<{ data: Operator }>('/operators', data),
  update: (id: number, data: UpdateOperatorDto) =>
    api.put<{ data: Operator }>(`/operators/${id}`, data),
  delete: (id: number) => api.delete(`/operators/${id}`),
};

// B2B Clients
export const b2bClientsApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<B2BClient>>(`/operators-clients${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: B2BClient }>(`/operators-clients/${id}`),
  create: (data: CreateB2BClientDto) => api.post<{ data: B2BClient }>('/operators-clients', data),
  update: (id: number, data: UpdateB2BClientDto) =>
    api.put<{ data: B2BClient }>(`/operators-clients/${id}`, data),
  delete: (id: number) => api.delete(`/operators-clients/${id}`),
};

// B2C Clients
export const b2cClientsApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<B2CClient>>(`/clients${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: B2CClient }>(`/clients/${id}`),
  create: (data: CreateB2CClientDto) => api.post<{ data: B2CClient }>('/clients', data),
  update: (id: number, data: UpdateB2CClientDto) =>
    api.put<{ data: B2CClient }>(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
};

// Bank Accounts
export const bankAccountsApi = {
  getAll: (params?: PaymentQueryParams) =>
    api.get<PaymentPaginatedResponse<BankAccount>>(
      `/bank-accounts${buildQueryString(params || {})}`
    ),
  getById: (id: number) => api.get<{ data: BankAccount }>(`/bank-accounts/${id}`),
  create: (data: CreateBankAccountDto) => api.post<{ data: BankAccount }>('/bank-accounts', data),
  update: (id: number, data: UpdateBankAccountDto) =>
    api.put<{ data: BankAccount }>(`/bank-accounts/${id}`, data),
  delete: (id: number) => api.delete(`/bank-accounts/${id}`),
};

// Client Payments (Receivables)
export const clientPaymentsApi = {
  getAll: (params?: PaymentQueryParams) =>
    api.get<PaymentPaginatedResponse<ClientPayment>>(
      `/client-payments${buildQueryString(params || {})}`
    ),
  getById: (id: number) => api.get<{ data: ClientPayment }>(`/client-payments/${id}`),
  create: (data: CreateClientPaymentDto) =>
    api.post<{ data: ClientPayment }>('/client-payments', data),
  update: (id: number, data: UpdateClientPaymentDto) =>
    api.put<{ data: ClientPayment }>(`/client-payments/${id}`, data),
  delete: (id: number) => api.delete(`/client-payments/${id}`),
};

// Supplier Payments (Payables)
export const supplierPaymentsApi = {
  getAll: (params?: PaymentQueryParams) =>
    api.get<PaymentPaginatedResponse<SupplierPayment>>(
      `/supplier-payments${buildQueryString(params || {})}`
    ),
  getById: (id: number) => api.get<{ data: SupplierPayment }>(`/supplier-payments/${id}`),
  create: (data: CreateSupplierPaymentDto) =>
    api.post<{ data: SupplierPayment }>('/supplier-payments', data),
  update: (id: number, data: UpdateSupplierPaymentDto) =>
    api.put<{ data: SupplierPayment }>(`/supplier-payments/${id}`, data),
  delete: (id: number) => api.delete(`/supplier-payments/${id}`),
};

// Refunds
export const refundsApi = {
  getAll: (params?: PaymentQueryParams) =>
    api.get<PaymentPaginatedResponse<Refund>>(`/refunds${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: Refund }>(`/refunds/${id}`),
  create: (data: CreateRefundDto) => api.post<{ data: Refund }>('/refunds', data),
  update: (id: number, data: UpdateRefundDto) => api.put<{ data: Refund }>(`/refunds/${id}`, data),
  delete: (id: number) => api.delete(`/refunds/${id}`),
};

// Commissions
export const commissionsApi = {
  getAll: (params?: PaymentQueryParams) =>
    api.get<PaymentPaginatedResponse<Commission>>(`/commissions${buildQueryString(params || {})}`),
  getById: (id: number) => api.get<{ data: Commission }>(`/commissions/${id}`),
  create: (data: CreateCommissionDto) => api.post<{ data: Commission }>('/commissions', data),
  update: (id: number, data: UpdateCommissionDto) =>
    api.put<{ data: Commission }>(`/commissions/${id}`, data),
  delete: (id: number) => api.delete(`/commissions/${id}`),
};

// Quotations
export const quotationsApi = {
  getAll: () => api.get<Quotation[]>('/quotations'),
  getById: (id: number) => api.get<Quotation>(`/quotations/${id}`),
  create: (data: CreateQuotationDto) => api.post<Quotation>('/quotations', data),
  update: (id: number, data: UpdateQuotationDto) => api.put<Quotation>(`/quotations/${id}`, data),
  delete: (id: number) => api.delete(`/quotations/${id}`),
};

// Quotation Services
export const quotationServicesApi = {
  getAll: (quotationId?: number) =>
    api.get<QuotationService[]>(
      `/quotation-services${quotationId ? `?quotation_id=${quotationId}` : ''}`
    ),
  getById: (id: number) => api.get<QuotationService>(`/quotation-services/${id}`),
  create: (data: CreateQuotationServiceDto) =>
    api.post<QuotationService>('/quotation-services', data),
  update: (id: number, data: UpdateQuotationServiceDto) =>
    api.put<QuotationService>(`/quotation-services/${id}`, data),
  delete: (id: number) => api.delete(`/quotation-services/${id}`),
};
