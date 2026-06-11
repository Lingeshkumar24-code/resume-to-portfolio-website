import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import AdminPanel from './pages/AdminPanel';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/editor/:id" 
        element={
          <PrivateRoute>
            <Editor />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        } 
      />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
