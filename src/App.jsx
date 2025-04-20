import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerProvider } from './context/CustomerContext';
import { InvoiceHistoryProvider } from './context/InvoiceHistoryContext';
import InvoiceHistory from './pages/InvoiceHistory.jsx';
import Error404 from './components/Error404.jsx';
import LoginPage from './pages/loginPage.jsx';
import Customer from './pages/Customer.jsx';
import Admin from './pages/admin/Admin.jsx';
import Invoice from './pages/Invoice.jsx';
import Welcome from './pages/Welcome.jsx';
import { Toaster } from 'sonner';
import React from 'react';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <section>
      <Router>
        <CustomerProvider>
          <InvoiceHistoryProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/welcome" element={
                <ProtectedRoute>
                  <Welcome />
                </ProtectedRoute>
              } />

              <Route path="/customer" element={
                <ProtectedRoute>
                  <Customer />
                </ProtectedRoute>
              } />

              <Route path="/invoice" element={
                <ProtectedRoute>
                  <Invoice />
                </ProtectedRoute>
              } />

              <Route path="/history" element={
                <ProtectedRoute>
                  <InvoiceHistory />
                </ProtectedRoute>
              } />

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </InvoiceHistoryProvider>
        </CustomerProvider>
      </Router>
      <Toaster position="bottom-center" />
    </section>
  );
}

export default App;