import { BookOpen, Zap } from 'lucide-react';
import './Header.css';

export default function Header({ total }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-icon-wrap">
          <BookOpen size={22} />
        </div>
        <div>
          <h1 className="header-title">ServiceNow CAD Prep</h1>
          <p className="header-subtitle">Certified Application Developer</p>
        </div>
      </div>
      <div className="header-badge">
        <Zap size={14} />
        <span>{total} Questions</span>
      </div>
    </header>
  );
}
