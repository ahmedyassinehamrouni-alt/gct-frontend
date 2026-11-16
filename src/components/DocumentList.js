import React, { useEffect, useState } from 'react';
import api from '../api';

const PAR_PAGE = 5;

const IconSort = () => (
    <svg className="sort-ico" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="8 9 12 5 16 9" /><polyline points="8 15 12 19 16 15" />
    </svg>
);

function BadgeStatut({ statut }) {
    if (statut === 'signe') {
        return (
            <span className="gct-badge gct-badge-success">
                <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" /><polyline points="7.5 12.5 10.5 15.5 16.5 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Signé
            </span>
        );
    }
    if (statut === 'refuse') {
        return (
            <span className="gct-badge gct-badge-danger">
                <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
                Refusé
            </span>
        );
    }
    return (
        <span className="gct-badge gct-badge-warning">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" /><polyline points="12 7 12 12 15.5 14" /></svg>
            En attente
        </span>
    );
}

function pagesAffichees(courante, total) {
    if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, total, courante - 1, courante, courante + 1]);
    if (courante <= 3) { set.add(2); set.add(3); set.add(4); }
    if (courante >= total - 2) { set.add(total - 1); set.add(total - 2); set.add(total - 3); }
    const liste = [...set].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
    const res = [];
    liste.forEach((n, i) => { if (i > 0 && n - liste[i - 1] > 1) res.push('...' + n); res.push(n); });
    return res;
}

function DocumentList({ user, onVoirDocument, onNouveauDocument }) {
    const [tri, setTri] = useState({ champ: 'date_creation', sens: 'desc' });
    const [pageCourante, setPageCourante] = useState(1);
    const [menuOuvert, setMenuOuvert] = useState(null);
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
            const params = { recherche, role_app: user.role_app, departement: user.departement || '' };
            if (filtre === 'waiting_on_me' || filtre === 'created_by_me') {
                params.filtre = filtre;
            }
            params.user_id = user.id;
            if (auteurId) params.auteur_id = auteurId;
            if (dateDebut) params.date_debut = dateDebut;
            if (dateFin) params.date_fin = dateFin;
            const reponse = await api.get('/documents', { params });
            setDocuments(reponse.data);
            setSelection([]);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { chargerDocuments(); setPageCourante(1); }, [recherche, filtre, auteurId, dateDebut, dateFin]);

    useEffect(() => {
        const fermer = () => setMenuOuvert(null);
        document.addEventListener('click', fermer);
        return () => document.removeEventListener('click', fermer);
    }, []);

    const changerTri = (champ) => setTri(t => t.champ === champ ? { champ, sens: t.sens === 'asc' ? 'desc' : 'asc' } : { champ, sens: 'asc' });

    const valeurTri = (d, champ) => {
        if (champ === 'titre') return (d.titre || '').toLowerCase();
        if (champ === 'auteur') return `${d.auteur_prenom || ''} ${d.auteur_nom || ''}`.toLowerCase();
        if (champ === 'statut') return d.statut || '';
        return new Date(d.date_creation).getTime();
    };
    const documentsTries = [...documents].sort((a, b) => {
        const va = valeurTri(a, tri.champ), vb = valeurTri(b, tri.champ);
        const r = va < vb ? -1 : va > vb ? 1 : 0;
        return tri.sens === 'asc' ? r : -r;
    });
    const totalPages = Math.max(1, Math.ceil(documentsTries.length / PAR_PAGE));
    const pageSafe = Math.min(pageCourante, totalPages);
    const debut = (pageSafe - 1) * PAR_PAGE;
    const documentsPage = documentsTries.slice(debut, debut + PAR_PAGE);

    const enteteTri = (champ, libelle) => (
        <th className={`sortable${tri.champ === champ ? ' sorted' : ''}`} onClick={() => changerTri(champ)}>
            {libelle}<IconSort />
        </th>
    );

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
                <div>
                    <div className="page-title">Documents</div>
                    <div className="page-subtitle">Liste de tous les documents soumis dans le système</div>
                </div>
                <button className="gct-btn gct-btn-primary gct-btn-new" onClick={onNouveauDocument}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Nouveau document
                </button>
            </div>

            <div className="gct-card">
                <div className="gct-search">
                    <svg className="gct-search-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
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
                        <button className={`doc-filter-tab${filtre === 'created_by_me' ? ' active' : ''}`} onClick={() => setFiltre('created_by_me')}>Créés par moi</button>
                        <button className={`doc-filter-tab${filtre === 'waiting_on_me' ? ' active' : ''}`} onClick={() => setFiltre('waiting_on_me')}>En attente pour moi</button>
                    </div>

                    <div className="doc-filter-row">
                        <div className="doc-filter-field">
                            <label htmlFor="f-auteur">Auteur</label>
                            <select id="f-auteur" className="gct-input" value={auteurId} onChange={e => setAuteurId(e.target.value)}>
                                <option value="">Tous les auteurs</option>
                                {auteurs.map(a => <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>)}
                            </select>
                        </div>
                        <div className="doc-filter-field">
                            <label htmlFor="f-du">Du</label>
                            <input id="f-du" className="gct-input" type="date" lang="fr" required value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
                        </div>
                        <div className="doc-filter-field">
                            <label htmlFor="f-au">Au</label>
                            <input id="f-au" className="gct-input" type="date" lang="fr" required value={dateFin} onChange={e => setDateFin(e.target.value)} />
                        </div>
                        <button className="gct-btn gct-btn-outline" onClick={resetFiltres}>Réinitialiser</button>
                    </div>
                </div>

                {filtre === 'waiting_on_me' && selection.length > 0 && (
                    <div className="bulk-signature-bar">
                        <span>{selection.length} document(s) sélectionné(s)</span>
                        <button className="gct-btn gct-btn-success gct-btn-sm" onClick={() => setAfficherModalBulk(true)}>Signer la sélection</button>
                    </div>
                )}

                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead>
                            <tr>
                                {filtre === 'waiting_on_me' && (
                                    <th style={{ width: '36px' }}>
                                        <input type="checkbox" aria-label="Tout sélectionner" checked={documents.length > 0 && selection.length === documents.length} onChange={toggleToutSelectionner} />
                                    </th>
                                )}
                                {enteteTri('titre', 'Titre')}
                                {enteteTri('auteur', 'Auteur')}
                                {enteteTri('date_creation', 'Date de création')}
                                {enteteTri('statut', 'Statut')}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documentsPage.map(doc => (
                                <tr key={doc.id} onClick={() => onVoirDocument(doc.id)}>
                                    {filtre === 'waiting_on_me' && (
                                        <td onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" checked={selection.includes(doc.id)} onChange={e => toggleSelection(doc.id, e)} />
                                        </td>
                                    )}
                                    <td className="doc-title-cell">{doc.titre}</td>
                                    <td className="doc-author-cell">
                                        {doc.auteur_prenom} {doc.auteur_nom}
                                        {(doc.auteur_poste || doc.auteur_departement) && (
                                            <div className="doc-author-meta">{[doc.auteur_poste, doc.auteur_departement].filter(Boolean).join(', ')}</div>
                                        )}
                                    </td>
                                    <td className="doc-date-cell">{new Date(doc.date_creation).toLocaleDateString('fr-FR')}</td>
                                    <td><BadgeStatut statut={doc.statut} /></td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <div className="doc-actions">
                                            <button className="gct-btn gct-btn-ghost gct-btn-sm" onClick={() => onVoirDocument(doc.id)}>Consulter</button>
                                            <div className="row-menu">
                                                <button className="row-menu-btn" aria-label="Plus d'actions" aria-haspopup="menu"
                                                    onClick={e => { e.stopPropagation(); setMenuOuvert(m => m === doc.id ? null : doc.id); }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" /></svg>
                                                </button>
                                                {menuOuvert === doc.id && (
                                                    <div className="dropdown-menu-gct" role="menu">
                                                        <button role="menuitem" onClick={() => onVoirDocument(doc.id)}>Consulter</button>
                                                        <button role="menuitem" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(doc.titre); setMenuOuvert(null); }}>Copier le titre</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {documents.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="history-empty">
                                        Aucun document trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-bar">
                    <div className="pagination-info">
                        {documents.length === 0
                            ? 'Aucun document'
                            : `Affichage de ${debut + 1} à ${debut + documentsPage.length} sur ${documents.length} documents`}
                    </div>
                    {totalPages > 1 && (
                        <nav className="pagination" aria-label="Pagination">
                            <button className="page-btn arrow" aria-label="Page précédente" disabled={pageSafe === 1} onClick={() => setPageCourante(pageSafe - 1)}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 6 9 12 15 18" /></svg>
                            </button>
                            {pagesAffichees(pageSafe, totalPages).map(n => typeof n === 'string'
                                ? <span key={n} style={{ color: 'var(--text-muted)' }}>…</span>
                                : <button key={n} className={`page-btn${n === pageSafe ? ' active' : ''}`} aria-current={n === pageSafe ? 'page' : undefined} onClick={() => setPageCourante(n)}>{n}</button>
                            )}
                            <button className="page-btn arrow" aria-label="Page suivante" disabled={pageSafe === totalPages} onClick={() => setPageCourante(pageSafe + 1)}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18" /></svg>
                            </button>
                        </nav>
                    )}
                </div>
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
