import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import DashboardPage from './pages/manager/DashboardPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ExpenseDashboard from './pages/EmployeeDashboard';
import ExpenseForm from './pages/NewExpense';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/manager" element={<DashboardPage />} />
        <Route path="/employee-dashboard" element={<ExpenseDashboard />} />
        <Route path="/new-expense" element={<ExpenseForm />} />
      </Routes>
    </Router>
  );
}

export default App;
