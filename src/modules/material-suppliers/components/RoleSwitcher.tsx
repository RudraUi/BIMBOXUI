import React from 'react';
import { useSuppliers } from '../context/SupplierContext';
import { Shield, Briefcase, User, RefreshCw } from 'lucide-react';
import { Role } from '../types/supplier.types';

export const RoleSwitcher: React.FC = () => {
  const { role, setRole, activeVendorId, setActiveVendorId, suppliers, resetData } = useSuppliers();

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="font-semibold tracking-wide text-xs text-slate-400 uppercase">Prototype Control Panel</span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Role Selector */}
        <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setRole('admin')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              role === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>
          
          <button
            onClick={() => setRole('manager')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              role === 'manager'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Manager
          </button>
          
          <button
            onClick={() => setRole('vendor')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              role === 'vendor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Vendor Portal
          </button>
        </div>

        {/* Supplier Sim Selector (Only when Role is Vendor) */}
        {role === 'vendor' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Simulate Vendor:</span>
            <select
              value={activeVendorId}
              onChange={(e) => setActiveVendorId(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Prototype Data */}
        <button
          onClick={resetData}
          title="Reset Prototype to Initial Mock Database State"
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Demo
        </button>
      </div>
    </div>
  );
};
