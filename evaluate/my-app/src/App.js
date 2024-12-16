import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Intro from './components/Intro';
import Grade from './components/Grade';
import Outro from './components/Outro';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/grade" element={<Grade />} />
        <Route path="/outro" element={<Outro />} />
      </Routes>
    </Router>
  );
}

export default App;