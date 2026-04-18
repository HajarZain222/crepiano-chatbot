import { Routes, Route } from 'react-router-dom';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Pages
import Browse from '../pages/Browse';
import Order from '../pages/Order';
import Menu from '../pages/Menu';
import Confirm from '../pages/Confirm';

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Browse />} />  
          <Route path="/menu" element={<Menu />} />  
          <Route path="/order" element={<Order />} />
          <Route path="/confirm" element={<Confirm />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}