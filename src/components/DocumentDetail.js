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

    // --- Suppression du document ---
    const [afficherModalSuppression, setAfficherModalSuppression] = useState(false);
    const [suppressionEnCours, setSuppressionEnCours] = useState(false);

    // --- Refus de signature ---
    const [afficherModalRefus, setAfficherModalRefus] = useState(false);
    const [motifRefus, setMotifRefus] = useState('');
    const [refusEnCours, setRefusEnCours] = useState(false);

    // --- Commentaires / annotations ---
    const [commentaires, setCommentaires] = useState([]);
    const [nouveauCommentaire, setNouveauCommentaire] = useState('');
    const [commentaireEnCours, setCommentaireEnCours] = useState(false);

    const pdfUrl = (doc) => `https://gct-backend-production.up.railway.app/uploads/${doc.fichier_pdf}?t=${Date.now()}`;

    const charger = async () => {
        try {
            const [docRes, signersRes, commentsRes] = await Promise.all([
                api.get(`/documents/${documentId}`),
                api.get(`/documents/${documentId}/signers`),
                api.get(`/documents/${documentId}/comments`)
            ]);
            setDocument(docRes.data);
            setSigners(signersRes.data);
            setCommentaires(commentsRes.data);
            setVerifications([]);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { charger(); }, [documentId]);

    const monTour = () => {
        if (!document) return false;
        const me = signers.find(s => s.user_id === user.id);
        if (!me || me.statut === 'signe' || me.statut === 'refuse') return false;
        if (!document.ordre_obligatoire) return true;
        return signers.filter(s => s.ordre < me.ordre).every(s => s.statut === 'signe');
    };

    const handleSigner = async () => {
        if (!clePrivee.trim()) { setMessage('Veuillez coller votre cle privee.'); setMessageType('danger'); return; }
        setEnCours(true);
        try {
            await api.post('/signatures', { document_id: document.id, user_id: user.id, nom_signataire: `${user.prenom} ${user.nom}`, cle_privee: clePrivee.trim() });
            setMessage('Document signe avec succes.'); setMessageType('success');
            setAfficherModal(false); setClePrivee(''); charger();
        } catch (err) {
            setMessage('Erreur de signature. Verifiez votre cle privee.'); setMessageType('danger'); setAfficherModal(false);
        } finally { setEnCours(false); }
    };

    const handleRefuser = async () => {
        if (!motifRefus.trim()) { setMessage('Veuillez indiquer un motif de refus.'); setMessageType('danger'); return; }
        setRefusEnCours(true);
        try {
            await api.post('/signatures/refuser', { document_id: document.id, user_id: user.id, motif: motifRefus.trim() });
            setMessage('Document refuse.'); setMessageType('warning');
            setAfficherModalRefus(false); setMotifRefus(''); charger();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur lors du refus.'); setMessageType('danger'); setAfficherModalRefus(false);
        } finally { setRefusEnCours(false); }
    };

    const handleSupprimer = async () => {
        setSuppressionEnCours(true);
        try {
            await api.delete(`/documents/${document.id}`, {
                params: { user_id: user.id, role_app: user.role_app, departement: user.departement || '' }
            });
            onRetour();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur lors de la suppression.'); setMessageType('danger');
            setAfficherModalSuppression(false);
        } finally { setSuppressionEnCours(false); }
    };

    const handleAjouterCommentaire = async () => {
        if (!nouveauCommentaire.trim()) return;
        setCommentaireEnCours(true);
        try {
            await api.post(`/documents/${document.id}/comments`, {
                user_id: user.id,
                nom_auteur: `${user.prenom} ${user.nom}`,
                contenu: nouveauCommentaire.trim()
            });
            setNouveauCommentaire('');
            const res = await api.get(`/documents/${document.id}/comments`);
            setCommentaires(res.data);
        } catch (err) {
            setMessage("Erreur lors de l'ajout du commentaire."); setMessageType('danger');
        } finally { setCommentaireEnCours(false); }
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

    const construireHistorique = () => {
        if (!document) return [];
        const evenements = [];
        evenements.push({ date: document.date_creation, type: 'cree', label: `Document créé par ${document.auteur_prenom} ${document.auteur_nom}` });
        commentaires.forEach(c => evenements.push({ date: c.created_at, type: 'commentaire', label: `${c.nom_auteur} a commenté`, detail: c.contenu }));
        signers.forEach(s => {
            if (s.statut === 'signe' && s.date_signature) evenements.push({ date: s.date_signature, type: 'signe', label: `${s.prenom} ${s.nom} a signé` });
            if (s.statut === 'refuse' && s.date_refus) evenements.push({ date: s.date_refus, type: 'refuse', label: `${s.prenom} ${s.nom} a refusé`, detail: s.motif_refus });
        });
        return evenements.sort((a, b) => new Date(a.date) - new Date(b.date));
    };
    const historique = construireHistorique();

    const iconePourType = (type) => {
        if (type === 'signe') return <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
        if (type === 'refuse') return <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
        if (type === 'commentaire') return <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>;
        return <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    };
    const couleurPourType = (type) => type === 'signe' ? 'var(--success)' : type === 'refuse' ? 'var(--danger)' : type === 'commentaire' ? '#8b5cf6' : 'var(--primary, #2563eb)';

    if (!document) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Chargement...</div>;

    const peutSupprimer = document.user_id === user.id
        || user.role_app === 'admin'
        || (user.role_app === 'chef' && user.departement && user.departement === document.auteur_departement);

    const statutBadge = () => {
        if (document.statut === 'signe') return <span className="gct-badge gct-badge-success">signe</span>;
        if (document.statut === 'refuse') return <span className="gct-badge gct-badge-danger">refuse</span>;
        return <span className="gct-badge gct-badge-warning">En attente</span>;
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="gct-btn gct-btn-ghost gct-btn-sm" onClick={onRetour}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                        Retour
                    </button>
                    <div>
                        <div className="page-title">{document.titre}</div>
                        <div className="page-subtitle">
                            Créé par {document.auteur_prenom} {document.auteur_nom} le {new Date(document.date_creation).toLocaleString('fr-FR')}
                            {(document.auteur_poste || document.auteur_departement) && (
                                <span className="author-meta"> — {[document.auteur_poste, document.auteur_departement].filter(Boolean).join(', ')}</span>
                            )}
                        </div>
                    </div>
                </div>
                {peutSupprimer && (
                    <button className="gct-btn gct-btn-danger gct-btn-sm" onClick={() => setAfficherModalSuppression(true)}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Supprimer
                    </button>
                )}
            </div>

            <div className="gct-card" style={{ maxWidth: 720 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    {statutBadge()}
                    <a className="pdf-link" href={pdfUrl(document)} target="_blank" rel="noreferrer">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Ouvrir dans un nouvel onglet
                    </a>
                </div>

                {/* Aperçu du PDF intégré */}
                {document.fichier_pdf && (
                    <div className="pdf-preview-wrapper">
                        <iframe
                            src={pdfUrl(document)}
                            title={`Aperçu — ${document.titre}`}
                            className="pdf-preview-frame"
                        />
                    </div>
                )}

                {signers.length > 0 && (
                    <div className="signing-progress">
                        <div className="signing-progress-header">
                            Signatures — {signeCount}/{signers.length}
                            {document.ordre_obligatoire && <span className="gct-badge gct-badge-muted" style={{ marginLeft: 8 }}>Ordre obligatoire</span>}
                        </div>
                        {signers.sort((a, b) => a.ordre - b.ordre).map((s, i) => {
                            const estSigne = s.statut === 'signe';
                            const estRefuse = s.statut === 'refuse';
                            const estMoi = s.user_id === user.id;
                            const sonTour = !document.ordre_obligatoire || signers.filter(x => x.ordre < s.ordre).every(x => x.statut === 'signe');
                            return (
                                <div key={s.id} className={`signer-row${estSigne ? ' signed' : ''}${estRefuse ? ' refused' : ''}`}>
                                    {document.ordre_obligatoire && <div className="signer-order-badge" style={{ background: estSigne ? 'var(--success)' : estRefuse ? 'var(--danger)' : 'var(--text-muted)' }}>{i + 1}</div>}
                                    <span className="signer-name">
                                        {s.prenom} {s.nom}{estMoi && <span className="signer-you">(vous)</span>}
                                        {(s.poste || s.departement) && (
                                            <span className="signer-meta"> — {[s.poste, s.departement].filter(Boolean).join(', ')}</span>
                                        )}
                                    </span>
                                    {estSigne
                                        ? <span className="gct-badge gct-badge-success">signe {s.date_signature ? new Date(s.date_signature).toLocaleDateString('fr-FR') : ''}</span>
                                        : estRefuse ? <span className="gct-badge gct-badge-danger">refuse</span>
                                        : sonTour ? <span className="gct-badge gct-badge-warning">En attente</span>
                                        : <span className="gct-badge gct-badge-muted">En attente du precedent</span>}
                                </div>
                            );
                        })}
                        {signers.some(s => s.statut === 'refuse') && (
                            <div className="gct-alert gct-alert-danger" style={{ marginTop: 10 }}>
                                {signers.filter(s => s.statut === 'refuse').map(s => (
                                    <div key={s.id}><strong>{s.prenom} {s.nom}</strong> a refusé : {s.motif_refus}</div>
                                ))}
                            </div>
                        )}
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
                    {monTour() && (
                        <button className="gct-btn gct-btn-success" onClick={() => setAfficherModal(true)}>Signer ce document</button>
                    )}
                    {monTour() && (
                        <button className="gct-btn gct-btn-danger" onClick={() => setAfficherModalRefus(true)}>Refuser ce document</button>
                    )}
                    {document.statut === 'signe' && (
                        <button className="gct-btn gct-btn-ghost" onClick={handleVerifier} disabled={verificationEnCours}>
                            {verificationEnCours ? 'Verification...' : 'Verifier les signatures'}
                        </button>
                    )}
                </div>
            </div>

            {/* Commentaires / annotations avant signature */}
            <div className="gct-card" style={{ maxWidth: 720 }}>
                <div className="signing-progress-header" style={{ marginBottom: 12 }}>
                    Commentaires ({commentaires.length})
                </div>

                <div className="comment-list">
                    {commentaires.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Aucun commentaire pour l'instant.</div>
                    )}
                    {commentaires.map(c => (
                        <div key={c.id} className="comment-item">
                            <div className="comment-item-header">
                                <span className="comment-author">{c.nom_auteur}</span>
                                <span className="comment-date">{new Date(c.created_at).toLocaleString('fr-FR')}</span>
                            </div>
                            <div className="comment-content">{c.contenu}</div>
                        </div>
                    ))}
                </div>

                {document.statut === 'en_attente' && (
                    <div style={{ marginTop: 14 }}>
                        <textarea
                            className="gct-input gct-textarea"
                            rows={3}
                            placeholder="Ajouter une remarque avant de signer (ex: demander une correction)..."
                            value={nouveauCommentaire}
                            onChange={e => setNouveauCommentaire(e.target.value)}
                        />
                        <button
                            className="gct-btn gct-btn-ghost gct-btn-sm"
                            style={{ marginTop: 8 }}
                            onClick={handleAjouterCommentaire}
                            disabled={commentaireEnCours || !nouveauCommentaire.trim()}
                        >
                            {commentaireEnCours ? 'Envoi...' : 'Ajouter le commentaire'}
                        </button>
                    </div>
                )}
            </div>

            {/* Historique detaille du document */}
            <div className="gct-card" style={{ maxWidth: 720 }}>
                <div className="signing-progress-header" style={{ marginBottom: 12 }}>Historique détaillé</div>
                <div className="doc-timeline">
                    {historique.map((ev, i) => (
                        <div key={i} className="doc-timeline-item">
                            <div className="doc-timeline-dot" style={{ background: couleurPourType(ev.type) }}>{iconePourType(ev.type)}</div>
                            <div className="doc-timeline-content">
                                <div className="doc-timeline-label">{ev.label}</div>
                                {ev.detail && <div className="doc-timeline-detail">{ev.detail}</div>}
                                <div className="doc-timeline-date">{new Date(ev.date).toLocaleString('fr-FR')}</div>
                            </div>
                        </div>
                    ))}
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

            {afficherModalRefus && (
                <div className="gct-modal-overlay">
                    <div className="gct-modal">
                        <div className="gct-modal-title">Refuser la signature</div>
                        <div className="gct-modal-sub">Indiquez le motif du refus pour <strong>{document.titre}</strong>. L'auteur du document en sera informé.</div>
                        <textarea className="gct-input gct-textarea" rows={4}
                            placeholder="Ex : montant incorrect, document incomplet, informations manquantes..."
                            value={motifRefus} onChange={e => setMotifRefus(e.target.value)} />
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                            <button className="gct-btn gct-btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={handleRefuser} disabled={refusEnCours}>
                                {refusEnCours ? 'Envoi en cours...' : 'Confirmer le refus'}
                            </button>
                            <button className="gct-btn gct-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setAfficherModalRefus(false); setMotifRefus(''); }} disabled={refusEnCours}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}
            {afficherModalSuppression && (
                <div className="gct-modal-overlay">
                    <div className="gct-modal">
                        <div className="gct-modal-title">Supprimer ce document ?</div>
                        <div className="gct-modal-sub">
                            Cette action est <strong>irreversible</strong>. <strong>{document.titre}</strong>, ses signatures,
                            ses commentaires et le fichier PDF seront supprimes definitivement.
                        </div>
                        {signeCount > 0 && (
                            <div className="gct-alert gct-alert-danger" style={{ fontSize: 12 }}>
                                Attention : {signeCount} signature(s) deja enregistree(s) seront perdues.
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                            <button className="gct-btn gct-btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSupprimer} disabled={suppressionEnCours}>
                                {suppressionEnCours ? 'Suppression...' : 'Oui, supprimer definitivement'}
                            </button>
                            <button className="gct-btn gct-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAfficherModalSuppression(false)} disabled={suppressionEnCours}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentDetail;
