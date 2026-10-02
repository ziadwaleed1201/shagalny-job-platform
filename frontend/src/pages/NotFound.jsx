import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <div>
      <Navbar />
      <main className="section py-24 text-center max-w-xl mx-auto">
        <p className="text-7xl font-extrabold text-navy-200">404</p>
        <h1 className="text-3xl font-extrabold mt-4">Page not found</h1>
        <p className="text-navy-500 mt-2">The page you're looking for doesn't exist or was moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-primary text-sm">Back to home</Link>
          <Link to="/jobs" className="btn-outline text-sm">Browse jobs</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
