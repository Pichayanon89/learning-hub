import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { schoolLogo } from '../assets';

export default function Layout() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="คลังสื่อการเรียนรู้">
          <img 
            src={schoolLogo} 
            alt="โลโก้โรงเรียนอนุบาลหนองหานวิทยายน" 
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--line)' }} 
          />
          <span>
            <strong>คลังสื่อการเรียนรู้</strong>
            <small>ครูพิชญานนท์</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="เมนูหลัก">
          <Link to="/">หน้าแรก</Link>
          <Link to="/categories">สื่อทั้งหมด</Link>
          <Link to="/about">เกี่ยวกับครู</Link>
          <Link to="/contact">ติดต่อ</Link>
        </nav>

        <Link className="admin-button" to="/admin">
          <LayoutDashboard size={18} />
          <span>หลังบ้านครู</span>
        </Link>
      </header>
      
      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <span>© 2026 คลังสื่อการเรียนรู้ครูพิชญานนท์ — โรงเรียนอนุบาลหนองหานวิทยายน</span>
          <div className={`connection-badge ${isOnline ? 'online' : 'offline'}`}>
            <span className="badge-dot" />
            <span>{isOnline ? '📶 ออนไลน์เต็มรูปแบบ' : '📴 โหมดออฟไลน์ถนอมสายตา'}</span>
          </div>
        </div>
      </footer>
      
      <Toaster position="bottom-right" />
    </div>
  );
}
