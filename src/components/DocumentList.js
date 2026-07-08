import React, { useEffect, useState } from 'react';
import api from '../api';

// Ce composant affiche la liste de tous les documents,
// avec une barre de recherche simple par titre.
function DocumentList({ onVoirDocument }) {
    const [documents, setDocuments] = useState([]);
    const [recherche, setRecherche] = useState('');

    // Cette fonction va chercher les documents auprès du backend
    const chargerDocuments = async () => {
        try {
            const reponse = await api.get('/documents', {
                params: { recherche }
            });
            setDocuments(reponse.data);
        } catch (err) {
            console.error(err);
        }
    };

    // On charge les documents une première fois quand le composant s'affiche,
    // puis chaque fois que le texte de recherche change.
    useEffect(() => {
        chargerDocuments();
    }, [recherche]);

    return (
        <div className="page-container">
            <h3 className="mb-3">Liste des documents</h3>

            {/* Barre de recherche simple */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Rechercher un document par titre..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
            />

            <table className="table table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>Titre</th>
                        <th>Auteur</th>
                        <th>Date de création</th>
                        <th>Statut</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => (
                        <tr key={doc.id}>
                            <td>{doc.titre}</td>
                            <td>{doc.auteur_prenom} {doc.auteur_nom}</td>
                            <td>{new Date(doc.date_creation).toLocaleString()}</td>
                            <td>
                                {doc.statut === 'signe' ? (
                                    <span className="badge bg-success">Signé</span>
                                ) : (
                                    <span className="badge bg-warning text-dark">En attente</span>
                                )}
                            </td>
                            <td>
                                <button className="btn btn-sm btn-primary" onClick={() => onVoirDocument(doc.id)}>
                                    Consulter
                                </button>
                            </td>
                        </tr>
                    ))}

                    {documents.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center text-muted">
                                Aucun document trouvé.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DocumentList;