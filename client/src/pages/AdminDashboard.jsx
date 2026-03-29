import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import ApprovalRuleModal from '../components/ApprovalRuleModal';
import { approvalAPI } from '../services/api';

export default function AdminDashboard() {
  const [rules, setRules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await approvalAPI.getAllRules();
      if (res.data?.approvalRules) {
        // Map database rules to UI table structure
        const mappedRules = res.data.approvalRules.map(rule => ({
          id: rule.id,
          user: `${rule.user.firstName} ${rule.user.lastName || ''}`.trim(),
          rule: rule.description,
          manager: rule.isManagerApprover ? 'Auto-routed (Manager First)' : 'Not routed to manager',
          minPercentage: rule.minimalApprovalPercentage,
        }));
        setRules(mappedRules);
      }
    } catch (err) {
      console.error("Error fetching rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Dashboard (Approval Rules)
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>Create New User Approval Rule</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 font-semibold text-gray-700">User</th>
                <th className="py-4 px-6 font-semibold text-gray-700">Rule Description</th>
                <th className="py-4 px-6 font-semibold text-gray-700">Manager</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-center">Min. % Approval</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{rule.user}</td>
                  <td className="py-4 px-6 text-gray-600">{rule.rule}</td>
                  <td className="py-4 px-6 text-gray-600">{rule.manager}</td>
                  <td className="py-4 px-6 text-center text-gray-600">{rule.minPercentage}%</td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end gap-3">
                      <button className="text-blue-500 hover:text-blue-700 transition-colors p-1.5 rounded-md hover:bg-blue-50">
                        <Edit2 size={18} />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No approval rules found. Click the button above to create one.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-blue-500" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ApprovalRuleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchRules();
        }}
      />
    </div>
  );
}
