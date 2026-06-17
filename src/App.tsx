import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import OrderDetailDrawer from "@/components/OrderDetailDrawer";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import Materials from "@/pages/Materials";
import Machines from "@/pages/Machines";
import Molding from "@/pages/Molding";
import Quality from "@/pages/Quality";
import Molds from "@/pages/Molds";
import Energy from "@/pages/Energy";

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "") {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-industrial-950 text-white">
      <Sidebar onNavigate={handleNavigate} />
      <div className="ml-60 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 overflow-auto scrollbar-thin">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/molding" element={<Molding />} />
            <Route path="/quality" element={<Quality />} />
            <Route path="/molds" element={<Molds />} />
            <Route path="/energy" element={<Energy />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <OrderDetailDrawer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
