import React from 'react';
import logo from '../assets/logogct.png';

const LABEL_ROLE = { admin: 'Administrateur', chef: 'Chef de service', agent: 'Agent' };

function Navbar({ user, onNaviguer, onDeconnexion, activePage }) {
    const items = [
        {
            key: 'liste',
            label: 'Documents',
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        },
        {
            key: 'creer',
            label: 'Nouveau document',
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        },
        {
            key: 'historique',
            label: 'Historique',
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        },
        {
            key: 'certificat',
            label: 'Mon certificat',
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M8 14l-2 7 6-3 6 3-2-7"/></svg>
        },
        ...(user.role_app === 'admin' ? [{
            key: 'admin',
            label: 'Administration',
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.59 13.41L13.42 20.6a2 2 0 01-2.83 0L2.5 12.5V2.5h10L20.59 10.6a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>
        }] : []),
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src={logo} alt="GCT" />
                <div className="sidebar-logo-name">GCT Signature</div>
                <div className="sidebar-logo-sub">Signature Electronique</div>
            </div>

            <nav className="sidebar-nav">
                {items.map(item => (
                    <button
                        key={item.key}
                        className={`sidebar-item${activePage === item.key ? ' active' : ''}`}
                        onClick={() => onNaviguer(item.key)}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar-user">
                <div className="sidebar-user-name">{user.prenom} {user.nom}</div>
                <div className="sidebar-user-role">
                    {LABEL_ROLE[user.role_app] || user.role_app}
                    {user.poste && ` — ${user.poste}`}
                    {user.departement && <span className="sidebar-user-dept">{user.departement}</span>}
                </div>
                <button className="sidebar-logout" onClick={onDeconnexion}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Deconnexion
                </button>
            </div>
        </aside>
    );
}

export default Navbar;
