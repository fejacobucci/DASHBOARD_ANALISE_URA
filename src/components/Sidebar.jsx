import React, { useState } from 'react';
import { Menu, X, Activity, TrendingUp, Phone } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ currentView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    {
      id: 'ura-dashboard',
      label: 'Dashboard URA',
      icon: Activity,
      description: 'Análise de Caminhos e Fluxos'
    },
    {
      id: 'sankey-custom',
      label: 'Diagrama Sankey',
      icon: TrendingUp,
      description: 'Visualização Customizada'
    },
    {
      id: 'call-analysis',
      label: 'Análise de Ligações',
      icon: Phone,
      description: 'Busca e Detalhamento'
    }
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        title={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <Activity size={32} className="sidebar-logo" />
          {isOpen && <h2 className="sidebar-title">Dashboard Analytics</h2>}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                onClick={() => onViewChange(item.id)}
                title={!isOpen ? item.label : ''}
              >
                <Icon size={24} className="sidebar-item-icon" />
                {isOpen && (
                  <div className="sidebar-item-content">
                    <span className="sidebar-item-label">{item.label}</span>
                    <span className="sidebar-item-description">{item.description}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {isOpen && (
          <div className="sidebar-footer">
            <p>v1.0.0</p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
