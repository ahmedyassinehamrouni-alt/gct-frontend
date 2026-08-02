import React, { useState } from 'react';
import api from '../api';
import logo from '../assets/logogct.png';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [erreur, setErreur] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErreur('');
        try {
            const reponse = await api.post('/login', { email, mot_de_passe: motDePasse });
            onLogin(reponse.data);
        } catch (err) {
            setErreur('Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <img src={logo} alt="GCT" />
                </div>

                <div className="login-title">Connexion</div>
                <div className="login-sub">APPLICATION GCT — SIGNATURE ELECTRONIQUE</div>

                {erreur && <div className="gct-alert gct-alert-danger">{erreur}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="gct-form-group">
                        <label className="gct-label">Adresse email</label>
                        <input className="gct-input" type="email" value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="employe@gct.com.tn" required />
                    </div>
                    <div className="gct-form-group">
                        <label className="gct-label">Mot de passe</label>
                        <input className="gct-input" type="password" value={motDePasse}
                            onChange={e => setMotDePasse(e.target.value)}
                            placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="gct-btn gct-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 12 }}>
                    Les comptes sont crees par un administrateur. Contactez le service informatique si besoin.
                </div>

                <hr className="login-divider" />

                <div className="login-credits">
                    <div className="login-credits-by">Developpe par</div>
                    <div className="login-credits-name">Hamrouni Ahmed Yassine</div>
                    <a href="https://github.com/ahmedyassinehamrouni-alt" target="_blank" rel="noreferrer" className="login-github">
                        <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor">
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