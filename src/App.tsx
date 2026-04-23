import Header from './components/landing/Header';
import Hero from './components/landing/Hero';
import Benefits from './components/landing/Benefits';
import Features from './components/landing/Features';
import FAQ from './components/landing/FAQ';
import CTA from './components/landing/CTA';
import Footer from './components/landing/Footer';

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Features />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      {/* Back to Top Button can be implemented here if needed later */}
    </>
  );
}

export default App;
