
import React, { useState, useMemo, useEffect } from 'react';
import { ExpenseType, Expense, Location, FuelType, MaintenanceItem, PaymentMethod, Vehicle } from '../types';
import { Plus, X, Trash2, CreditCard, Wallet, Zap, FileText, Save, Car, ChevronDown } from 'lucide-react';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'> | Expense) => void;
  onClose: () => void;
  lastOdometer: number;
  locations: Location[];
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  initialData?: Expense | null;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  onAdd, 
  onClose, 
  lastOdometer, 
  locations, 
  vehicles,
  activeVehicleId,
  initialData 
}) => {
  const [type, setType] = useState<ExpenseType>(initialData?.type || ExpenseType.FUEL);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [locationId, setLocationId] = useState<string>(initialData?.locationId || '');
  const [vehicleId, setVehicleId] = useState<string>(initialData?.vehicleId || activeVehicleId || (vehicles.length > 0 ? vehicles[0].id : ''));
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [status, setStatus] = useState<'RECEIVED' | 'PENDING'>(initialData?.status || 'RECEIVED');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || 'PIX');
  const [odometer, setOdometer] = useState<string>(initialData?.odometer.toString() || lastOdometer.toString());
  const [fuelType, setFuelType] = useState<FuelType>(initialData?.fuelType || 'Gasolina');
  const [fuelValue, setFuelValue] = useState<string>(initialData?.type === ExpenseType.FUEL ? initialData.value.toString() : '');
  const [liters, setLiters] = useState<string>(initialData?.liters?.toString() || '');
  const [maintItems, setMaintItems] = useState<MaintenanceItem[]>(
    initialData?.maintenanceItems || [{ id: crypto.randomUUID(), description: '', value: 0 }]
  );
  const [odometerStart, setOdometerStart] = useState<string>(initialData?.odometerStart?.toString() || lastOdometer.toString());
  const [ratePerKm, setRatePerKm] = useState<string>(initialData?.ratePerKm?.toString() || '0.00');

  const totalValue = useMemo(() => {
    if (type === ExpenseType.FUEL) return parseFloat(fuelValue) || 0;
    if (type === ExpenseType.MAINTENANCE) return maintItems.reduce((acc, item) => acc + (item.value || 0), 0);
    if (type === ExpenseType.SERVICE_REVENUE) {
      const dist = (parseFloat(odometer) || 0) - (parseFloat(odometerStart) || 0);
      return Math.max(0, dist * (parseFloat(ratePerKm) || 0));
    }
    return 0;
  }, [type, fuelValue, maintItems, odometer, odometerStart, ratePerKm]);

  const addMaintItem = () => {
    setMaintItems([...maintItems, { id: crypto.randomUUID(), description: '', value: 0 }]);
  };

  const updateMaintItem = (id: string, field: 'description' | 'value', val: any) => {
    setMaintItems(maintItems.map(item => 
      item.id === id ? { ...item, [field]: field === 'value' ? parseFloat(val) || 0 : val } : item
    ));
  };

  const removeMaintItem = (id: string) => {
    if (maintItems.length > 1) {
      setMaintItems(maintItems.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId) {
      alert("Por favor, selecione um local ou empresa.");
      return;
    }
    if (!vehicleId) {
      alert("Por favor, selecione um veículo.");
      return;
    }
    
    const basePayload = {
      type, 
      date, 
      odometer: parseFloat(odometer) || 0, 
      value: totalValue, 
      locationId, 
      vehicleId,
      notes: notes.trim(), 
      paymentMethod,
      description: type === ExpenseType.FUEL ? fuelType : (type === ExpenseType.SERVICE_REVENUE ? 'Km Rodado' : 'Manutenção'),
    };

    let payload: any = { ...basePayload };
    if (initialData?.id) payload.id = initialData.id;

    if (type === ExpenseType.FUEL) { 
      payload.fuelType = fuelType; 
      payload.liters = parseFloat(liters) || 0; 
    }
    else if (type === ExpenseType.MAINTENANCE) {
      payload.maintenanceItems = maintItems.filter(i => i.description.trim() !== '');
    }
    else if (type === ExpenseType.SERVICE_REVENUE) { 
      payload.odometerStart = parseFloat(odometerStart) || 0; 
      payload.ratePerKm = parseFloat(ratePerKm) || 0; 
      payload.status = status; 
    }

    onAdd(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
      <div className="bg-white rounded-t-[28px] md:rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${initialData ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {initialData ? <Save size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight">
                {initialData ? 'Editar Registro' : 'Novo Registro'}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase">
                {initialData ? `ID: ${initialData.id.slice(0, 8)}` : 'Preencha os dados abaixo'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-black transition-colors">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto pb-6 scrollbar-hide">
          {/* Veículo (Especialmente importante se houver 2 ou mais) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-black ml-1 tracking-wider">Veículo</label>
            <div className="relative">
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={vehicleId} 
                onChange={e => setVehicleId(e.target.value)} 
                className="w-full p-4 pl-12 bg-white border-2 border-slate-300 rounded-2xl text-sm font-black text-black focus:border-blue-600 outline-none transition-all appearance-none"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} className="font-bold text-black">{v.model} ({v.plate})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Lançamento */}
          <div className={`flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 ${initialData ? 'opacity-60 pointer-events-none' : ''}`}>
            {(['FUEL', 'MAINTENANCE', 'SERVICE_REVENUE'] as ExpenseType[]).map((t) => (
              <button 
                key={t} 
                type="button" 
                onClick={() => setType(t)} 
                className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all ${
                  type === t ? 'bg-white text-black shadow-md border border-slate-200' : 'text-slate-500 hover:text-black'
                }`}
              >
                {t === 'FUEL' ? 'Abastecer' : t === 'MAINTENANCE' ? 'Oficina' : 'Serviço'}
              </button>
            ))}
          </div>

          {/* Data e KM */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-black ml-1 tracking-wider">Data</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl text-sm font-black text-black focus:border-blue-600 outline-none transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-black ml-1 tracking-wider">KM Final</label>
              <input 
                type="number" 
                inputMode="numeric" 
                value={odometer} 
                onChange={e => setOdometer(e.target.value)} 
                className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl text-sm font-black text-black focus:border-blue-600 outline-none transition-all" 
              />
            </div>
          </div>

          {/* Local */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-black ml-1 tracking-wider">Local / Empresa</label>
            <div className="relative">
              <select 
                value={locationId} 
                onChange={e => setLocationId(e.target.value)} 
                className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl text-sm font-black text-black focus:border-blue-600 outline-none transition-all appearance-none pr-12"
              >
                <option value="">Selecione...</option>
                {locations.filter(l => (type === 'FUEL' && l.type === 'POSTO') || (type === 'MAINTENANCE' && l.type === 'OFICINA') || (type === 'SERVICE_REVENUE' && l.type === 'CLIENTE')).map(loc => (
                  <option key={loc.id} value={loc.id} className="font-bold text-black">{loc.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-black ml-1 tracking-wider">Pagamento</label>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
              {(['PIX', 'CREDITO', 'DEBITO', 'DINHEIRO', 'NOTA_PRAZO'] as PaymentMethod[]).map(pm => (
                <button 
                  key={pm} 
                  type="button" 
                  onClick={() => setPaymentMethod(pm)} 
                  className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                    paymentMethod === pm ? 'bg-black border-black text-white shadow-lg scale-105' : 'bg-white border-slate-300 text-black hover:border-slate-400'
                  }`}
                >
                  {pm === 'PIX' ? <Zap size={18} /> : pm === 'DINHEIRO' ? <Wallet size={18} /> : pm === 'NOTA_PRAZO' ? <FileText size={18} /> : <CreditCard size={18} />}
                  <span className="text-[9px] font-black uppercase tracking-tight">
                    {pm === 'NOTA_PRAZO' ? 'A Prazo' : pm}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Abastecimento */}
          {type === 'FUEL' && (
            <div className="space-y-4 p-5 bg-blue-50/50 rounded-[28px] border-2 border-blue-100">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-black ml-1 tracking-wider">Tipo de Combustível</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Gasolina', 'Etanol', 'Diesel', 'GNV'] as FuelType[]).map(ft => (
                    <button 
                      key={ft} 
                      type="button" 
                      onClick={() => setFuelType(ft)} 
                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                        fuelType === ft ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-black ml-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    inputMode="decimal" 
                    step="0.01" 
                    value={fuelValue} 
                    onChange={e => setFuelValue(e.target.value)} 
                    placeholder="0,00"
                    className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl text-lg font-black text-black focus:border-blue-600 outline-none transition-all placeholder:text-slate-300" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-black ml-1">Litros</label>
                  <input 
                    type="number" 
                    inputMode="decimal" 
                    step="0.01" 
                    value={liters} 
                    onChange={e => setLiters(e.target.value)} 
                    placeholder="0.00"
                    className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl text-lg font-black text-black focus:border-blue-600 outline-none transition-all placeholder:text-slate-300" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Oficina */}
          {type === 'MAINTENANCE' && (
            <div className="space-y-4 p-5 bg-orange-50/50 rounded-[28px] border-2 border-orange-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black uppercase text-black ml-1">Itens da Manutenção</label>
                <button 
                  type="button" 
                  onClick={addMaintItem}
                  className="text-[9px] font-black uppercase bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md active:scale-95"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>
              
              <div className="space-y-3">
                {maintItems.map((item) => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        placeholder="Peça ou Serviço" 
                        value={item.description}
                        onChange={(e) => updateMaintItem(item.id, 'description', e.target.value)}
                        className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-black focus:border-orange-600 outline-none transition-all"
                      />
                    </div>
                    <div className="w-24">
                      <input 
                        type="number" 
                        inputMode="decimal"
                        step="0.01"
                        placeholder="Valor"
                        value={item.value || ''}
                        onChange={(e) => updateMaintItem(item.id, 'value', e.target.value)}
                        className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-black focus:border-orange-600 outline-none transition-all"
                      />
                    </div>
                    {maintItems.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeMaintItem(item.id)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Serviço */}
          {type === 'SERVICE_REVENUE' && (
            <div className="space-y-4 p-5 bg-emerald-50/50 rounded-[28px] border-2 border-emerald-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-black ml-1">KM Inicial</label>
                  <input 
                    type="number" 
                    inputMode="numeric" 
                    value={odometerStart} 
                    onChange={e => setOdometerStart(e.target.value)} 
                    className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl text-sm font-black text-black focus:border-emerald-600 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-black ml-1">Taxa/KM (R$)</label>
                  <input 
                    type="number" 
                    inputMode="decimal" 
                    step="0.01" 
                    value={ratePerKm} 
                    onChange={e => setRatePerKm(e.target.value)} 
                    className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl text-sm font-black text-black focus:border-emerald-600 outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setStatus('RECEIVED')} 
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${
                    status === 'RECEIVED' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-300 text-black'
                  }`}
                >
                  Recebido
                </button>
                <button 
                  type="button" 
                  onClick={() => setStatus('PENDING')} 
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${
                    status === 'PENDING' ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white border-slate-300 text-black'
                  }`}
                >
                  Pendente
                </button>
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-black ml-1 tracking-wider">Observações</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              rows={2} 
              placeholder="Notas adicionais..."
              className="w-full p-4 bg-white border-2 border-slate-300 rounded-2xl text-sm font-black text-black focus:border-blue-600 outline-none transition-all resize-none placeholder:text-slate-300" 
            />
          </div>

          {/* Resumo e Botão Final */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between bg-white pb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Valor Total</span>
              <span className="text-3xl font-black text-black">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <button 
              type="submit" 
              className={`px-10 py-5 font-black rounded-2xl shadow-xl active:scale-95 uppercase tracking-widest text-[13px] transition-all flex items-center gap-2 ${
                initialData ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-black hover:bg-slate-900 text-white'
              }`}
            >
              {initialData ? <><Save size={18} /> Atualizar</> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
