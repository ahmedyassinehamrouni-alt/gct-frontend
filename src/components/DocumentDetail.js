import React, { useEffect, useState } from 'react';
import api from '../api';

function DocumentDetail({ documentId, user, onRetour }) {
    const [document, setDocument] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [afficherModal, setAfficherModal] = useState(false);
    const [clePrivee, setClePrivee] = useState('');
    const [enCours, setEnCours] = useState(false);
    const [verification, setVerification] = useState(null);
    const [verificationEnCours, setVerificationEnCours] = useState(false);

    const chargerDocument = async () => {
        try {
            const reponse = await api.get(`/documents/${documentId}`);
            setDocument(reponse.data);
            setVerification(null);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        chargerDocument();
    }, [documentId]);

    const handleConfirmerSignature = async () => {
        if (!clePrivee.trim()) {
            setMessage('Veuillez coller votre clé privée.');
            setMessageType('danger');
            return;
        }
        setEnCours(true);
        try {
            await api.post('/signatures', {
                document_id: document.id,
                user_id: user.id,
                nom_signataire: `${user.prenom} ${user.nom}`,
                role: user.role,
                cle_privee: clePrivee.trim()
            });
            setMessage('✔ Document signé avec succès ! Le tampon a été ajouté au PDF.');
            setMessageType('success');
            setAfficherModal(false);
            setClePrivee('');
            chargerDocument();
        } catch (err) {
            console.error(err);
            setMessage('Erreur lors de la signature. Vérifiez votre clé privée.');
            setMessageType('danger');
            setAfficherModal(false);
        } finally {
            setEnCours(false);
        }
    };

    const handleVerifier = async () => {
        setVerificationEnCours(true);
        setVerification(null);
        try {
            // Get all signatures for this document
            const sigReponse = await api.get(`/signatures?document_id=${document.id}`);
            const signatures = sigReponse.data;

            if (!signatures || signatures.length === 0) {
                setVerification({ erreur: 'Aucune signature trouvée pour ce document.' });
                return;
            }

            // Verify the most recent signature using the public key stored in DB
            const derniere = signatures[signatures.length - 1];
            const verif = await api.get(`/signatures/verifier/${derniere.id}`);
            setVerification(verif.data);
        } catch (err) {
            console.error(err);
            setVerification({ erreur: 'Erreur lors de la vérification.' });
        } finally {
            setVerificationEnCours(false);
        }
    };

    if (!document) {
        return <div className="page-container">Chargement...</div>;
    }

    return (
        <div className="page-container" style={{ maxWidth: '640px' }}>
            <button className="btn btn-secondary btn-sm mb-3" onClick={onRetour}>
                ← Retour à la liste
            </button>

            <div className="card card-accent p-4">
                <h3>{document.titre}</h3>
                <p className="text-muted">
                    Créé par {document.auteur_prenom} {document.auteur_nom} le{' '}
                    {new Date(document.date_creation).toLocaleString()}
                </p>

                <p>{document.description}</p>

                <p>
                    Statut :{' '}
                    {document.statut === 'signe' ? (
                        <span className="badge bg-success">Signé</span>
                    ) : (
                        <span className="badge bg-warning text-dark">En attente</span>
                    )}
                </p>

                <a
                    className="btn btn-outline-primary mb-3"
                    href={`http://localhost:5000/uploads/${document.fichier_pdf}?t=${Date.now()}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    📄 Voir le fichier PDF
                </a>

                {message && (
                    <div className={`alert alert-${messageType}`}>{message}</div>
                )}

                <div className="d-flex gap-2 flex-wrap">
                    {user.role === 'responsable' && document.statut === 'en_attente' && (
                        <button className="btn btn-success" onClick={() => setAfficherModal(true)}>
                            ✔️ Signer ce document
                        </button>
                    )}

                    {document.statut === 'signe' && (
                        <button
                            className="btn btn-outline-info"
                            onClick={handleVerifier}
                            disabled={verificationEnCours}
                        >
                            {verificationEnCours ? 'Vérification...' : ' Vérifier la signature'}
                        </button>
                    )}
                </div>

                {verification && (
                    <div className="mt-3">
                        {verification.erreur ? (
                            <div className="alert alert-danger">{verification.erreur}</div>
                        ) : (
                            <div className={`alert ${verification.signature_valide && verification.horodatage_valide ? 'alert-success' : 'alert-danger'}`}>
                                <div className="mb-2">
                                    <strong>
                                        {verification.signature_valide && verification.horodatage_valide
                                            ? '✅ Signature authentique et valide'
                                            : '❌ Signature invalide ou falsifiée'}
                                    </strong>
                                </div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.9' }}>
                                    <div>👤 <strong>Signataire :</strong> {verification.signataire}</div>
                                    <div>📄 <strong>Document :</strong> {verification.document}</div>
                                    <div>🕐 <strong>Date :</strong> {new Date(verification.date).toLocaleString('fr-FR')}</div>
                                    <div>
                                        🔐 <strong>Signature RSA :</strong>{' '}
                                        <span className={verification.signature_valide ? 'text-success' : 'text-danger'}>
                                            {verification.signature_valide ? 'Valide ✔' : 'Invalide ✘'}
                                        </span>
                                    </div>
                                    <div>
                                        ⏱ <strong>Horodatage :</strong>{' '}
                                        <span className={verification.horodatage_valide ? 'text-success' : 'text-danger'}>
                                            {verification.horodatage_valide ? 'Valide ✔' : 'Invalide ✘'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {afficherModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '12px',
                        padding: '2rem', width: '500px', maxWidth: '90vw'
                    }}>
                        <h5 className="mb-1">🔐 Confirmer la signature</h5>
                        <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                            Collez votre clé privée (.pem) pour signer <strong>{document.titre}</strong>.
                        </p>
                        <textarea
                            className="form-control mb-3"
                            rows={8}
                            placeholder={"-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"}
                            value={clePrivee}
                            onChange={(e) => setClePrivee(e.target.value)}
                            style={{ fontFamily: 'monospace', fontSize: '11px' }}
                        />
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-success w-100"
                                onClick={handleConfirmerSignature}
                                disabled={enCours}
                            >
                                {enCours ? 'Signature en cours...' : '✔ Confirmer la signature'}
                            </button>
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => { setAfficherModal(false); setClePrivee(''); }}
                                disabled={enCours}
                            >
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