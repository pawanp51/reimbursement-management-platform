import React, { useState, useEffect } from 'react';
import { X, Check, Plus } from 'lucide-react';
import CreateUserModal from './CreateUserModal';
import { authAPI } from '../services/api';

export default function ApprovalRuleModal({ isOpen, onClose }) {
  const [allUsers, setAllUsers] = useState([]); // List of strings used for autocomplete and missing check
  const [dbManagers, setDbManagers] = useState([]); // List of strings for valid managers
  
  const [approvers, setApprovers] = useState([]); // Start empty
  const [formData, setFormData] = useState({
    user: '',
    ruleDescription: '',
    manager: '',
    isManagerApprover: false,
    sequenceMatters: false,
    minPercentage: '',
  });

  const [createUserContext, setCreateUserContext] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const res = await authAPI.getUsers();
          if (res.data) {
            const users = res.data;
            // Get all names
            const names = users.map(u => (u.firstName + ' ' + (u.lastName || '')).trim());
            setAllUsers(names);
            
            // Filter managers
            const managerRoles = ['MANAGER', 'DIRECTOR', 'CFO', 'CTO', 'ADMIN'];
            const mgrs = users
              .filter(u => managerRoles.includes(u.role))
              .map(u => (u.firstName + ' ' + (u.lastName || '')).trim());
            setDbManagers(mgrs);
          }
        } catch (err) {
          console.error("Failed to fetch users:", err);
        }
      };
      
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApproverRequiredToggle = (id) => {
    setApprovers((prev) =>
      prev.map((appr) =>
        appr.id === id ? { ...appr, required: !appr.required } : appr
      )
    );
  };

  const handleAddApprover = () => {
    setApprovers([
      ...approvers,
      { id: Date.now(), name: '', required: false }
    ]);
  };

  const isUserMissing = (username) => {
    return username.trim() !== '' && !allUsers.includes(username.toLowerCase());
  };

  const handleCreateUserFromModal = (newUser) => {
    const nameLower = newUser.user.toLowerCase();
    if (!allUsers.includes(nameLower)) {
      setAllUsers([...allUsers, nameLower]);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Content - Light Theme */}
        <div className="relative bg-white text-gray-800 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">Admin view (Approval rules)</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100 p-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Left Column */}
              <div className="space-y-8">
                {/* User Field */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2 font-medium">User</label>
                  <div className="flex items-center gap-3">
                    <input
                      list="all-users-list"
                      type="text"
                      value={formData.user}
                      onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-gray-300 pb-2 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors"
                      placeholder="Enter user name"
                    />
                    <datalist id="all-users-list">
                      {allUsers.map((u, i) => <option key={i} value={u} />)}
                    </datalist>
                    {isUserMissing(formData.user) && (
                      <button 
                        onClick={() => setCreateUserContext({ type: 'main', name: formData.user })}
                        className="whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 text-xs rounded-md font-medium border border-blue-200 transition-colors"
                      >
                        Create User
                      </button>
                    )}
                  </div>
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2 font-medium">Description about rules</label>
                  <input
                    type="text"
                    value={formData.ruleDescription}
                    onChange={(e) => setFormData({ ...formData, ruleDescription: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-gray-300 pb-2 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                {/* Manager Field with Help Text */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2 font-medium">Manager:</label>
                  <div className="relative">
                    <select
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-gray-300 pb-2 text-gray-900 focus:outline-none focus:border-blue-600 appearance-none transition-colors"
                    >
                      <option value="">-- Select --</option>
                      {dbManagers.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <div className="absolute right-0 top-1 text-gray-400 pointer-events-none">
                      ▼
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                    Dynamic dropdown<br/>
                    Initially the manager set on user record should be set, admin can change manager for approval if required.
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Top Approvers Section */}
                <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2">
                  <span className="text-sm font-medium text-gray-500">Approvers</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Is manager an approver?</span>
                    <label className="relative flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.isManagerApprover}
                        onChange={(e) => setFormData({ ...formData, isManagerApprover: e.target.checked })}
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded bg-transparent peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-all">
                        {formData.isManagerApprover && <Check size={14} className="text-white" />}
                      </div>
                    </label>
                  </div>
                </div>
                
                {formData.isManagerApprover && (
                  <p className="text-xs text-red-500 -mt-6">
                    If this field is checked then by default the approve request would go to his/her manager first, before going to other approvers.
                  </p>
                )}

                {/* Approvers List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                     <button 
                        onClick={handleAddApprover}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Plus size={16} /> Add Approver
                      </button>
                    <span className="text-sm text-gray-500">Required</span>
                  </div>
                  
                  {approvers.map((approver, index) => (
                    <div key={approver.id} className="flex items-center gap-4 group">
                      <span className="text-gray-400 w-4">{index + 1}</span>
                      <div className="flex-1 border-b border-gray-300 pb-2 flex justify-between items-end gap-3">
                        
                        <div className="flex-1 flex items-center gap-2">
                          <input 
                            list={`approver-list-${approver.id}`}
                            type="text"
                            value={approver.name}
                            onChange={(e) => {
                              const newApprovers = [...approvers];
                              newApprovers[index].name = e.target.value;
                              setApprovers(newApprovers);
                            }}
                            placeholder="Enter Username"
                            className="w-full bg-transparent text-gray-900 focus:outline-none appearance-none"
                          />
                          <datalist id={`approver-list-${approver.id}`}>
                            {allUsers.map((u, i) => <option key={`app-${i}`} value={u} />)}
                          </datalist>
                          {isUserMissing(approver.name) && (
                            <button 
                              onClick={() => setCreateUserContext({ type: 'approver', id: approver.id, name: approver.name })}
                              className="whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-0.5 text-[11px] rounded font-medium border border-blue-200 transition-colors"
                            >
                              Create User
                            </button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <label className="relative flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={approver.required}
                              onChange={() => handleApproverRequiredToggle(approver.id)}
                            />
                            <div className="w-6 h-6 border-2 border-gray-300 rounded bg-transparent peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-all">
                              {approver.required && <Check size={16} className="text-white" />}
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {approvers.length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-2">No additional approvers added.</p>
                  )}
                </div>

                {/* Approvers Sequence */}
                <div className="pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500">Approvers Sequence:</span>
                    <label className="relative flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.sequenceMatters}
                        onChange={(e) => setFormData({ ...formData, sequenceMatters: e.target.checked })}
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded bg-transparent peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-all">
                        {formData.sequenceMatters && <Check size={14} className="text-white" />}
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    If this field is ticked true then the above mentioned sequence of approvers matters, that is first the request goes to John, if he approves/rejects then only request goes to mitchell and so on.<br/>
                    If the required approver rejects the request, then expense request is auto-rejected.<br/>
                    If not ticked then send approver request to all approvers at the same time.
                  </p>
                </div>

                {/* Minimum Approval Percentage */}
                <div className="pt-4 flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">Minimum Approval percentage:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={formData.minPercentage}
                    onChange={(e) => setFormData({ ...formData, minPercentage: e.target.value })}
                    className="w-16 bg-transparent border-b-2 border-gray-300 pb-1 text-center text-gray-900 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-400">
                  Specify the number of percentage approvers required in order to get the request approved.
                </p>

              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-4 rounded-b-2xl">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-md shadow-blue-500/20 transition-all">
              Save Rule
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Modal for Creating User */}
      <CreateUserModal 
        isOpen={!!createUserContext} 
        onClose={() => setCreateUserContext(null)} 
        defaultName={createUserContext?.name || ''}
        onUserCreated={(newUser) => {
          handleCreateUserFromModal(newUser);
        }}
        allUsers={allUsers}
        dbManagers={dbManagers}
      />
    </>
  );
}
