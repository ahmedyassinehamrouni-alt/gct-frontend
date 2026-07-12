import React, { useState } from 'react';
import api from '../api';
import logo from '../assets/logogct.png';

function Login({ onLogin, onAllerInscription, emailParDefaut }) {
    const [email, setEmail] = useState(emailParDefaut || '');
    const [motDePasse, setMotDePasse] = useState('');
    const [erreur, setErreur] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const reponse = await api.post('/login', {
                email,
                mot_de_passe: motDePasse
            });
            onLogin(reponse.data);
        } catch (err) {
            setErreur('Email ou mot de passe incorrect.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Logo */}
                <div className="text-center mb-3">
                    <img src={logo} alt="GCT Logo" style={{ width: '90px', height: 'auto' }} />
                </div>

                <h3 className="text-center mb-1">Connexion</h3>
                <p className="text-center auth-subtitle mb-4">Application GCT - Signature Electronique</p>

                {erreur && <div className="alert alert-danger">{erreur}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Mot de passe</label>
                        <input
                            type="password"
                            className="form-control"
                            value={motDePasse}
                            onChange={(e) => setMotDePasse(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mt-2">
                        Se connecter
                    </button>
                </form>

                {onAllerInscription && (
                    <button className="btn btn-link w-100 mt-2" onClick={onAllerInscription}>
                        Pas encore de compte ? S'inscrire
                    </button>
                )}

                {/* Credits */}
                <div style={{
                    marginTop: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e9ecef',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Developpé par
                    </p>
                    <p style={{ fontSize: '0.88rem', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                        Hamrouni Ahmed Yassine
                    </p>
                    <a
                        href="https://github.com/ahmedyassinehamrouni-alt"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.8rem',
                            color: '#475569',
                            textDecoration: 'none',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.color = '#1a2535';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#475569';
                        }}
                    >
                        <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        ahmedyassinehamrouni-alt
                    </a>
                </div>

            </div>
        </div>
    );
}

export default Login;