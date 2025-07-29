import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { SocketProvider } from './contexts/SocketContext';
import Home from './components/Home';
import Room from './components/Room';
import './App.css';

function App() {
  return (
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
  );
}

export default App;
