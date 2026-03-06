import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import UploadPage from './pages/Upload';
import FormPage from './pages/Form';
import ResultPage from './pages/Result';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen font-sans">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/form" element={<FormPage />} />
            <Route path="/result" element={<ResultPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
