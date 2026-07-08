import React, { useEffect, useState } from 'react';
import api from '../api';

// Cette page affiche le certificat numérique de l'utilisateur connecté
// (visible seulement pour un responsable, qui est le seul à en avoir un).
function MonCertificat({ user, onRetour }) {
    const [certificat, setCertificat] = useState(null);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        const charger = async () => {
            try {
                const reponse = await api.get(`/certificat/${user.id}`);
                setCertificat(reponse.data);
            } catch (err) {
                setErreur("Aucun certificat trouvé. Connectez-vous une première fois pour en générer un.");
            }
        };
        charger();
    }, [user.id]);

    return (
        <div className="page-container" style={{ maxWidth: '640px' }}>
            <button className="btn btn-secondary btn-sm mb-3" onClick={onRetour}>
                ← Retour
            </button>

            <div className="card card-accent p-4">
                <h3 className="mb-3">Mon certificat numérique</h3>

                {erreur && <div className="alert alert-warning">{erreur}</div>}

                {certificat && (
                    <>
                        <p>
                            <strong>Titulaire :</strong> {certificat.titulaire.CN}<br />
                            <strong>Email :</strong> {certificat.titulaire.emailAddress}<br />
                            <strong>Organisation :</strong> {certificat.titulaire.O}
                        </p>

                        <p>
                            <strong>Numéro de série :</strong> {certificat.numero_serie}<br />
                            <strong>Valide depuis :</strong> {new Date(certificat.valide_depuis).toLocaleDateString()}<br />
                            <strong>Valide jusqu'à :</strong> {new Date(certificat.valide_jusqu_a).toLocaleDateString()}
                        </p>

                        <p>
                            <strong>Émis par :</strong> {certificat.emetteur.CN}
                            {certificat.auto_signe && (
                                <span className="badge bg-warning text-dark ms-2">Auto-signé</span>
                            )}
                        </p>


                        
                    </>
                )}
            </div>
        </div>
    );
}

export default MonCertificat;