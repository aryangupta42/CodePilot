import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Hero } from '../components/landing/Hero';
import { InteractivePreview } from '../components/landing/InteractivePreview';
import { WorkflowVisualizer } from '../components/landing/WorkflowVisualizer';
import { FeatureCards } from '../components/landing/FeatureCards';
import { UseCases } from '../components/landing/UseCases';
import { Footer } from '../components/landing/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-darkest text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <InteractivePreview />
        <WorkflowVisualizer />
        <FeatureCards />
        <UseCases />
      </main>
      <Footer />
    </div>
  );
};
