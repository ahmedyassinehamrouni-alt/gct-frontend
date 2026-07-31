import React, { useEffect, useState } from 'react';
import api from '../api';

function DocumentList({ onVoirDocument }) {
    const [documents, setDocuments] = useState([]);
    const [recherche, setRecherche] = useState('');

    const chargerDocuments = async () => {
        try {
            const reponse = await api.get('/documents', { params: { recherche } });
            setDocuments(reponse.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { chargerDocuments(); }, [recherche]);

    return (
        <div>
            <div className="page-header">
                <div className="page-title">Documents</div>
                <div className="page-subtitle">Liste de tous les documents soumis dans le systeme</div>
            </div>

            <div className="gct-card">
                <div className="gct-search">
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

                <table className="doc-table">
                    <thead>
                        <tr>
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
                                <td className="doc-title-cell">{doc.titre}</td>
                                <td className="doc-author-cell">{doc.auteur_prenom} {doc.auteur_nom}</td>
                                <td className="doc-date-cell">{new Date(doc.date_creation).toLocaleDateString('fr-FR')}</td>
                                <td>
                                    {doc.statut === 'signe' ? (
                                        <span className="gct-badge gct-badge-success">signe</span>
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
                                <td colSpan="5" className="history-empty">
                                    Aucun document trouve.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DocumentList;