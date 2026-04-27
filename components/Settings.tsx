
import React, { useState } from 'react';
import { Location, User, UserRole, Vehicle } from '../types';
import { Plus, Trash2, Fuel, Wrench, Building2, Users, ShieldCheck, UserCheck, User as UserIcon, Pencil, Save, X, Car, CheckCircle2 } from 'lucide-react';

interface SettingsProps {
  locations: Location[];
  onAddLocation: (location: Omit<Location, 'id'>) => void;
  onRemoveLocation: (id: string) => void;
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onRemoveUser: (id: string) => void;
  currentUserRole: UserRole;
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  onRemoveVehicle: (id: string) => void;
  activeVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  locations, onAddLocation, onRemoveLocation, 
  users, onAddUser, onUpdateUser, onRemoveUser, 
  currentUserRole,
  vehicles, onAddVehicle, onRemoveVehicle,
  activeVehicleId, onSelectVehicle
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'VEHICLES' | 'LOCATIONS' | 'USERS'>('VEHICLES');
  
  const [name, setName] = useState('');
  const [locType, setLocType] = useState<'POSTO' | 'OFICINA' | 'CLIENTE'>('POSTO');
  
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPass, setUserPass] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.STANDARD);
  
  const [vModel, setVModel] = useState('');
  const [vBrand, setVBrand] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vYear, setVYear] = useState('');
  const [vInitialKM, setVInitialKM] = useState<string>('0');

  const [isAdding, setIsAdding] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleSubmitLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddLocation({ name, type: locType });
    setName('');
    setIsAdding(false);
  };

  const handleSubmitVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vModel.trim() || !vPlate.trim()) return;
    onAddVehicle({
      model: vModel,
      brand: vBrand,
      plate: vPlate.toUpperCase(),
      year: vYear,
      initialOdometer: parseInt(vInitialKM) || 0
    });
    setVModel('');
    setVBrand('');
    setVPlate('');
    setVYear('');
    setVInitialKM('0');
    setIsAdding(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setUserName(user.name);
    setUserUsername(user.username);
    setUserPass(user.password || '');
    setUserRole(user.role);
    setIsAdding(true);
  };

  const cancelUserEdit = () => {
    setEditingUserId(null);
    setUserName('');
    setUserUsername('');
    setUserPass('');
    setUserRole(UserRole.STANDARD);
    setIsAdding(false);
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userUsername.trim()) return;
    
    if (editingUserId) {
      onUpdateUser({
        id: editingUserId,
        name: userName,
        username: userUsername,
        password: userPass,
        role: userRole
      });
    } else {
      onAddUser({ name: userName, username: userUsername, password: userPass, role: userRole });
    }
    
    cancelUserEdit();
  };

  const groupedLocations = {
    POSTO: locations.filter(l => l.type === 'POSTO'),
    OFICINA: locations.filter(l => l.type === 'OFICINA'),
    CLIENTE: locations.filter(l => l.type === 'CLIENTE'),
  };

  const SectionHeader = ({ title, icon: Icon, colorClass, count }: { title: string, icon: any, colorClass: string, count: number }) => (
    <div className="flex items-center justify-between mb-4 mt-6 first:mt-0">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-xl ${colorClass}`}>
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-black text-black uppercase tracking-widest">{title}</h3>
      </div>
      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 mb-6 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => { setActiveSubTab('VEHICLES'); cancelUserEdit(); setIsAdding(false); }}
          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSubTab === 'VEHICLES' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black'
          }`}
        >
          <Car size={16} /> Veículos
        </button>
        <button 
          onClick={() => { setActiveSubTab('LOCATIONS'); cancelUserEdit(); setIsAdding(false); }}
          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSubTab === 'LOCATIONS' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black'
          }`}
        >
          <Building2 size={16} /> Locais
        </button>
        {currentUserRole === UserRole.ADMIN && (
          <button 
            onClick={() => { setActiveSubTab('USERS'); cancelUserEdit(); setIsAdding(false); }}
            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeSubTab === 'USERS' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black'
            }`}
          >
            <Users size={16} /> Usuários
          </button>
        )}
      </div>

      {activeSubTab === 'VEHICLES' && (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-black tracking-tight uppercase">Meus Veículos</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gestão de Frota</p>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 ${
                isAdding ? 'bg-red-50 text-red-600' : 'bg-black text-white'
              }`}
            >
              {isAdding ? <Plus className="rotate-45" size={20} /> : <Plus size={20} />}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleSubmitVehicle} className="space-y-4 animate-in fade-in zoom-in duration-200 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-black uppercase ml-1">Modelo / Nome</label>
                  <input type="text" value={vModel} onChange={e => setVModel(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-black outline-none font-bold text-black" placeholder="Ex: Corolla Hybrid" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase ml-1">Marca</label>
                  <input type="text" value={vBrand} onChange={e => setVBrand(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-black outline-none font-bold text-black" placeholder="Ex: Toyota" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase ml-1">Placa</label>
                  <input type="text" value={vPlate} onChange={e => setVPlate(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-black outline-none font-bold text-black" placeholder="ABC1D23" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase ml-1">Ano</label>
                  <input type="text" value={vYear} onChange={e => setVYear(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-black outline-none font-bold text-black" placeholder="2024" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase ml-1">KM Inicial</label>
                  <input type="number" value={vInitialKM} onChange={e => setVInitialKM(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-black outline-none font-bold text-black" placeholder="0" />
                </div>
              </div>
              <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl">Cadastrar Veículo</button>
            </form>
          )}

          <div className="space-y-3">
            {vehicles.length === 0 && !isAdding && (
              <div className="py-12 text-center text-slate-400">
                <Car size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum veículo cadastrado.</p>
              </div>
            )}
            {vehicles.map(v => (
              <div 
                key={v.id} 
                onClick={() => onSelectVehicle(v.id)}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeVehicleId === v.id ? 'bg-blue-50 border-blue-600 shadow-md ring-1 ring-blue-600' : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${activeVehicleId === v.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Car size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-black flex items-center gap-2">
                      {v.model}
                      {activeVehicleId === v.id && <CheckCircle2 size={12} className="text-blue-600" />}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase text-slate-400 bg-white px-1.5 rounded border border-slate-200">{v.plate}</span>
                      <span className="text-[8px] font-black uppercase text-slate-500">{v.brand} {v.year}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveVehicle(v.id); }} 
                    className="text-slate-300 hover:text-red-500 transition-colors p-2 bg-white rounded-xl shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'LOCATIONS' && (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-black tracking-tight uppercase">Locais e Empresas</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pontos de Interesse</p>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 ${
                isAdding ? 'bg-red-50 text-red-600' : 'bg-black text-white'
              }`}
            >
              {isAdding ? <Plus className="rotate-45" size={20} /> : <Plus size={20} />}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleSubmitLocation} className="space-y-4 animate-in fade-in zoom-in duration-200 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase ml-1">Nome</label>
                  <input
                    type="text"
                    placeholder="Ex: Posto Ipiranga"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-black outline-none transition-all text-sm font-bold text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase ml-1">Categoria</label>
                  <select
                    value={locType}
                    onChange={(e) => setLocType(e.target.value as any)}
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl outline-none text-sm font-bold text-black appearance-none"
                  >
                    <option value="POSTO">Posto</option>
                    <option value="OFICINA">Oficina</option>
                    <option value="CLIENTE">Cliente</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl">Salvar Local</button>
            </form>
          )}

          <div className="space-y-2">
            <SectionHeader title="Postos" icon={Fuel} colorClass="bg-blue-50 text-blue-600" count={groupedLocations.POSTO.length} />
            {groupedLocations.POSTO.map(l => (
              <div key={l.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-black">{l.name}</span>
                <button onClick={() => onRemoveLocation(l.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}

            <SectionHeader title="Oficinas" icon={Wrench} colorClass="bg-orange-50 text-orange-600" count={groupedLocations.OFICINA.length} />
            {groupedLocations.OFICINA.map(l => (
              <div key={l.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-black">{l.name}</span>
                <button onClick={() => onRemoveLocation(l.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}

            <SectionHeader title="Clientes" icon={Building2} colorClass="bg-emerald-50 text-emerald-600" count={groupedLocations.CLIENTE.length} />
            {groupedLocations.CLIENTE.map(l => (
              <div key={l.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-black">{l.name}</span>
                <button onClick={() => onRemoveLocation(l.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'USERS' && currentUserRole === UserRole.ADMIN && (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-black tracking-tight uppercase">Gestão de Equipe</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usuários e Permissões</p>
            </div>
            {!editingUserId && (
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 ${
                  isAdding ? 'bg-red-50 text-red-600' : 'bg-black text-white'
                }`}
              >
                {isAdding ? <Plus className="rotate-45" size={20} /> : <Plus size={20} />}
              </button>
            )}
          </div>

          {isAdding && (
            <form onSubmit={handleSubmitUser} className="space-y-4 animate-in fade-in zoom-in duration-200 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-black uppercase text-slate-400">{editingUserId ? 'Editando Usuário' : 'Novo Usuário'}</h4>
                {editingUserId && <button type="button" onClick={cancelUserEdit} className="text-red-500 hover:text-red-700"><X size={18} /></button>}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase ml-1">Nome Completo</label>
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-black outline-none font-bold text-black" placeholder="Ex: João Silva" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-black uppercase ml-1">Login</label>
                    <input type="text" value={userUsername} onChange={e => setUserUsername(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-black outline-none font-bold text-black" placeholder="joao.silva" />
                  </div>
                   <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-black uppercase ml-1">Senha</label>
                    <input type="password" value={userPass} onChange={e => setUserPass(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-black outline-none font-bold text-black" placeholder="••••" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase ml-1">Nível de Acesso</label>
                  <select value={userRole} onChange={e => setUserRole(e.target.value as UserRole)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl outline-none font-bold text-black">
                    <option value={UserRole.ADMIN}>Administrador</option>
                    <option value={UserRole.STANDARD}>Usuário Padrão</option>
                    <option value={UserRole.SIMPLE}>Usuário Simples</option>
                  </select>
                </div>
              </div>
              <button type="submit" className={`w-full text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-2 ${editingUserId ? 'bg-amber-600' : 'bg-black'}`}>
                {editingUserId ? <><Save size={16} /> Atualizar Usuário</> : 'Cadastrar Usuário'}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${u.role === UserRole.ADMIN ? 'bg-black text-white' : u.role === UserRole.STANDARD ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                    {u.role === UserRole.ADMIN ? <ShieldCheck size={20} /> : u.role === UserRole.STANDARD ? <UserCheck size={20} /> : <UserIcon size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-black">{u.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase text-slate-400">@{u.username}</span>
                      <span className="text-[8px] font-black uppercase bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{u.role}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditUser(u)} className="text-slate-400 hover:text-amber-600 transition-colors p-2 bg-white rounded-xl shadow-sm"><Pencil size={16} /></button>
                  {u.username !== 'admin' && (
                     <button onClick={() => onRemoveUser(u.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 bg-white rounded-xl shadow-sm"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
