import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Intro from './components/Intro';
import NPSForm from './pages/NPS-form';
import OutroPage from './components/Outro';
import FeedbackChat from './components/FeedbackChat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/nps" element={<NPSForm />} />
        <Route path="/outro" element={<OutroPage />} />
        <Route path="/chat" element={<FeedbackChat />} />
      </Routes>
    </Router>
  );
}

export default App;