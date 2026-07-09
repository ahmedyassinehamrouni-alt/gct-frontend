import React, { useState, useEffect } from 'react';
import api from '../api';

function DocumentForm({ user, onDocumentCree }) {
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [fichier, setFichier] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [responsables, setResponsables] = useState([]);
    const [signers, setSigners] = useState([]);
    const [ordreObligatoire, setOrdreObligatoire] = useState(false);

    useEffect(() => {
        api.get('/users/responsables').then(r => setResponsables(r.data)).catch(console.error);
    }, []);

    const ajouterSignataire = (r) => {
        if (signers.length >= 5) return;
        if (signers.find(s => s.user_id === r.id)) return;
        setSigners(prev => [...prev, { user_id: r.id, nom: r.nom, prenom: r.prenom, ordre: prev.length + 1 }]);
    };

    const retirerSignataire = (userId) => {
        setSigners(prev => prev.filter(s => s.user_id !== userId).map((s, i) => ({ ...s, ordre: i + 1 })));
    };

    const monterSignataire = (index) => {
        if (index === 0) return;
        const updated = [...signers];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        setSigners(updated.map((s, i) => ({ ...s, ordre: i + 1 })));
    };

    const descendreSignataire = (index) => {
        if (index === signers.length - 1) return;
        const updated = [...signers];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        setSigners(updated.map((s, i) => ({ ...s, ordre: i + 1 })));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fichier) { setMessage('Veuillez choisir un fichier PDF.'); setMessageType('danger'); return; }
        if (signers.length === 0) { setMessage('Veuillez selectionner au moins un signataire.'); setMessageType('danger'); return; }

        const formData = new FormData();
        formData.append('titre', titre);
        formData.append('description', description);
        formData.append('user_id', user.id);
        formData.append('fichier_pdf', fichier);
        formData.append('ordre_obligatoire', ordreObligatoire ? '1' : '0');
        formData.append('signers', JSON.stringify(signers));

        try {
            await api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage('Document envoye avec succes !');
            setMessageType('success');
            setTitre(''); setDescription(''); setFichier(null); setSigners([]); setOrdreObligatoire(false);
            setTimeout(() => onDocumentCree(), 1200);
        } catch (err) {
            console.error(err);
            setMessage("Erreur lors de l'envoi du document.");
            setMessageType('danger');
        }
    };

    const disponibles = responsables.filter(r => !signers.find(s => s.user_id === r.id));

    return (
        <div className="page-container" style={{ maxWidth: '600px' }}>
            <h3 className="mb-3">Creer un nouveau document</h3>
            <div className="card p-4">
                {message && <div className={`alert alert-${messageType}`}>{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Titre du document</label>
                        <input type="text" className="form-control" value={titre} onChange={e => setTitre(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description (facultatif)</label>
                        <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Fichier PDF</label>
                        <input type="file" className="form-control" accept="application/pdf" onChange={e => setFichier(e.target.files[0])} required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Signataires <span className="text-muted" style={{ fontSize: '0.85rem' }}>({signers.length}/5)</span>
                        </label>

                        {disponibles.length > 0 && (
                            <div className="mb-2" style={{ border: '1px solid #dee2e6', borderRadius: '8px', maxHeight: '160px', overflowY: 'auto', padding: '0.5rem' }}>
                                {disponibles.map(r => (
                                    <div key={r.id} className="d-flex justify-content-between align-items-center py-1 px-2">
                                        <span style={{ fontSize: '0.9rem' }}>👤 {r.prenom} {r.nom}</span>
                                        <button type="button" className="btn btn-sm btn-outline-primary"
                                            onClick={() => ajouterSignataire(r)} disabled={signers.length >= 5}
                                            style={{ fontSize: '0.75rem', padding: '2px 10px' }}>+ Ajouter</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {signers.length > 0 && (
                            <div className="mt-2">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted">Signataires selectionnes :</small>
                                    <div className="form-check form-switch mb-0">
                                        <input className="form-check-input" type="checkbox" id="ordreSwitch"
                                            checked={ordreObligatoire} onChange={e => setOrdreObligatoire(e.target.checked)} />
                                        <label className="form-check-label" htmlFor="ordreSwitch" style={{ fontSize: '0.82rem' }}>
                                            Ordre obligatoire
                                        </label>
                                    </div>
                                </div>
                                {signers.map((s, index) => (
                                    <div key={s.user_id} className="d-flex align-items-center gap-2 mb-2 p-2"
                                        style={{ background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                        {ordreObligatoire && (
                                            <span className="badge bg-primary" style={{ minWidth: '24px' }}>{index + 1}</span>
                                        )}
                                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{s.prenom} {s.nom}</span>
                                        {ordreObligatoire && (
                                            <div className="d-flex gap-1">
                                                <button type="button" className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => monterSignataire(index)} disabled={index === 0}
                                                    style={{ padding: '1px 7px', fontSize: '0.75rem' }}>▲</button>
                                                <button type="button" className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => descendreSignataire(index)} disabled={index === signers.length - 1}
                                                    style={{ padding: '1px 7px', fontSize: '0.75rem' }}>▼</button>
                                            </div>
                                        )}
                                        <button type="button" className="btn btn-sm btn-outline-danger"
                                            onClick={() => retirerSignataire(s.user_id)}
                                            style={{ padding: '1px 8px', fontSize: '0.75rem' }}>x</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Envoyer le document</button>
                </form>
            </div>
        </div>
    );
}

export default DocumentForm;