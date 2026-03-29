import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { authAPI } from '../services/api';

const ROLES = ['Manager', 'Director', 'CFO', 'Employee'];
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'EU', name: 'Europe' },
  { code: 'AU', name: 'Australia' }
];

export default function CreateUserModal({ isOpen, onClose, defaultName = '', onUserCreated, allUsers = [], dbManagers = [] }) {
  const [nestedCreateUser, setNestedCreateUser] = useState(null);
  
  const [newUser, setNewUser] = useState({
    user: defaultName,
    role: 'Employee',
    manager: '',
    email: '',
    password: '',
    country: 'US',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendPassword = async () => {
    if (newUser.user && newUser.role && newUser.email && newUser.password) {
      try {
        setLoading(true);
        const res = await authAPI.addUser({
          name: newUser.user,
          email: newUser.email,
          role: newUser.role.toUpperCase(),
          password: newUser.password,
          country: newUser.country,
          // Manager intentionally omitted since it requires an ID on the backend
        });

        if (res.data?.user) {
          onUserCreated({ ...newUser, ...res.data.user });
          onClose();
        }
      } catch (error) {
        alert("Error creating user: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please fill in all mandatory fields (User, Role, Email, Password)");
    }
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password: pwd });
  };

  const handleNestedUserCreated = (createdUser) => {
    if (createdUser.user) {
        // we call parent onUserCreated so it gets added to global list
        onUserCreated(createdUser);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content - matching the "New User" table diagram with light theme */}
      <div className="relative bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200 overflow-hidden">
        
        {/* Header 'New User' Tag */}
        <div className="p-4 border-b border-gray-200 flex items-center bg-gray-50">
            <div className="border border-gray-300 bg-white rounded-xl px-6 py-2 shadow-sm">
                <span className="text-gray-800 font-medium text-lg">New User</span>
            </div>
        </div>

        {/* Table Area */}
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-4 font-semibold text-gray-700 text-lg border-r border-gray-200 text-center">User<span className="text-red-500 ml-1">*</span></th>
                <th className="p-4 font-semibold text-gray-700 text-lg border-r border-gray-200 text-center">Role<span className="text-red-500 ml-1">*</span></th>
                <th className="p-4 font-semibold text-gray-700 text-lg border-r border-gray-200 text-center">Manager</th>
                <th className="p-4 font-semibold text-gray-700 text-lg border-r border-gray-200 text-center">Email<span className="text-red-500 ml-1">*</span></th>
                <th className="p-4 font-semibold text-gray-700 text-lg border-r border-gray-200 text-center">Password<span className="text-red-500 ml-1">*</span></th>
                <th className="p-4 font-semibold text-gray-700 text-lg border-r border-gray-200 text-center">Country</th>
                <th className="p-4 font-semibold text-gray-700 text-lg text-center"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border-r border-gray-200 bg-white">
                    <input 
                        type="text" 
                        value={newUser.user}
                        onChange={(e) => setNewUser({...newUser, user: e.target.value})}
                        className="bg-transparent text-gray-900 w-full outline-none focus:ring-0 text-center placeholder-gray-400"
                        placeholder="Name"
                    />
                </td>
                <td className="p-4 border-r border-gray-200 bg-white">
                    <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="bg-transparent text-gray-900 w-full outline-none focus:ring-0 text-center appearance-none"
                    >
                        {ROLES.map(role => (
                            <option key={role} value={role} className="text-left">{role}</option>
                        ))}
                    </select>
                </td>
                <td className="p-4 border-r border-gray-200 bg-white">
                    <select
                        value={newUser.manager}
                        onChange={(e) => setNewUser({...newUser, manager: e.target.value})}
                        className="bg-transparent text-gray-900 w-full outline-none focus:ring-0 text-center appearance-none"
                    >
                        <option value="" className="text-gray-400">Select Manager</option>
                        {dbManagers.map(mgr => (
                            <option key={mgr} value={mgr} className="text-left">{mgr}</option>
                        ))}
                    </select>
                </td>
                <td className="p-4 border-r border-gray-200 bg-white">
                    <input 
                        type="email" 
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="bg-transparent text-gray-900 w-full outline-none focus:ring-0 text-center placeholder-gray-400"
                        placeholder="Email"
                    />
                </td>
                <td className="p-4 border-r border-gray-200 bg-white">
                    <div className="flex items-center gap-2 justify-center">
                        <input 
                            type="text" 
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            className="bg-transparent text-gray-900 w-24 outline-none focus:ring-0 text-center placeholder-gray-400"
                            placeholder="Password"
                        />
                        <button 
                            onClick={generateRandomPassword}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Generate Random Password"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </td>
                <td className="p-4 border-r border-gray-200 bg-white">
                    <select
                        value={newUser.country}
                        onChange={(e) => setNewUser({...newUser, country: e.target.value})}
                        className="bg-transparent text-gray-900 w-full outline-none focus:ring-0 text-center appearance-none"
                    >
                        {COUNTRIES.map(c => (
                            <option key={c.code} value={c.code} className="text-left">{c.name}</option>
                        ))}
                    </select>
                </td>
                <td className="p-4 flex justify-center bg-white cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors" onClick={handleSendPassword}>
                    <button 
                        disabled={loading}
                        className="border border-gray-300 bg-white rounded-lg px-4 py-1.5 text-gray-700 font-medium disabled:opacity-50 pointer-events-none shadow-sm"
                    >
                        {loading ? 'Sending...' : 'Send password'}
                    </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Recursive modal for creating the manager if missing */}
      <CreateUserModal 
        isOpen={!!nestedCreateUser}
        onClose={() => setNestedCreateUser(null)}
        defaultName={nestedCreateUser?.name || ''}
        onUserCreated={handleNestedUserCreated}
        allUsers={allUsers}
      />
    </div>
  );
}
