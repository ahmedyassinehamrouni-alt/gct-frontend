import React, { useEffect, useState } from 'react';
import api from '../api';

function DocumentDetail({ documentId, user, onRetour }) {
    const [document, setDocument] = useState(null);
    const [signers, setSigners] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [afficherModal, setAfficherModal] = useState(false);
    const [clePrivee, setClePrivee] = useState('');
    const [enCours, setEnCours] = useState(false);

    const chargerDocument = async () => {
        try {
            const [docRes, signersRes] = await Promise.all([
                api.get(`/documents/${documentId}`),
                api.get(`/documents/${documentId}/signers`)
            ]);
            setDocument(docRes.data);
            setSigners(signersRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { chargerDocument(); }, [documentId]);

    const monTour = () => {
        if (!document) return false;
        const mySigner = signers.find(s => s.user_id === user.id);
        if (!mySigner || mySigner.statut === 'signe') return false;
        if (!document.ordre_obligatoire) return true;
        const precedents = signers.filter(s => s.ordre < mySigner.ordre);
        return precedents.every(s => s.statut === 'signe');
    };

    const handleConfirmerSignature = async () => {
        if (!clePrivee.trim()) { setMessage('Veuillez coller votre cle privee.'); setMessageType('danger'); return; }
        setEnCours(true);
        try {
            await api.post('/signatures', {
                document_id: document.id,
                user_id: user.id,
                nom_signataire: `${user.prenom} ${user.nom}`,
                role: user.role,
                cle_privee: clePrivee.trim()
            });
            setMessage('Document signe avec succes ! Le tampon a ete ajoute au PDF.');
            setMessageType('success');
            setAfficherModal(false);
            setClePrivee('');
            chargerDocument();
        } catch (err) {
            console.error(err);
            setMessage('Erreur lors de la signature. Verifiez votre cle privee.');
            setMessageType('danger');
            setAfficherModal(false);
        } finally { setEnCours(false); }
    };

    const signeCount = signers.filter(s => s.statut === 'signe').length;
    const totalSigners = signers.length;

    if (!document) return <div className="page-container">Chargement...</div>;

    return (
        <div className="page-container" style={{ maxWidth: '640px' }}>
            <button className="btn btn-secondary btn-sm mb-3" onClick={onRetour}>
                Retour a la liste
            </button>

            <div className="card card-accent p-4">
                <h3>{document.titre}</h3>
                <p className="text-muted">
                    Cree par {document.auteur_prenom} {document.auteur_nom} le{' '}
                    {new Date(document.date_creation).toLocaleString()}
                </p>
                <p>{document.description}</p>

                <p>
                    Statut :{' '}
                    {document.statut === 'signe' ? (
                        <span className="badge bg-success">Signe</span>
                    ) : (
                        <span className="badge bg-warning text-dark">En attente</span>
                    )}
                </p>

                <a
                    className="btn btn-outline-primary mb-3"
                    href={`https://gct-backend-production.up.railway.app/uploads/${document.fichier_pdf}?t=${Date.now()}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    Voir le fichier PDF
                </a>

                {signers.length > 0 && (
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted fw-bold">
                                Signatures : {signeCount}/{totalSigners}
                                {document.ordre_obligatoire && (
                                    <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>Ordre obligatoire</span>
                                )}
                            </small>
                        </div>
                        {signers
                            .sort((a, b) => a.ordre - b.ordre)
                            .map((s, index) => {
                                const estSigne = s.statut === 'signe';
                                const estMoi = s.user_id === user.id;
                                const precedentsSigne = !document.ordre_obligatoire || signers.filter(x => x.ordre < s.ordre).every(x => x.statut === 'signe');
                                return (
                                    <div key={s.id} className="d-flex align-items-center gap-2 mb-2 p-2"
                                        style={{ background: estSigne ? '#f0fdf4' : '#fafafa', borderRadius: '8px', border: `1px solid ${estSigne ? '#86efac' : '#e9ecef'}` }}>
                                        {document.ordre_obligatoire && (
                                            <span className="badge" style={{ background: estSigne ? '#22c55e' : '#94a3b8', minWidth: '22px' }}>
                                                {index + 1}
                                            </span>
                                        )}
                                        <span style={{ flex: 1, fontSize: '0.9rem' }}>
                                            {s.prenom} {s.nom}
                                            {estMoi && <span className="text-primary ms-1" style={{ fontSize: '0.75rem' }}>(vous)</span>}
                                        </span>
                                        {estSigne ? (
                                            <span style={{ color: '#22c55e', fontSize: '0.85rem' }}>
                                                Signe {s.date_signature ? new Date(s.date_signature).toLocaleDateString('fr-FR') : ''}
                                            </span>
                                        ) : precedentsSigne ? (
                                            <span className="badge bg-warning text-dark">En attente</span>
                                        ) : (
                                            <span className="badge bg-secondary">En attente du precedent</span>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}

                {message && <div className={`alert alert-${messageType}`}>{message}</div>}

                {user.role === 'responsable' && monTour() && (
                    <button className="btn btn-success w-100" onClick={() => setAfficherModal(true)}>
                        Signer ce document
                    </button>
                )}
            </div>

            {afficherModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '500px', maxWidth: '90vw' }}>
                        <h5 className="mb-1">Confirmer la signature</h5>
                        <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                            Collez votre cle privee (.pem) pour signer <strong>{document.titre}</strong>.
                        </p>
                        <textarea className="form-control mb-3" rows={8}
                            placeholder={"-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"}
                            value={clePrivee} onChange={e => setClePrivee(e.target.value)}
                            style={{ fontFamily: 'monospace', fontSize: '11px' }} />
                        <div className="d-flex gap-2">
                            <button className="btn btn-success w-100" onClick={handleConfirmerSignature} disabled={enCours}>
                                {enCours ? 'Signature en cours...' : 'Confirmer la signature'}
                            </button>
                            <button className="btn btn-outline-secondary w-100"
                                onClick={() => { setAfficherModal(false); setClePrivee(''); }} disabled={enCours}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentDetail;