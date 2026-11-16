import React, { useState } from 'react';
import api from '../api';

// Ce composant affiche le formulaire d'inscription (création de compte).
// Quand l'inscription réussit, on appelle "onInscrit" pour retourner à la page de connexion.
function Signup({ onInscrit, onAllerConnexion }) {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [role, setRole] = useState('employe');
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur('');
        setMessage('');

        try {
            await api.post('/register', {
                nom,
                prenom,
                email,
                mot_de_passe: motDePasse,
                role
            });

            setMessage('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');

            // On retourne à la page de connexion après un court instant
            setTimeout(() => {
                onInscrit(email);
            }, 1200);

        } catch (err) {
            // Si le backend renvoie une erreur (ex: email déjà utilisé)
            if (err.response && err.response.data && err.response.data.message) {
                setErreur(err.response.data.message);
            } else {
                setErreur("Erreur lors de la création du compte.");
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ width: '420px' }}>
                <div className="auth-logo">✓</div>
                <h3 className="text-center mb-1">Créer un compte</h3>
                <p className="text-center auth-subtitle mb-4">Application GCT - Signature Électronique</p>

                {erreur && <div className="alert alert-danger">{erreur}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Nom</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Prénom</label>
                        <input
                            type="text"
                            className="form-control"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            required
                        />
                    </div>

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

                    <div className="mb-3">
                        <label className="form-label">Rôle</label>
                        <select
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="employe">Employé</option>
                            <option value="responsable">Responsable</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-2 mt-2">
                        S'inscrire
                    </button>
                </form>

                <button className="btn btn-link w-100" onClick={onAllerConnexion}>
                    Déjà un compte ? Se connecter
                </button>
            </div>
        </div>
    );
}

export default Signup;