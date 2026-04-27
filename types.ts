
export enum ExpenseType {
  FUEL = 'FUEL',
  MAINTENANCE = 'MAINTENANCE',
  SERVICE_REVENUE = 'SERVICE_REVENUE',
  OTHER = 'OTHER'
}

export type FuelType = 'Gasolina' | 'Etanol' | 'Diesel' | 'GNV';

export type PaymentMethod = 'DINHEIRO' | 'CREDITO' | 'DEBITO' | 'PIX' | 'NOTA_PRAZO';

export enum UserRole {
  ADMIN = 'ADMIN',
  STANDARD = 'STANDARD',
  SIMPLE = 'SIMPLE'
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  password?: string;
}

export interface MaintenanceItem {
  id: string;
  description: string;
  value: number;
}

export interface Location {
  id: string;
  name: string;
  type: 'POSTO' | 'OFICINA' | 'CLIENTE';
}

export interface Vehicle {
  id: string;
  model: string;
  brand: string;
  plate: string;
  year: string;
  initialOdometer: number;
}

export interface Expense {
  id: string;
  date: string;
  type: ExpenseType;
  odometer: number;
  odometerStart?: number;
  value: number;
  locationId?: string;
  fuelType?: FuelType;
  liters?: number;
  description: string;
  notes?: string;
  maintenanceItems?: MaintenanceItem[];
  ratePerKm?: number;
  status?: 'RECEIVED' | 'PENDING';
  paymentMethod?: PaymentMethod;
  userId?: string; 
  vehicleId?: string; // Vincula a despesa ao veículo
}

export interface CarStats {
  totalSpent: number;
  totalLiters: number;
  averageConsumption: number;
  totalDistance: number;
  lastOdometer: number;
  totalServiceRevenue: number;
  pendingServiceRevenue: number;
}
