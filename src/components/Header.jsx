import { Zap } from 'lucide-react';
import './Header.css';

export default function Header({ total, onHomeClick }) {
  return (
    <header className="app-header">
      <div 
        className="header-brand" 
        onClick={onHomeClick} 
        style={{ cursor: 'pointer' }}
        title="Return to Dashboard"
      >
        <img src="/logo.png" alt="Lumina Logo" className="header-logo" />
        <h1 className="header-title">Lumina</h1>
      </div>
      <div className="header-badge">
        <Zap size={14} />
        <span>{total} Questions</span>
      </div>
    </header>
  );
}
