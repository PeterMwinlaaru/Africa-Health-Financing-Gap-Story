import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layout Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Pages (OWID-style)
import Home from './pages/Home/Home';
import Indicators from './pages/Indicators/Indicators';
import ChartLibrary from './pages/ChartLibrary/ChartLibrary';
import ChartPage from './pages/ChartPage/ChartPage';
import DataExplorer from './pages/DataExplorer/DataExplorer';
import CrossDimensionalExplorer from './pages/CrossDimensional/CrossDimensionalExplorer';
import TopicPage from './pages/TopicPage/TopicPage';
import About from './pages/About/About';
import Sources from './pages/Sources/Sources';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<Home />} />

            {/* Indicators Library */}
            <Route path="/indicators" element={<Indicators />} />

            {/* Chart pages */}
            <Route path="/charts" element={<ChartLibrary />} />
            <Route path="/chart/:slug" element={<ChartPage />} />

            {/* Data Explorer */}
            <Route path="/explorer" element={<DataExplorer />} />
            <Route path="/cross-dimensional" element={<CrossDimensionalExplorer />} />

            {/* Topic pages */}
            <Route path="/topics/:category" element={<TopicPage />} />

            {/* Info pages */}
            <Route path="/about" element={<About />} />
            <Route path="/sources" element={<Sources />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
