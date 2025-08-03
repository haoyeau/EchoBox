import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { SocketProvider } from './contexts/SocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './components/Home';
import Room from './components/Room';
import './App.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SocketProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/room/:roomId" element={<Room />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </ErrorBoundary>
  );
};

export default App;
