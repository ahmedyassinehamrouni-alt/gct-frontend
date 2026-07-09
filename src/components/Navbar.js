import React from 'react';
import logo from '../assets/logogct.png';// Cette barre de navigation s'affiche en haut de l'écran, une fois connecté.
// Elle permet de changer de "page" en appelant onNaviguer (défini dans App.js).
function Navbar({ user, onNaviguer, onDeconnexion }) {
    return (
        <nav className="navbar navbar-dark app-navbar mb-4">
            <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2">
                <img src={logo} alt="GCT" style={{ width: '36px', height: 'auto', marginRight: '8px' }} />
                <span className="navbar-brand mb-0">GCT Signature</span>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    <button className="btn btn-outline-light btn-sm" onClick={() => onNaviguer('liste')}>
                        Liste des documents
                    </button>

                    {/* Seul l'employé a le droit de créer un nouveau document */}
                    {user.role === 'employe' && (
                        <button className="btn btn-outline-light btn-sm" onClick={() => onNaviguer('creer')}>
                            Nouveau document
                        </button>
                    )}

                    <button className="btn btn-outline-light btn-sm" onClick={() => onNaviguer('historique')}>
                        Historique des signatures
                    </button>

                    {/* Seul le responsable possède un certificat numérique */}
                    {user.role === 'responsable' && (
                        <button className="btn btn-outline-light btn-sm" onClick={() => onNaviguer('certificat')}>
                            Mon certificat
                        </button>
                    )}

                    <span className="user-pill text-white">
                        {user.prenom} {user.nom} · {user.role}
                    </span>

                    <button className="btn btn-outline-warning btn-sm" onClick={onDeconnexion}>
                        Déconnexion
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;