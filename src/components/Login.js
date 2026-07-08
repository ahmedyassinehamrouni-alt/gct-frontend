import React, { useState } from 'react';
import api from '../api';

function Login({ onLogin, onAllerInscription, emailParDefaut }) {
    const [email, setEmail] = useState(emailParDefaut || '');
    const [motDePasse, setMotDePasse] = useState('');
    const [erreur, setErreur] = useState('');
    const [clePrivee, setClePrivee] = useState(null);
    const [userData, setUserData] = useState(null);
    const [cleCopiee, setCleCopiee] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur('');

        try {
            const reponse = await api.post('/login', {
                email,
                mot_de_passe: motDePasse
            });

            // If a private key was generated on this first login, show it before proceeding
            if (reponse.data.cle_privee) {
                setClePrivee(reponse.data.cle_privee);
                setUserData(reponse.data);
            } else {
                onLogin(reponse.data);
            }

        } catch (err) {
            setErreur('Email ou mot de passe incorrect.');
        }
    };

    const handleTelecharger = () => {
        const blob = new Blob([clePrivee], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cle_privee.pem';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopier = () => {
        navigator.clipboard.writeText(clePrivee);
        setCleCopiee(true);
    };

    const handleContinuer = () => {
        onLogin(userData);
    };

    // Screen shown only on first login for a "responsable" when a certificate is generated
    if (clePrivee) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ width: '520px' }}>
                    <div className="text-center mb-3" style={{ fontSize: '2rem' }}>🔐</div>
                    <h3 className="text-center mb-1">Clé privée générée</h3>
                    <p className="text-center auth-subtitle mb-3">
                        Votre certificat numérique a été créé. Sauvegardez votre clé privée <strong>maintenant</strong> — elle ne sera plus jamais affichée.
                    </p>

                    <div className="alert alert-warning">
                        ⚠️ Cette clé est nécessaire pour signer des documents. Si vous la perdez, vous ne pourrez plus signer.
                    </div>

                    <textarea
                        className="form-control mb-3"
                        rows={8}
                        readOnly
                        value={clePrivee}
                        style={{ fontFamily: 'monospace', fontSize: '11px' }}
                    />

                    <div className="d-flex gap-2 mb-3">
                        <button className="btn btn-success w-100" onClick={handleTelecharger}>
                            ⬇️ Télécharger (.pem)
                        </button>
                        <button className="btn btn-outline-secondary w-100" onClick={handleCopier}>
                            {cleCopiee ? '✅ Copié !' : '📋 Copier'}
                        </button>
                    </div>

                    <button className="btn btn-primary w-100" onClick={handleContinuer}>
                        J'ai sauvegardé ma clé — Continuer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h3 className="text-center mb-1">Connexion</h3>
                <p className="text-center auth-subtitle mb-4">Application GCT - Signature Électronique</p>

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
            </div>
        </div>
    );
}

export default Login;