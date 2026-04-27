
import React, { useState, useMemo, useEffect } from 'react';
import { Expense, ExpenseType, Location, PaymentMethod, UserRole } from '../types';
import { FileText, Printer, Calendar, Filter, Fuel, Wrench, Navigation, DollarSign, HandCoins, CheckCircle2, Clock, Zap, CreditCard, Wallet } from 'lucide-react';

interface ReportsProps {
  expenses: Expense[];
  locations: Location[];
  forcedRole?: UserRole;
}

type ReportType = 'ALL' | 'FUEL' | 'MAINTENANCE' | 'SERVICE';
type StatusFilter = 'ALL' | 'RECEIVED' | 'PENDING';
type PaymentFilter = 'ALL' | PaymentMethod;

export const Reports: React.FC<ReportsProps> = ({ expenses, locations, forcedRole }) => {
  const isSimpleUser = forcedRole === UserRole.SIMPLE;
  
  const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<ReportType>(isSimpleUser ? 'SERVICE' : 'ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('ALL');

  useEffect(() => {
    if (isSimpleUser) setReportType('SERVICE');
  }, [isSimpleUser]);

  const filteredData = useMemo(() => {
    return expenses.filter(e => {
      const date = new Date(e.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const matchesDate = date >= start && date <= end;
      
      const currentReportType = isSimpleUser ? 'SERVICE' : reportType;
      
      const matchesType = currentReportType === 'ALL' || 
                         (currentReportType === 'FUEL' && e.type === ExpenseType.FUEL) || 
                         (currentReportType === 'MAINTENANCE' && e.type === ExpenseType.MAINTENANCE) || 
                         (currentReportType === 'SERVICE' && e.type === ExpenseType.SERVICE_REVENUE);
                         
      const matchesStatus = statusFilter === 'ALL' || (e.type === ExpenseType.SERVICE_REVENUE && e.status === statusFilter) || (e.type !== ExpenseType.SERVICE_REVENUE && statusFilter === 'RECEIVED');
      const matchesPayment = paymentFilter === 'ALL' || e.paymentMethod === paymentFilter;
      return matchesDate && matchesType && matchesStatus && matchesPayment;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses, startDate, endDate, reportType, statusFilter, paymentFilter, isSimpleUser]);

  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      if (curr.type === ExpenseType.SERVICE_REVENUE) {
        if (curr.status === 'RECEIVED') acc.earned += curr.value;
        else acc.pending += curr.value;
      } else {
        acc.spent += curr.value;
      }
      return acc;
    }, { spent: 0, earned: 0, pending: 0 });
  }, [filteredData]);

  const getLocationName = (id?: string) => locations.find(l => l.id === id)?.name || 'N/A';
  const getPaymentMethodIcon = (method?: PaymentMethod) => {
    switch (method) {
      case 'PIX': return <Zap size={12} />;
      case 'CREDITO': case 'DEBITO': return <CreditCard size={12} />;
      case 'DINHEIRO': return <Wallet size={12} />;
      case 'NOTA_PRAZO': return <FileText size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm no-print">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Filtrar Relatório</span>
          </div>
          <button onClick={() => window.print()} className="bg-black text-white p-3 rounded-2xl shadow-lg active:scale-95"><Printer size={18} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-black uppercase ml-1">Início</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-black" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-black uppercase ml-1">Fim</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-black" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-black uppercase ml-1">Tipo</label>
            <select 
              disabled={isSimpleUser} 
              value={isSimpleUser ? 'SERVICE' : reportType} 
              onChange={e => setReportType(e.target.value as any)} 
              className={`w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-black appearance-none ${isSimpleUser ? 'opacity-50' : ''}`}
            >
              {!isSimpleUser && <option value="ALL">Todos</option>}
              {!isSimpleUser && <option value="FUEL">Combustível</option>}
              {!isSimpleUser && <option value="MAINTENANCE">Manutenção</option>}
              <option value="SERVICE">Serviços</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-black uppercase ml-1">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-black appearance-none">
              <option value="ALL">Todos</option>
              <option value="RECEIVED">Recebidos</option>
              <option value="PENDING">Pendentes</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-black uppercase ml-1">Pagto.</label>
            <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value as any)} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-black appearance-none">
              <option value="ALL">Todas</option>
              <option value="PIX">PIX</option>
              <option value="CREDITO">Crédito</option>
              <option value="DEBITO">Débito</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="NOTA_PRAZO">Nota a Prazo</option>
            </select>
          </div>
        </div>
        {isSimpleUser && (
          <p className="mt-4 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 p-2 rounded-xl border border-amber-100">
            Acesso Restrito: Visualizando apenas relatórios de serviço.
          </p>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-md overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-50/50 grid grid-cols-2 md:grid-cols-3 gap-4 border-b border-slate-200">
          <div className="col-span-2 md:col-span-1 mb-2 md:mb-0">
            <h3 className="text-xl font-black tracking-tight text-black">Relatório</h3>
            <p className="text-[10px] font-bold text-slate-700 uppercase">{filteredData.length} registros encontrados</p>
          </div>
          {!isSimpleUser && (
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Total Gasto</p>
              <p className="text-lg font-black text-red-600">R$ {totals.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Total Ganho</p>
            <p className="text-lg font-black text-emerald-600">R$ {totals.earned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          {totals.pending > 0 && (
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Total Pendente</p>
              <p className="text-lg font-black text-amber-600">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-6 py-4 text-[9px] font-black text-black uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-[9px] font-black text-black uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-[9px] font-black text-black uppercase tracking-widest">Local</th>
                <th className="px-6 py-4 text-[9px] font-black text-black uppercase tracking-widest text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-[11px] font-black text-slate-700">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-black">
                        {e.type === 'FUEL' ? `Combustível (${e.fuelType || 'N/A'})` : e.type === 'MAINTENANCE' ? 'Oficina' : 'Serviço'}
                      </span>
                      <span className="text-[8px] font-black text-slate-600 uppercase flex items-center gap-1">
                        {getPaymentMethodIcon(e.paymentMethod)} 
                        {e.paymentMethod === 'NOTA_PRAZO' ? 'Nota a Prazo' : e.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-slate-800 truncate max-w-[150px]">{getLocationName(e.locationId)}</td>
                  <td className={`px-6 py-4 text-right text-xs font-black ${e.type === 'SERVICE_REVENUE' ? 'text-emerald-700' : 'text-black'}`}>
                    {e.type === 'SERVICE_REVENUE' ? '+' : ''} R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
