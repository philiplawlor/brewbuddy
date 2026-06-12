import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-brewery-black">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
