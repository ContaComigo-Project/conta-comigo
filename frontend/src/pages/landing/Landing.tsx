import Header from './components/Header';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Features from './components/Features';
import Ecosystem from './components/Ecosystem';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';

export default function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Features />
        <Ecosystem />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
