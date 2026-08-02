import React, { useEffect, useState } from 'react';
import api from '../api';

function DocumentList({ user, onVoirDocument }) {
    const [documents, setDocuments] = useState([]);
    const [recherche, setRecherche] = useState('');
    const [filtre, setFiltre] = useState('tous');
    const [auteurId, setAuteurId] = useState('');
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [auteurs, setAuteurs] = useState([]);

    const [selection, setSelection] = useState([]);
    const [afficherModalBulk, setAfficherModalBulk] = useState(false);
    const [clePrivee, setClePrivee] = useState('');
    const [bulkEnCours, setBulkEnCours] = useState(false);
    const [bulkResultats, setBulkResultats] = useState(null);

    useEffect(() => {
        api.get('/users').then(r => setAuteurs(r.data)).catch(console.error);
    }, []);

    const chargerDocuments = async () => {
        try {
            const params = { recherche };
            if (filtre === 'waiting_on_me' || filtre === 'created_by_me') {
                params.filtre = filtre;
                params.user_id = user.id;
            }
            if (auteurId) params.auteur_id = auteurId;
            if (dateDebut) params.date_debut = dateDebut;
            if (dateFin) params.date_fin = dateFin;
            const reponse = await api.get('/documents', { params });
            setDocuments(reponse.data);
            setSelection([]);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { chargerDocuments(); }, [recherche, filtre, auteurId, dateDebut, dateFin]);

    const peutSigner = (doc) => filtre === 'waiting_on_me' && user.role === 'responsable';

    const toggleSelection = (id, e) => {
        e.stopPropagation();
        setSelection(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleToutSelectionner = () => {
        const eligibles = documents.map(d => d.id);
        setSelection(prev => prev.length === eligibles.length ? [] : eligibles);
    };

    const handleSignatureGroupee = async () => {
        if (!clePrivee.trim()) return;
        setBulkEnCours(true); setBulkResultats(null);
        try {
            const res = await api.post('/signatures/bulk', {
                document_ids: selection,
                user_id: user.id,
                nom_signataire: `${user.prenom} ${user.nom}`,
                role: user.role,
                cle_privee: clePrivee.trim()
            });
            setBulkResultats(res.data.resultats);
            setClePrivee('');
            chargerDocuments();
        } catch (err) {
            setBulkResultats([{ document_id: '-', success: false, message: 'Erreur lors de la signature groupee.' }]);
        } finally { setBulkEnCours(false); }
    };

    const fermerModalBulk = () => { setAfficherModalBulk(false); setClePrivee(''); setBulkResultats(null); };

    const resetFiltres = () => { setRecherche(''); setFiltre('tous'); setAuteurId(''); setDateDebut(''); setDateFin(''); };

    return (
        <div>
            <div className="page-header">
                <div className="page-title">Documents</div>
                <div className="page-subtitle">Liste de tous les documents soumis dans le systeme</div>
            </div>

            <div className="gct-card">
                <div className="gct-search" style={{ marginBottom: 14 }}>
                    <svg className="gct-search-icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Rechercher par titre..."
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                    />
                </div>

                <div className="doc-filters">
                    <div className="doc-filter-tabs">
                        <button className={`doc-filter-tab${filtre === 'tous' ? ' active' : ''}`} onClick={() => setFiltre('tous')}>Tous</button>
                        <button className={`doc-filter-tab${filtre === 'created_by_me' ? ' active' : ''}`} onClick={() => setFiltre('created_by_me')}>Crees par moi</button>
                        {user.role === 'responsable' && (
                            <button className={`doc-filter-tab${filtre === 'waiting_on_me' ? ' active' : ''}`} onClick={() => setFiltre('waiting_on_me')}>En attente pour moi</button>
                        )}
                    </div>

                    <div className="doc-filter-row">
                        <div className="doc-filter-field">
                            <label>Auteur</label>
                            <select className="gct-input" value={auteurId} onChange={e => setAuteurId(e.target.value)}>
                                <option value="">Tous les auteurs</option>
                                {auteurs.map(a => <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>)}
                            </select>
                        </div>
                        <div className="doc-filter-field">
                            <label>Du</label>
                            <input className="gct-input" type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
                        </div>
                        <div className="doc-filter-field">
                            <label>Au</label>
                            <input className="gct-input" type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} />
                        </div>
                        <button className="gct-btn gct-btn-ghost gct-btn-sm" style={{ alignSelf: 'flex-end' }} onClick={resetFiltres}>Reinitialiser</button>
                    </div>
                </div>

                {filtre === 'waiting_on_me' && selection.length > 0 && (
                    <div className="bulk-signature-bar">
                        <span>{selection.length} document(s) selectionne(s)</span>
                        <button className="gct-btn gct-btn-success gct-btn-sm" onClick={() => setAfficherModalBulk(true)}>Signer la selection</button>
                    </div>
                )}

                <table className="doc-table">
                    <thead>
                        <tr>
                            {filtre === 'waiting_on_me' && (
                                <th style={{ width: '36px' }}>
                                    <input type="checkbox" checked={documents.length > 0 && selection.length === documents.length} onChange={toggleToutSelectionner} />
                                </th>
                            )}
                            <th>Titre</th>
                            <th>Auteur</th>
                            <th>Date de creation</th>
                            <th>Statut</th>
                            <th style={{ width: '80px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map(doc => (
                            <tr key={doc.id} onClick={() => onVoirDocument(doc.id)}>
                                {filtre === 'waiting_on_me' && (
                                    <td onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" checked={selection.includes(doc.id)} onChange={e => toggleSelection(doc.id, e)} />
                                    </td>
                                )}
                                <td className="doc-title-cell">{doc.titre}</td>
                                <td className="doc-author-cell">{doc.auteur_prenom} {doc.auteur_nom}</td>
                                <td className="doc-date-cell">{new Date(doc.date_creation).toLocaleDateString('fr-FR')}</td>
                                <td>
                                    {doc.statut === 'signe' ? (
                                        <span className="gct-badge gct-badge-success">signe</span>
                                    ) : doc.statut === 'refuse' ? (
                                        <span className="gct-badge gct-badge-danger">refuse</span>
                                    ) : (
                                        <span className="gct-badge gct-badge-warning">En attente</span>
                                    )}
                                </td>
                                <td>
                                    <button className="gct-btn gct-btn-ghost gct-btn-sm">
                                        Consulter
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {documents.length === 0 && (
                            <tr>
                                <td colSpan="6" className="history-empty">
                                    Aucun document trouve.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {afficherModalBulk && (
                <div className="gct-modal-overlay">
                    <div className="gct-modal">
                        <div className="gct-modal-title">Signature groupee</div>
                        <div className="gct-modal-sub">Collez votre cle privee PEM pour signer les <strong>{selection.length}</strong> documents selectionnes en une fois.</div>

                        {!bulkResultats && (
                            <>
                                <textarea className="gct-input gct-textarea" rows={8} style={{ fontFamily: 'monospace', fontSize: 11, minHeight: 160 }}
                                    placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                                    value={clePrivee} onChange={e => setClePrivee(e.target.value)} />
                                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                    <button className="gct-btn gct-btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSignatureGroupee} disabled={bulkEnCours || !clePrivee.trim()}>
                                        {bulkEnCours ? 'Signature en cours...' : `Signer ${selection.length} document(s)`}
                                    </button>
                                    <button className="gct-btn gct-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={fermerModalBulk} disabled={bulkEnCours}>Annuler</button>
                                </div>
                            </>
                        )}

                        {bulkResultats && (
                            <>
                                <div className="bulk-results-list">
                                    {bulkResultats.map((r, i) => {
                                        const doc = documents.find(d => d.id === r.document_id);
                                        return (
                                            <div key={i} className={`verify-result ${r.success ? 'ok' : 'fail'}`}>
                                                <div className="verify-result-name">{r.success ? 'Signe' : 'Echec'} — {doc ? doc.titre : `Document #${r.document_id}`}</div>
                                                {!r.success && <div className="verify-result-meta"><span>{r.message}</span></div>}
                                            </div>
                                        );
                                    })}
                                </div>
                                <button className="gct-btn gct-btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={fermerModalBulk}>Fermer</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentList;
