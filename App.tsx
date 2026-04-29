
import React, { useState, useEffect, useMemo } from 'react';
import { Expense, ExpenseType, CarStats, Location, PaymentMethod, User, UserRole, Vehicle } from './types';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { Settings } from './components/Settings';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { getInsights } from './services/geminiService';
import { supabaseService } from './services/supabaseService';
import { supabase } from './lib/supabase';
import { Plus, LayoutDashboard, History, Sparkles, Trash2, Pencil, Fuel, Wrench, Gauge, MapPin, Navigation, FileText, Printer, Zap, CreditCard, Wallet, Settings as SettingsIcon, LogOut, Car } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('driveFlow_loggedUser');
      if (!saved || saved === 'null') return null;
      return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao carregar usuário logado:", e);
      return null;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('driveFlow_users');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Administrador', username: 'admin', role: UserRole.ADMIN, password: '123' },
      { id: '2', name: 'Usuário Padrão', username: 'padrao', role: UserRole.STANDARD, password: '123' },
      { id: '3', name: 'Usuário Simples', username: 'simples', role: UserRole.SIMPLE, password: '123' }
    ];
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('driveFlow_vehicles');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(() => {
    return localStorage.getItem('driveFlow_activeVehicleId');
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('driveFlow_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('driveFlow_locations');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Posto Central', type: 'POSTO' },
      { id: '2', name: 'Oficina do Zé', type: 'OFICINA' }
    ];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'settings' | 'reports'>(() => {
     try {
       const savedUserStr = localStorage.getItem('driveFlow_loggedUser');
       if (savedUserStr && savedUserStr !== 'null') {
         const user = JSON.parse(savedUserStr);
         if (user && user.role === UserRole.SIMPLE) return 'reports';
       }
     } catch (e) {
       console.error("Erro ao inicializar aba ativa:", e);
     }
     return 'dashboard';
  });
  
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Sync with Supabase on mount
  useEffect(() => {
    const syncData = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const [vList, eList, lList, uList] = await Promise.all([
          supabaseService.getVehicles(),
          supabaseService.getExpenses(),
          supabaseService.getLocations(),
          supabaseService.getUsers()
        ]);
        
        if (vList.length > 0) setVehicles(vList);
        if (eList.length > 0) setExpenses(eList);
        if (lList.length > 0) setLocations(lList);
        if (uList.length > 0) setUsers(uList);
      } catch (err) {
        console.error("Erro ao sincronizar com Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    syncData();
  }, []);

  useEffect(() => {
    localStorage.setItem('driveFlow_users', JSON.stringify(users));
    localStorage.setItem('driveFlow_loggedUser', JSON.stringify(currentUser));
    localStorage.setItem('driveFlow_expenses', JSON.stringify(expenses));
    localStorage.setItem('driveFlow_locations', JSON.stringify(locations));
    localStorage.setItem('driveFlow_vehicles', JSON.stringify(vehicles));
    if (activeVehicleId) localStorage.setItem('driveFlow_activeVehicleId', activeVehicleId);
  }, [users, currentUser, expenses, locations, vehicles, activeVehicleId]);

  const activeVehicle = useMemo(() => {
    return vehicles.find(v => v.id === activeVehicleId) || vehicles[0] || null;
  }, [vehicles, activeVehicleId]);

  useEffect(() => {
    if (!activeVehicleId && vehicles.length > 0) {
      setActiveVehicleId(vehicles[0].id);
    }
  }, [vehicles, activeVehicleId]);

  const filteredExpensesByVehicle = useMemo(() => {
    if (!activeVehicle) return [];
    return expenses.filter(e => e.vehicleId === activeVehicle.id);
  }, [expenses, activeVehicle]);

  const lastOdometer = useMemo(() => {
    if (filteredExpensesByVehicle.length > 0) {
      return Math.max(...filteredExpensesByVehicle.map(e => e.odometer));
    }
    return activeVehicle?.initialOdometer || 0;
  }, [filteredExpensesByVehicle, activeVehicle]);

  const lastFuelPrice = useMemo(() => {
    const fuels = filteredExpensesByVehicle.filter(e => e.type === ExpenseType.FUEL).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (fuels.length > 0 && fuels[0].liters && fuels[0].liters > 0) {
      return fuels[0].value / fuels[0].liters;
    }
    return 0;
  }, [filteredExpensesByVehicle]);

  const handleLogin = async (user: User) => {
    setUsers(prev => {
      if (!prev.find(u => u.username.toLowerCase() === user.username.toLowerCase())) {
        return [...prev, user];
      }
      return prev;
    });

    if (supabase) {
      try {
        await supabaseService.saveUser(user);
      } catch (e) {
        console.error("Erro ao salvar usuário no Supabase:", e);
      }
    }

    setCurrentUser(user);
    if (user.role === UserRole.SIMPLE) setActiveTab('reports');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleSaveExpense = async (data: Omit<Expense, 'id'> | Expense) => {
    if (currentUser?.role !== UserRole.ADMIN) {
      alert("Acesso Negado: Apenas administradores podem realizar lançamentos.");
      return;
    }
    
    if (!activeVehicle && !data.vehicleId) {
      alert("Por favor, cadastre um veículo primeiro.");
      setActiveTab('settings');
      return;
    }

    const payload = {
      ...data,
      userId: currentUser?.id,
      vehicleId: data.vehicleId || activeVehicle?.id
    };

    try {
      if (supabase) {
        const savedExpense = await supabaseService.saveExpense(payload as any);
        setExpenses(prev => {
          const filtered = prev.filter(e => e.id !== savedExpense.id);
          return [savedExpense, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
      } else {
        if ('id' in data) {
          setExpenses(prev => 
            prev.map(e => e.id === data.id ? (data as Expense) : e)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          );
        } else {
          const expense: Expense = {
            ...payload,
            id: crypto.randomUUID(),
          } as Expense;
          setExpenses(prev => [...prev, expense].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      }
    } catch (e) {
      console.error("Erro ao salvar despesa:", e);
      alert("Erro ao salvar dados.");
    } finally {
      setIsFormOpen(false);
      setEditingExpense(null);
    }
  };

  const handleAddVehicle = async (v: Omit<Vehicle, 'id'>) => {
    try {
      if (supabase) {
        const newVehicle = await supabaseService.saveVehicle(v);
        setVehicles([...vehicles, newVehicle]);
        if (vehicles.length === 0) setActiveVehicleId(newVehicle.id);
      } else {
        const newVehicle = { ...v, id: crypto.randomUUID() };
        setVehicles([...vehicles, newVehicle]);
        if (vehicles.length === 0) setActiveVehicleId(newVehicle.id);
      }
    } catch (e) {
      console.error("Erro ao adicionar veículo:", e);
    }
  };

  const handleRemoveVehicle = async (id: string) => {
    if (window.confirm("Isso excluirá o veículo. As despesas vinculadas não serão removidas, mas podem ficar órfãs. Continuar?")) {
      try {
        if (supabase) await supabaseService.deleteVehicle(id);
        setVehicles(vehicles.filter(v => v.id !== id));
        if (activeVehicleId === id) setActiveVehicleId(vehicles[0]?.id || null);
      } catch (e) {
        console.error("Erro ao remover veículo:", e);
      }
    }
  };

  const handleAddLocation = async (loc: Omit<Location, 'id'>) => {
    try {
      if (supabase) {
        const newLoc = await supabaseService.saveLocation(loc);
        setLocations([...locations, newLoc]);
      } else {
        setLocations([...locations, { ...loc, id: crypto.randomUUID() }]);
      }
    } catch (e) {
      console.error("Erro ao adicionar localização:", e);
    }
  };

  const handleRemoveLocation = async (id: string) => {
    try {
      if (supabase) await supabaseService.deleteLocation(id);
      setLocations(locations.filter(l => l.id !== id));
    } catch (e) {
      console.error("Erro ao remover localização:", e);
    }
  };

  const handleUpdateLocation = async (updatedLocation: Location) => {
    try {
      if (supabase) {
        await supabaseService.saveLocation(updatedLocation);
      }
      setLocations(locations.map(l => l.id === updatedLocation.id ? updatedLocation : l));
    } catch (e) {
      console.error("Erro ao atualizar localização:", e);
    }
  };

  const handleAddUser = async (user: Omit<User, 'id'>) => {
    try {
      if (supabase) {
        const newUser = await supabaseService.saveUser(user as any);
        setUsers([...users, newUser]);
      } else {
        setUsers([...users, { ...user, id: crypto.randomUUID() }]);
      }
    } catch (e) {
      console.error("Erro ao adicionar usuário:", e);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      if (supabase) await supabaseService.saveUser(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }
    } catch (e) {
      console.error("Erro ao atualizar usuário:", e);
    }
  };

  const handleRemoveUser = async (id: string) => {
    try {
      if (supabase) await supabaseService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      console.error("Erro ao remover usuário:", e);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (currentUser?.role !== UserRole.ADMIN) return;
    if (window.confirm('Tem certeza que deseja excluir este registro permanentemente?')) {
      try {
        if (supabase) await supabaseService.deleteExpense(id);
        setExpenses(prev => prev.filter(e => e.id !== id));
      } catch (e) {
        console.error("Erro ao deletar despesa:", e);
      }
    }
  };

  const handleEditExpense = (expense: Expense) => {
    if (currentUser?.role !== UserRole.ADMIN) {
      alert("Acesso Negado: Apenas administradores podem editar registros.");
      return;
    }
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const fetchAIInsights = async () => {
    if (filteredExpensesByVehicle.length < 2) return;
    setLoadingInsights(true);
    const data = await getInsights(filteredExpensesByVehicle);
    setInsights(data);
    setLoadingInsights(false);
  };

  const NavItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all rounded-xl ${
        activeTab === id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon size={20} className={activeTab === id ? 'scale-110' : ''} />
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );

  if (!currentUser) {
    return <Login onLogin={handleLogin} availableUsers={users} />;
  }

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isStandard = currentUser.role === UserRole.STANDARD;
  const isSimple = currentUser.role === UserRole.SIMPLE;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] w-full overflow-x-hidden">
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-center z-[90] no-print safe-pb shadow-[0_-8px_30px_rgb(0,0,0,0.08)] h-16 px-4 max-w-lg mx-auto md:rounded-t-[32px] gap-2">
        {(isAdmin || isStandard) && <NavItem id="dashboard" icon={LayoutDashboard} label="Início" />}
        {isAdmin && <NavItem id="history" icon={History} label="Histórico" />}
        {isAdmin && (
          <div className="relative -top-6 px-2">
            <button 
              onClick={() => {
                if (vehicles.length === 0) {
                  alert("Cadastre um veículo primeiro em Ajustes.");
                  setActiveTab('settings');
                } else {
                  setEditingExpense(null);
                  setIsFormOpen(true);
                }
              }}
              className="w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 hover:bg-blue-700 transition-all border-4 border-[#F8FAFC]"
            >
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>
        )}
        <NavItem id="reports" icon={FileText} label="Relatórios" />
        {isAdmin && <NavItem id="settings" icon={SettingsIcon} label="Ajustes" />}
      </nav>

      <div className="flex-1 transition-all duration-300 pb-24 w-full overflow-x-hidden">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 no-print">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <Car size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs md:text-sm font-black text-black uppercase tracking-tight truncate leading-none mb-1">
                  {currentUser.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {currentUser.role === UserRole.ADMIN ? 'Administrador' : currentUser.role === UserRole.STANDARD ? 'Padrão' : 'Simples'}
                  </span>
                  {activeVehicle && (
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 rounded">
                      {activeVehicle.plate}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {activeVehicle ? (
                <span className="text-[9px] font-black text-black uppercase tracking-widest bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-300">
                  KM: {lastOdometer.toLocaleString()}
                </span>
              ) : (
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2.5 py-1.5 rounded-xl border border-red-200">
                  Sem Veículo
                </span>
              )}
              <button onClick={handleLogout} className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-red-600 border border-slate-300">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 w-full">
          {!activeVehicle && isAdmin && activeTab !== 'settings' && (
            <div className="mb-6 bg-amber-50 border-2 border-dashed border-amber-200 p-8 rounded-[32px] text-center">
              <Car size={40} className="mx-auto mb-4 text-amber-500" />
              <h3 className="text-lg font-black text-amber-900 uppercase">Nenhum Veículo Cadastrado</h3>
              <p className="text-sm font-bold text-amber-700 mt-2 mb-6">Para começar a lançar despesas e ver seu desempenho, cadastre seu primeiro veículo.</p>
              <button 
                onClick={() => setActiveTab('settings')}
                className="bg-amber-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95"
              >
                Cadastrar Veículo Agora
              </button>
            </div>
          )}

          {activeTab === 'dashboard' && !isSimple && (
            <div className="no-print animate-in fade-in duration-500 w-full overflow-x-hidden">
              {filteredExpensesByVehicle.length >= 2 && (isAdmin || isStandard) && (
                <div className="mb-6 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[28px] p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={16} className="text-yellow-300" />
                        <h2 className="font-black text-xs md:text-sm uppercase tracking-tight">Sugestões de Controle</h2>
                      </div>
                      <button onClick={fetchAIInsights} disabled={loadingInsights} className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg border border-white/10">
                        {loadingInsights ? "..." : "Analisar"}
                      </button>
                    </div>
                    {insights.length > 0 ? (
                      <div className="space-y-2">
                        {insights.slice(0, 2).map((tip, idx) => (
                          <div key={idx} className="bg-white/10 backdrop-blur-md p-3 rounded-xl text-[10px] md:text-[11px] font-bold border border-white/5 shadow-sm">{tip}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/70 text-[10px] font-bold">Analisando o comportamento do seu {activeVehicle?.model || 'veículo'}...</p>
                    )}
                  </div>
                </div>
              )}
              <Dashboard expenses={filteredExpensesByVehicle} />
            </div>
          )}

          {activeTab === 'settings' && isAdmin && (
            <div className="animate-in slide-in-from-left-4 duration-300 w-full overflow-x-hidden">
              <Settings 
                locations={locations} onAddLocation={handleAddLocation} onUpdateLocation={handleUpdateLocation} onRemoveLocation={handleRemoveLocation} 
                users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onRemoveUser={handleRemoveUser}
                currentUserRole={currentUser.role}
                vehicles={vehicles} onAddVehicle={handleAddVehicle} onRemoveVehicle={handleRemoveVehicle}
                activeVehicleId={activeVehicleId} onSelectVehicle={setActiveVehicleId}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-in slide-in-from-left-4 duration-300 w-full overflow-x-hidden">
              <Reports expenses={filteredExpensesByVehicle} locations={locations} forcedRole={currentUser.role} />
            </div>
          )}

          {activeTab === 'history' && isAdmin && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300 w-full overflow-x-hidden">
              <div className="flex justify-between items-center mb-4 no-print px-1">
                <h3 className="text-xl font-black text-black tracking-tight">Fluxo de Atividades</h3>
                <button onClick={() => window.print()} className="p-2.5 bg-white border border-slate-300 rounded-xl text-black hover:bg-slate-50 transition-all shadow-sm"><Printer size={18} /></button>
              </div>

              {filteredExpensesByVehicle.length === 0 ? (
                <div className="bg-white p-12 text-center text-slate-400 rounded-[32px] border-2 border-dashed border-slate-200">
                  <History size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-bold">Nenhum lançamento para o veículo {activeVehicle?.plate || ''}.</p>
                </div>
              ) : (
                filteredExpensesByVehicle.map(expense => (
                  <div key={expense.id} className="bg-white rounded-[24px] p-4 md:p-5 shadow-md border border-slate-200 flex items-center gap-4 group active:scale-[0.98] transition-all w-full hover:shadow-lg">
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      expense.type === ExpenseType.FUEL ? 'bg-blue-50 text-blue-700' : 
                      expense.type === ExpenseType.MAINTENANCE ? 'bg-orange-50 text-orange-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {expense.type === ExpenseType.FUEL ? <Fuel size={20} /> : 
                       expense.type === ExpenseType.MAINTENANCE ? <Wrench size={20} /> : 
                       <Navigation size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-600">{new Date(expense.date).toLocaleDateString()}</span>
                        {expense.type === ExpenseType.SERVICE_REVENUE && (
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            expense.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {expense.status === 'RECEIVED' ? 'OK' : 'PENDENTE'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-black text-black text-sm md:text-base tracking-tight truncate">
                          {expense.type === ExpenseType.FUEL ? expense.fuelType : 
                          expense.type === ExpenseType.SERVICE_REVENUE ? 'Serviço Realizado' : 'Manutenção'}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-base md:text-lg font-black ${expense.type === ExpenseType.SERVICE_REVENUE ? 'text-emerald-700' : 'text-black'}`}>
                        {expense.type === ExpenseType.SERVICE_REVENUE ? '+' : ''} R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                         <span className="text-[9px] font-black uppercase text-slate-500 mr-1">{expense.odometer.toLocaleString()} KM</span>
                         {isAdmin && (
                           <>
                            <button onClick={() => handleEditExpense(expense)} className="text-slate-400 hover:text-amber-600 transition-colors p-1.5 bg-slate-50 rounded-lg"><Pencil size={14} /></button>
                            <button onClick={() => handleDeleteExpense(expense.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 bg-slate-50 rounded-lg"><Trash2 size={14} /></button>
                           </>
                         )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {isFormOpen && isAdmin && (
        <ExpenseForm 
          lastOdometer={lastOdometer} 
          locations={locations} 
          vehicles={vehicles}
          activeVehicleId={activeVehicleId}
          onAdd={handleSaveExpense} 
          onClose={() => { setIsFormOpen(false); setEditingExpense(null); }}
          initialData={editingExpense}
          lastFuelPrice={lastFuelPrice}
        />
      )}
    </div>
  );
};

export default App;
