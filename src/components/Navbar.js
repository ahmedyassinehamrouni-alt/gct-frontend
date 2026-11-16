import React from 'react';
import Logo from './Logo';
import { initiales } from './Topbar';

const LABEL_ROLE = { admin: 'Administrateur', chef: 'Chef de service', agent: 'Agent' };

function Navbar({ user, onNaviguer, onDeconnexion, activePage }) {
    const items = [
        {
            key: 'liste',
            label: 'Documents',
            icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        },
        {
            key: 'creer',
            label: 'Nouveau document',
            icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        },
        {
            key: 'historique',
            label: 'Historique',
            icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        },
        {
            key: 'certificat',
            label: 'Mon certificat',
            icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M8 14l-2 7 6-3 6 3-2-7"/></svg>
        },
        ...(user.role_app === 'admin' ? [{
            key: 'admin',
            label: 'Administration',
            icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M20.59 13.41L13.42 20.6a2 2 0 01-2.83 0L2.5 12.5V2.5h10L20.59 10.6a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>
        }] : []),
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Logo />
                <div className="sidebar-logo-name">Signature Électronique</div>
                <div className="sidebar-logo-sub">Gestion sécurisée de vos documents</div>
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

            <svg className="sidebar-watermark" viewBox="0 0 190 190" aria-hidden="true">
                <rect x="40" y="40" width="110" height="110" transform="rotate(45 95 95)" fill="#e6eff9" opacity="0.85" />
                <g fill="none" stroke="#fff" strokeWidth="3" opacity="0.9">
                    <circle cx="80" cy="95" r="22" /><circle cx="110" cy="75" r="22" />
                    <circle cx="110" cy="115" r="22" /><circle cx="140" cy="95" r="22" />
                </g>
            </svg>

            <div className="sidebar-bottom">
                <button className="sidebar-user" onClick={() => onNaviguer('certificat')}>
                    <span className="avatar">{initiales(user)}</span>
                    <span className="sidebar-user-info">
                        <div className="sidebar-user-name">{user.prenom} {user.nom}</div>
                        <div className="sidebar-user-role">{LABEL_ROLE[user.role_app] || user.role_app}</div>
                    </span>
                    <svg className="sidebar-user-chevron" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18" /></svg>
                </button>
                <button className="sidebar-logout" onClick={onDeconnexion}>
                    <svg fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}

export default Navbar;
