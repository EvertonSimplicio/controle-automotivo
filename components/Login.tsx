
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Car, Lock, User as UserIcon, ArrowRight, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  availableUsers: User[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, availableUsers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    // Tenta encontrar um usuário pré-existente
    const existingUser = availableUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (existingUser) {
      onLogin(existingUser);
    } else {
      const newUser: User = {
        id: crypto.randomUUID(),
        name: username.split('.')[0].charAt(0).toUpperCase() + username.split('.')[0].slice(1),
        username: username.toLowerCase(),
        role: UserRole.ADMIN,
      };
      onLogin(newUser);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 z-[200]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto mb-6">
            <Car size={44} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">Controle Automotivo</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Gestão Veicular Profissional</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-black uppercase ml-1 tracking-widest">Usuário</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Seu usuário"
                  className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none transition-all font-bold text-black"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-black uppercase ml-1 tracking-widest">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none transition-all font-bold text-black"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
              <div className="mt-0.5 text-blue-600"><ShieldAlert size={16} /></div>
              <p className="text-[10px] font-black text-blue-800 uppercase leading-relaxed">
                Ambiente seguro ativado. <br/> Use credenciais válidas para continuar.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-[13px] tracking-widest shadow-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Acessar Painel <ArrowRight size={18} />
            </button>
          </form>
        </div>
        
        <div className="mt-8 grid grid-cols-3 gap-2 px-4 opacity-50">
          <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase">Admin</p>
            <p className="text-[9px] font-bold text-slate-600">admin</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase">Padrão</p>
            <p className="text-[9px] font-bold text-slate-600">padrao</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase">Simples</p>
            <p className="text-[9px] font-bold text-slate-600">simples</p>
          </div>
        </div>
      </div>
    </div>
  );
};
