/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Employee, UserRole } from './types/attendance';
import { initStorage, getEmployees } from './services/storage';
import { LoginView } from './components/LoginView';
import { EmployeeView } from './components/EmployeeView';
import { AdminView } from './components/AdminView';

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'karyawan' | 'admin'>('login');
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    // Initialize LocalStorage with pre-seeded demo records
    initStorage();

    // Check if there was a saved session
    try {
      const savedRole = localStorage.getItem('presensipro_active_role');
      const savedEmpId = localStorage.getItem('presensipro_active_empid');
      const employees = getEmployees();

      if (savedRole === 'admin') {
        setCurrentView('admin');
      } else if (savedRole === 'karyawan' && savedEmpId) {
        const emp = employees.find((e) => e.id === savedEmpId) || employees[0];
        setActiveEmployee(emp);
        setCurrentView('karyawan');
      }
    } catch (e) {
      console.warn('Session restore error:', e);
    }
  }, []);

  const handleLoginSuccess = (role: UserRole, employee?: Employee) => {
    try {
      localStorage.setItem('presensipro_active_role', role);
      if (employee) {
        localStorage.setItem('presensipro_active_empid', employee.id);
        setActiveEmployee(employee);
      }
    } catch (_e) {
      // ignore
    }

    if (role === 'admin') {
      setCurrentView('admin');
    } else {
      setActiveEmployee(employee || null);
      setCurrentView('karyawan');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('presensipro_active_role');
      localStorage.removeItem('presensipro_active_empid');
    } catch (_e) {
      // ignore
    }
    setActiveEmployee(null);
    setCurrentView('login');
  };

  const handleSwitchToEmployee = (emp: Employee) => {
    try {
      localStorage.setItem('presensipro_active_role', 'karyawan');
      localStorage.setItem('presensipro_active_empid', emp.id);
    } catch (_e) {
      // ignore
    }
    setActiveEmployee(emp);
    setCurrentView('karyawan');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {currentView === 'login' && <LoginView onLoginSuccess={handleLoginSuccess} />}

      {currentView === 'karyawan' && activeEmployee && (
        <EmployeeView employee={activeEmployee} onLogout={handleLogout} />
      )}

      {currentView === 'admin' && (
        <AdminView onLogout={handleLogout} onSwitchToEmployee={handleSwitchToEmployee} />
      )}
    </div>
  );
}
