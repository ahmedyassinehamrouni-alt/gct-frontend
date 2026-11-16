import React, { useEffect, useState } from 'react';
import api from '../api';

// Cette page affiche le certificat numérique de l'utilisateur connecté
// (visible seulement pour un responsable, qui est le seul à en avoir un).
function MonCertificat({ user, onRetour }) {
    const [certificat, setCertificat] = useState(null);
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const charger = async () => {
            setChargement(true);
            try {
                const reponse = await api.get(`/certificat/${user.id}`);
                setCertificat(reponse.data);
            } catch (err) {
                setErreur("Aucun certificat trouvé. Connectez-vous une première fois pour en générer un.");
            } finally {
                setChargement(false);
            }
        };
        charger();
    }, [user?.id]);

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div className="page-title">Mon certificat numérique</div>
                    <div className="page-subtitle">Détails de votre certificat de signature électronique</div>
                </div>
                <button className="gct-btn gct-btn-ghost gct-btn-sm" onClick={onRetour}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Retour
                </button>
            </div>

            {chargement && (
                <div className="gct-card">
                    <div className="history-empty">Chargement du certificat...</div>
                </div>
            )}

            {!chargement && erreur && (
                <div className="gct-alert gct-alert-warning">{erreur}</div>
            )}

            {!chargement && certificat && (
                <div className="gct-card" style={{ maxWidth: 560 }}>
                    <div className="gct-card-header">Informations du titulaire</div>

                    <div className="gct-form-group">
                        <div className="gct-label">Titulaire</div>
                        <div style={{ color: 'var(--text-primary)', fontSize: 14 }}>{certificat.titulaire.CN}</div>
                    </div>
                    <div className="gct-form-group">
                        <div className="gct-label">Email</div>
                        <div style={{ color: 'var(--text-primary)', fontSize: 14 }}>
                            {certificat.titulaire.emailAddress || <span style={{ color: 'var(--text-muted)' }}>Non renseigné</span>}
                        </div>
                    </div>
                    <div className="gct-form-group">
                        <div className="gct-label">Organisation</div>
                        <div style={{ color: 'var(--text-primary)', fontSize: 14 }}>{certificat.titulaire.O}</div>
                    </div>

                    <div className="gct-card-header" style={{ marginTop: 8 }}>Validité</div>

                    <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
                        <div>
                            <div className="gct-label">Numéro de série</div>
                            <div className="cert-box" style={{ padding: '8px 12px', maxHeight: 'none' }}>
                                {certificat.numero_serie}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
                        <div style={{ flex: 1 }}>
                            <div className="gct-label">Valide depuis</div>
                            <div style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                                {new Date(certificat.valide_depuis).toLocaleDateString()}
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="gct-label">Valide jusqu'à</div>
                            <div style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                                {new Date(certificat.valide_jusqu_a).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="gct-card-header">Émetteur</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'var(--text-primary)', fontSize: 14 }}>{certificat.emetteur.CN}</span>
                        {certificat.auto_signe && (
                            <span className="gct-badge gct-badge-warning">Auto-signé</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MonCertificat;