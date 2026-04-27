import { supabase } from '../lib/supabase';
import { Expense, Location, User, Vehicle } from '../types';

export const supabaseService = {
  // --- Vehicles ---
  async getVehicles(): Promise<Vehicle[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) throw error;
    return data.map((v: any) => ({
      ...v,
      initialOdometer: v.initial_odometer
    }));
  },

  async saveVehicle(vehicle: Omit<Vehicle, 'id'> | Vehicle): Promise<Vehicle> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const payload = {
      model: vehicle.model,
      brand: vehicle.brand,
      plate: vehicle.plate,
      year: vehicle.year,
      initial_odometer: vehicle.initialOdometer
    };

    if ('id' in vehicle) {
      const { data, error } = await supabase.from('vehicles').update(payload).eq('id', vehicle.id).select().single();
      if (error) throw error;
      return { ...data, initialOdometer: data.initial_odometer };
    } else {
      const { data, error } = await supabase.from('vehicles').insert(payload).select().single();
      if (error) throw error;
      return { ...data, initialOdometer: data.initial_odometer };
    }
  },

  async deleteVehicle(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Expenses ---
  async getExpenses(vehicleId?: string): Promise<Expense[]> {
    if (!supabase) return [];
    let query = supabase.from('expenses').select('*');
    if (vehicleId) query = query.eq('vehicle_id', vehicleId);
    
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;

    return data.map((e: any) => ({
      ...e,
      locationId: e.location_id,
      odometerStart: e.odometer_start,
      maintenanceItems: e.maintenance_items,
      ratePerKm: e.rate_per_km,
      paymentMethod: e.payment_method,
      userId: e.user_id,
      vehicleId: e.vehicle_id,
      fuelType: e.fuel_type
    }));
  },

  async saveExpense(expense: Omit<Expense, 'id'> | Expense): Promise<Expense> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const payload = {
      date: expense.date,
      type: expense.type,
      odometer: expense.odometer,
      odometer_start: expense.odometerStart,
      value: expense.value,
      location_id: expense.locationId,
      fuel_type: expense.fuelType,
      liters: expense.liters,
      description: expense.description,
      notes: expense.notes,
      maintenance_items: expense.maintenanceItems,
      rate_per_km: expense.ratePerKm,
      status: expense.status,
      payment_method: expense.paymentMethod,
      user_id: expense.userId,
      vehicle_id: expense.vehicleId
    };

    if ('id' in expense) {
      const { data, error } = await supabase.from('expenses').update(payload).eq('id', expense.id).select().single();
      if (error) throw error;
      return { ...data, locationId: data.location_id, odometerStart: data.odometer_start, maintenanceItems: data.maintenance_items, vehicleId: data.vehicle_id };
    } else {
      const { data, error } = await supabase.from('expenses').insert(payload).select().single();
      if (error) throw error;
      return { ...data, locationId: data.location_id, odometerStart: data.odometer_start, maintenanceItems: data.maintenance_items, vehicleId: data.vehicle_id };
    }
  },

  async deleteExpense(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Locations ---
  async getLocations(): Promise<Location[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('locations').select('*');
    if (error) throw error;
    return data;
  },

  async saveLocation(location: Omit<Location, 'id'> | Location): Promise<Location> {
    if (!supabase) throw new Error('Supabase client not initialized');
    if ('id' in location) {
      const { data, error } = await supabase.from('locations').update({ name: location.name, type: location.type }).eq('id', location.id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('locations').insert({ name: location.name, type: location.type }).select().single();
      if (error) throw error;
      return data;
    }
  },

  async deleteLocation(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Users ---
  async getUsers(): Promise<User[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('app_users').select('*');
    if (error) throw error;
    return data;
  },

  async saveUser(user: Omit<User, 'id'> | User): Promise<User> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.from('app_users').upsert(user).select().single();
    if (error) throw error;
    return data;
  },

  async deleteUser(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('app_users').delete().eq('id', id);
    if (error) throw error;
  }
};
