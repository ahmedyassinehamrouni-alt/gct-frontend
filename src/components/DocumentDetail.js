import React, { useEffect, useState } from 'react';
import api from '../api';

function DocumentDetail({ documentId, user, onRetour }) {
    const [document, setDocument] = useState(null);
    const [signers, setSigners] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [afficherModal, setAfficherModal] = useState(false);
    const [clePrivee, setClePrivee] = useState('');
    const [enCours, setEnCours] = useState(false);
    const [verifications, setVerifications] = useState([]);
    const [verificationEnCours, setVerificationEnCours] = useState(false);

    const charger = async () => {
        try {
            const [docRes, signersRes] = await Promise.all([
                api.get(`/documents/${documentId}`),
                api.get(`/documents/${documentId}/signers`)
            ]);
            setDocument(docRes.data);
            setSigners(signersRes.data);
            setVerifications([]);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { charger(); }, [documentId]);

    const monTour = () => {
        if (!document) return false;
        const me = signers.find(s => s.user_id === user.id);
        if (!me || me.statut === 'signe') return false;
        if (!document.ordre_obligatoire) return true;
        return signers.filter(s => s.ordre < me.ordre).every(s => s.statut === 'signe');
    };

    const handleSigner = async () => {
        if (!clePrivee.trim()) { setMessage('Veuillez coller votre cle privee.'); setMessageType('danger'); return; }
        setEnCours(true);
        try {
            await api.post('/signatures', { document_id: document.id, user_id: user.id, nom_signataire: `${user.prenom} ${user.nom}`, role: user.role, cle_privee: clePrivee.trim() });
            setMessage('Document signe avec succes.'); setMessageType('success');
            setAfficherModal(false); setClePrivee(''); charger();
        } catch (err) {
            setMessage('Erreur de signature. Verifiez votre cle privee.'); setMessageType('danger'); setAfficherModal(false);
        } finally { setEnCours(false); }
    };

    const handleVerifier = async () => {
        setVerificationEnCours(true); setVerifications([]);
        try {
            const res = await api.get(`/signatures?document_id=${document.id}`);
            const sigs = res.data;
            if (!sigs || sigs.length === 0) { setVerifications([{ erreur: 'Aucune signature trouvee.' }]); return; }
            const results = await Promise.all(sigs.map(async sig => {
                try { const v = await api.get(`/signatures/verifier/${sig.id}`); return { ...v.data, id: sig.id }; }
                catch { return { erreur: `Erreur verification #${sig.id}`, id: sig.id }; }
            }));
            setVerifications(results);
        } catch { setVerifications([{ erreur: 'Erreur lors de la verification.' }]); }
        finally { setVerificationEnCours(false); }
    };

    const signeCount = signers.filter(s => s.statut === 'signe').length;

    if (!document) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Chargement...</div>;

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="gct-btn gct-btn-ghost gct-btn-sm" onClick={onRetour}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                    Retour
                </button>
                <div>
                    <div className="page-title">{document.titre}</div>
                    <div className="page-subtitle">Créé par {document.auteur_prenom} {document.auteur_nom} le {new Date(document.date_creation).toLocaleString('fr-FR')}</div>
                </div>
            </div>

            <div className="gct-card" style={{ maxWidth: 620 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    {document.statut === 'signe'
                        ? <span className="gct-badge gct-badge-success">signe</span>
                        : <span className="gct-badge gct-badge-warning">En attente</span>}
                    <a className="pdf-link" href={`https://gct-backend-production.up.railway.app/uploads/${document.fichier_pdf}?t=${Date.now()}`} target="_blank" rel="noreferrer">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Voir le fichier PDF
                    </a>
                </div>

                {signers.length > 0 && (
                    <div className="signing-progress">
                        <div className="signing-progress-header">
                            Signatures — {signeCount}/{signers.length}
                            {document.ordre_obligatoire && <span className="gct-badge gct-badge-muted" style={{ marginLeft: 8 }}>Ordre obligatoire</span>}
                        </div>
                        {signers.sort((a, b) => a.ordre - b.ordre).map((s, i) => {
                            const estSigne = s.statut === 'signe';
                            const estMoi = s.user_id === user.id;
                            const sonTour = !document.ordre_obligatoire || signers.filter(x => x.ordre < s.ordre).every(x => x.statut === 'signe');
                            return (
                                <div key={s.id} className={`signer-row${estSigne ? ' signed' : ''}`}>
                                    {document.ordre_obligatoire && <div className="signer-order-badge" style={{ background: estSigne ? 'var(--success)' : 'var(--text-muted)' }}>{i + 1}</div>}
                                    <span className="signer-name">{s.prenom} {s.nom}{estMoi && <span className="signer-you">(vous)</span>}</span>
                                    {estSigne
                                        ? <span className="gct-badge gct-badge-success">signe {s.date_signature ? new Date(s.date_signature).toLocaleDateString('fr-FR') : ''}</span>
                                        : sonTour ? <span className="gct-badge gct-badge-warning">En attente</span>
                                        : <span className="gct-badge gct-badge-muted">En attente du precedent</span>}
                                </div>
                            );
                        })}
                    </div>
                )}

                {message && <div className={`gct-alert gct-alert-${messageType}`}>{message}</div>}

                {verifications.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <div className="signing-progress-header" style={{ marginBottom: 8 }}>Resultats de verification</div>
                        {verifications.map((v, i) => (
                            <div key={i} className={`verify-result ${v.erreur ? 'fail' : (v.signature_valide && v.horodatage_valide ? 'ok' : 'fail')}`}>
                                {v.erreur ? <span>{v.erreur}</span> : (
                                    <>
                                        <div className="verify-result-name">{v.signature_valide && v.horodatage_valide ? 'Authentique' : 'Invalide'} — {v.signataire}</div>
                                        <div className="verify-result-meta">
                                            <span>Date : {new Date(v.date).toLocaleString('fr-FR')}</span>
                                            <span>RSA : <strong>{v.signature_valide ? 'Valide' : 'Invalide'}</strong></span>
                                            <span>Horodatage : <strong>{v.horodatage_valide ? 'Valide' : 'Invalide'}</strong></span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {user.role === 'responsable' && monTour() && (
                        <button className="gct-btn gct-btn-success" onClick={() => setAfficherModal(true)}>Signer ce document</button>
                    )}
                    {document.statut === 'signe' && (
                        <button className="gct-btn gct-btn-ghost" onClick={handleVerifier} disabled={verificationEnCours}>
                            {verificationEnCours ? 'Verification...' : 'Verifier les signatures'}
                        </button>
                    )}
                </div>
            </div>

            {afficherModal && (
                <div className="gct-modal-overlay">
                    <div className="gct-modal">
                        <div className="gct-modal-title">Confirmer la signature</div>
                        <div className="gct-modal-sub">Collez votre cle privee PEM pour signer <strong>{document.titre}</strong>.</div>
                        <textarea className="gct-input gct-textarea" rows={8} style={{ fontFamily: 'monospace', fontSize: 11, minHeight: 160 }}
                            placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                            value={clePrivee} onChange={e => setClePrivee(e.target.value)} />
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                            <button className="gct-btn gct-btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSigner} disabled={enCours}>
                                {enCours ? 'Signature en cours...' : 'Confirmer'}
                            </button>
                            <button className="gct-btn gct-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setAfficherModal(false); setClePrivee(''); }} disabled={enCours}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentDetail;