import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/loginPage.jsx';
import Error404 from './components/Error404.jsx';
import Welcome from './pages/Welcome.jsx';
import Invoice from './pages/Invoice.jsx';

// Create a ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <section className='min-h-screen'>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/welcome" 
            element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            } 
          />
          <Route path="/invoice" 
            element={
              <ProtectedRoute>
                <Invoice />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Error404 />} />

        </Routes>
    </Router>
    </section>
  );
}

export default App;