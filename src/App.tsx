import React from 'react';
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

export const App: React.FC = () => {
  return (
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
};

export default App;
