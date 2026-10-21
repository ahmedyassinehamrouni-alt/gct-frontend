import React, { useEffect, useRef, useState } from 'react';

const LABEL_ROLE = { admin: 'Administrateur', chef: 'Chef de service', agent: 'Agent' };

export function initiales(user) {
    return `${(user.prenom || '').charAt(0)}${(user.nom || '').charAt(0)}`.toUpperCase();
}

function Topbar({ user, onNaviguer, onDeconnexion }) {
    const [ouvert, setOuvert] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const fermer = (e) => { if (ref.current && !ref.current.contains(e.target)) setOuvert(false); };
        document.addEventListener('mousedown', fermer);
        return () => document.removeEventListener('mousedown', fermer);
    }, []);

    return (
        <header className="topbar">
            <svg className="topbar-decor" viewBox="0 0 260 86" fill="none" stroke="#9fb9d4" strokeWidth="1" opacity="0.45" aria-hidden="true">
                <circle cx="150" cy="0" r="48" />
                <circle cx="196" cy="22" r="36" />
                <circle cx="120" cy="52" r="30" />
                <path d="M0 70 C40 40, 70 90, 110 60 S190 30, 260 70" />
                <circle cx="30" cy="80" r="26" />
            </svg>

            <div className="topbar-company">
                <strong>Groupe Chimique de Tunisie</strong>
                <span>Une chimie pour demain</span>
            </div>
            <div className="topbar-sep" />
            <button className="topbar-bell" aria-label="Notifications">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" />
                </svg>
                <span className="topbar-bell-dot" />
            </button>
            <div className="topbar-sep" />
            <div ref={ref} style={{ position: 'relative' }}>
                <button className="topbar-user" onClick={() => setOuvert(o => !o)} aria-haspopup="menu" aria-expanded={ouvert}>
                    <span className="avatar avatar-dark">{initiales(user)}</span>
                    <span>
                        <div className="topbar-user-name">{user.prenom} {user.nom}</div>
                        <div className="topbar-user-role">{LABEL_ROLE[user.role_app] || user.role_app}</div>
                    </span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {ouvert && (
                    <div className="dropdown-menu-gct" role="menu">
                        <button role="menuitem" onClick={() => { setOuvert(false); onNaviguer('certificat'); }}>Mon certificat</button>
                        <button role="menuitem" onClick={() => { setOuvert(false); onDeconnexion(); }}>Déconnexion</button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Topbar;
