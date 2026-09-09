import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import './styles/components.css';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Features } from './components/Features';
import { ProductShowcase } from './components/ProductShowcase';
import { DownloadSection } from './components/Download';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { DynamicLandingPage } from './views/DynamicLandingPage';

const Home = () => (
  <div className="app-layout">
    <Navbar />
    <main>
      <Hero />
      <Stats />
      <Features />
      <ProductShowcase />
      <DownloadSection />
      <FAQ />
      <FinalCTA />
    </main>
    <Footer />
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/p/:slug" element={<DynamicLandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
