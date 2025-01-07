import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Intro from './components/Intro';
import Grade from './components/Grade';
import Outro from './components/Outro';
import NPSForm from './pages/NPS-form';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/nps" element={<NPSForm />} />        
        {/* <Route path="/grade" element={<Grade />} /> */}
        <Route path="/outro" element={<Outro />} />
      </Routes>
    </Router>
  );
}

export default App;