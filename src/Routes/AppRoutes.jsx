import { Routes, Route } from 'react-router-dom';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Pages
import Confirm from '../pages/Confirm';
import Menu from '../pages/Menu';
import Order from '../pages/Order';

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Menu />} />  
          <Route path="/order" element={<Order />} />
          <Route path="/confirm" element={<Confirm />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}