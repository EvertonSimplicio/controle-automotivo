
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Expense, CarStats, ExpenseType } from '../types';
import { TrendingUp, Gauge, DollarSign, HandCoins, CalendarDays } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
}

type FilterPeriod = 'all' | '30' | '90' | 'month' | 'year' | 'custom';

export const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const [period, setPeriod] = useState<FilterPeriod>('all');
  const [customStart, setCustomStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let filterDateStart: Date | null = null;
    let filterDateEnd: Date = new Date();

    if (period === 'all') return expenses;
    
    if (period === '30') {
      filterDateStart = new Date();
      filterDateStart.setDate(now.getDate() - 30);
    } else if (period === '90') {
      filterDateStart = new Date();
      filterDateStart.setDate(now.getDate() - 90);
    } else if (period === 'month') {
      filterDateStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      filterDateStart = new Date(now.getFullYear(), 0, 1);
    } else if (period === 'custom') {
      filterDateStart = new Date(customStart);
      filterDateEnd = new Date(customEnd);
      filterDateEnd.setHours(23, 59, 59, 999);
    }
    
    return expenses.filter(e => {
      const expDate = new Date(e.date);
      if (filterDateStart) {
        return expDate >= filterDateStart && expDate <= filterDateEnd;
      }
      return true;
    });
  }, [expenses, period, customStart, customEnd]);

  const stats = useMemo<CarStats>(() => {
    const totalSpent = filteredExpenses.filter(e => e.type !== ExpenseType.SERVICE_REVENUE).reduce((acc, curr) => acc + curr.value, 0);
    const totalServiceRevenue = filteredExpenses.filter(e => e.type === ExpenseType.SERVICE_REVENUE && e.status === 'RECEIVED').reduce((acc, curr) => acc + curr.value, 0);
    const fuelExpenses = filteredExpenses.filter(e => e.type === ExpenseType.FUEL).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let totalDistance = 0, totalLiters = 0;
    if (fuelExpenses.length > 1) {
      totalDistance = fuelExpenses[fuelExpenses.length - 1].odometer - fuelExpenses[0].odometer;
      totalLiters = fuelExpenses.slice(1).reduce((acc, curr) => acc + (curr.liters || 0), 0);
    }
    
    const averageConsumption = totalLiters > 0 ? totalDistance / totalLiters : 0;
    
    return { 
      totalSpent, 
      totalLiters, 
      averageConsumption, 
      totalDistance, 
      lastOdometer: 0, 
      totalServiceRevenue, 
      pendingServiceRevenue: 0 
    };
  }, [filteredExpenses]);

  const chartData = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10).map(e => ({
      name: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      valor: e.type === ExpenseType.SERVICE_REVENUE ? 0 : e.value, 
      ganho: e.type === ExpenseType.SERVICE_REVENUE ? e.value : 0
    }));
  }, [filteredExpenses]);

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Filtros Mobile com scroll horizontal suave */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 w-[100vw] md:w-full md:mx-0 md:px-0">
        {(['month', '30', '90', 'year', 'all', 'custom'] as FilterPeriod[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0 ${
              period === p ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            {p === 'month' ? 'Mês Atual' : p === '30' ? '30 Dias' : p === '90' ? '90 Dias' : p === 'year' ? 'Este Ano' : p === 'custom' ? 'Personalizado' : 'Tudo'}
          </button>
        ))}
      </div>

      {/* Seleção de Período Personalizado */}
      {period === 'custom' && (
        <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={16} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Selecione o Período</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-black uppercase ml-1">Data Inicial</label>
              <input 
                type="date" 
                value={customStart} 
                onChange={e => setCustomStart(e.target.value)} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:border-black outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-black uppercase ml-1">Data Final</label>
              <input 
                type="date" 
                value={customEnd} 
                onChange={e => setCustomEnd(e.target.value)} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:border-black outline-none transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid de Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full">
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center gap-4 shadow-sm w-full">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl shrink-0"><DollarSign size={20} /></div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Gastos</p>
            <h3 className="text-xl font-black text-slate-900 truncate">R$ {stats.totalSpent.toLocaleString('pt-BR')}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center gap-4 shadow-sm w-full">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl shrink-0"><HandCoins size={20} /></div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Ganhos</p>
            <h3 className="text-xl font-black text-emerald-600 truncate">R$ {stats.totalServiceRevenue.toLocaleString('pt-BR')}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center gap-4 shadow-sm w-full">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl shrink-0"><Gauge size={20} /></div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Média</p>
            <h3 className="text-xl font-black text-slate-900 truncate">{stats.averageConsumption.toFixed(1)} <span className="text-xs">km/L</span></h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center gap-4 shadow-sm w-full">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl shrink-0"><TrendingUp size={20} /></div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Km Rodados</p>
            <h3 className="text-xl font-black text-slate-900 truncate">{stats.totalDistance.toLocaleString()} <span className="text-xs">km</span></h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm w-full">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Gráfico de Fluxo</h4>
        <div className="h-48 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{left: -20, right: 0}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0,0,0,0.1)', fontWeight: 800, fontSize: 10 }} />
              <Bar dataKey="valor" name="Gasto" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={10} />
              <Bar dataKey="ganho" name="Ganho" fill="#10b981" radius={[3, 3, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
