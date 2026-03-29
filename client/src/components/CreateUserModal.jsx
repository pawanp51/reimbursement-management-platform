import React, { useState } from 'react';

const ROLES = ['Manager', 'Director', 'CFO', 'Employee'];

export default function CreateUserModal({ isOpen, onClose, defaultName = '', onUserCreated, allUsers = [] }) {
  const [nestedCreateUser, setNestedCreateUser] = useState(null);
  
  const [newUser, setNewUser] = useState({
    user: defaultName,
    role: 'Employee',
    manager: '',
    email: '',
  });

  if (!isOpen) return null;

  const handleSendPassword = () => {
    if (newUser.user && newUser.email) {
      onUserCreated(newUser);
      onClose();
    } else {
      alert("Please provide User and Email");
    }
  };

  const isUserMissing = (username) => {
    return username.trim() !== '' && !allUsers.includes(username.toLowerCase());
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
                <th className="p-4 font-semibold text-gray-700 text-lg border-r border-gray-200 text-center">User</th>
                <th className="p-4 font-semibold text-gray-700 text-lg border-r border-gray-200 text-center">Role</th>
                <th className="p-4 font-semibold text-gray-700 text-lg border-r border-gray-200 text-center">Manager</th>
                <th className="p-4 font-semibold text-gray-700 text-lg border-r border-gray-200 text-center">Email</th>
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
                     <div className="flex flex-col gap-2 items-center">
                        <input
                            type="text"
                            value={newUser.manager}
                            onChange={(e) => setNewUser({...newUser, manager: e.target.value})}
                            className="bg-transparent text-gray-900 w-full outline-none focus:ring-0 text-center placeholder-gray-400"
                            placeholder="Manager name"
                        />
                        {isUserMissing(newUser.manager) && (
                          <button 
                            onClick={() => setNestedCreateUser({ name: newUser.manager })}
                            className="px-2 py-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 rounded whitespace-nowrap hover:bg-blue-100 transition-colors"
                          >
                            Create User
                          </button>
                        )}
                     </div>
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
                <td className="p-4 flex justify-center bg-white">
                    <button 
                        onClick={handleSendPassword}
                        className="border border-gray-300 bg-white rounded-lg px-4 py-1.5 text-gray-700 font-medium hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm"
                    >
                        Send password
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
