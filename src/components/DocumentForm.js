import React, { useState, useEffect } from 'react';
import api from '../api';

function DocumentForm({ user, onDocumentCree }) {
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [fichier, setFichier] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [responsables, setResponsables] = useState([]);
    const [signers, setSigners] = useState([]);
    const [ordreObligatoire, setOrdreObligatoire] = useState(false);

    useEffect(() => {
        api.get('/users/responsables').then(r => setResponsables(r.data.filter(x => x.id !== user.id))).catch(console.error);
    }, [user.id]);

    const ajouter = (r) => {
        if (signers.length >= 5 || signers.find(s => s.user_id === r.id)) return;
        setSigners(prev => [...prev, { user_id: r.id, nom: r.nom, prenom: r.prenom, ordre: prev.length + 1 }]);
    };

    const retirer = (userId) => {
        setSigners(prev => prev.filter(s => s.user_id !== userId).map((s, i) => ({ ...s, ordre: i + 1 })));
    };

    const monter = (index) => {
        if (index === 0) return;
        const u = [...signers];
        [u[index - 1], u[index]] = [u[index], u[index - 1]];
        setSigners(u.map((s, i) => ({ ...s, ordre: i + 1 })));
    };

    const descendre = (index) => {
        if (index === signers.length - 1) return;
        const u = [...signers];
        [u[index], u[index + 1]] = [u[index + 1], u[index]];
        setSigners(u.map((s, i) => ({ ...s, ordre: i + 1 })));
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
            setMessage('Document soumis avec succes.');
            setMessageType('success');
            setTitre(''); setDescription(''); setFichier(null); setSigners([]); setOrdreObligatoire(false);
            setTimeout(() => onDocumentCree(), 1500);
        } catch (err) {
            setMessage("Erreur lors de la soumission."); setMessageType('danger');
        }
    };

    const disponibles = responsables.filter(r => !signers.find(s => s.user_id === r.id));

    return (
        <div>
            <div className="page-header">
                <div className="page-title">Nouveau document</div>
                <div className="page-subtitle">Soumettre un document PDF pour signature electronique</div>
            </div>
            <div className="gct-card" style={{ maxWidth: 580 }}>
                {message && <div className={`gct-alert gct-alert-${messageType}`}>{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="gct-form-group">
                        <label className="gct-label">Titre du document</label>
                        <input className="gct-input" type="text" value={titre} onChange={e => setTitre(e.target.value)} required />
                    </div>
                    <div className="gct-form-group">
                        <label className="gct-label">Description (facultatif)</label>
                        <textarea className="gct-input gct-textarea" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="gct-form-group">
                        <label className="gct-label">Fichier PDF</label>
                        <input className="gct-input" type="file" accept="application/pdf" onChange={e => setFichier(e.target.files[0])} required />
                    </div>
                    <div className="gct-form-group">
                        <label className="gct-label">Signataires <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>({signers.length}/5)</span></label>
                        {disponibles.length > 0 && (
                            <div className="signer-list mb-2">
                                {disponibles.map(r => (
                                    <div key={r.id} className="signer-list-item">
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.prenom} {r.nom}</span>
                                        <button type="button" className="gct-btn gct-btn-ghost gct-btn-sm" onClick={() => ajouter(r)} disabled={signers.length >= 5}>+ Ajouter</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {signers.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Signataires selectionnes</span>
                                    <label className="gct-switch">
                                        <input type="checkbox" checked={ordreObligatoire} onChange={e => setOrdreObligatoire(e.target.checked)} />
                                        <div className="gct-switch-track"><div className="gct-switch-thumb"></div></div>
                                        <span className="gct-switch-label">Ordre obligatoire</span>
                                    </label>
                                </div>
                                {signers.map((s, i) => (
                                    <div key={s.user_id} className="signer-selected">
                                        {ordreObligatoire && <div className="signer-order-badge">{i + 1}</div>}
                                        <span style={{ flex: 1, fontSize: 13 }}>{s.prenom} {s.nom}</span>
                                        {ordreObligatoire && (
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button type="button" className="gct-btn gct-btn-ghost gct-btn-sm" onClick={() => monter(i)} disabled={i === 0}>▲</button>
                                                <button type="button" className="gct-btn gct-btn-ghost gct-btn-sm" onClick={() => descendre(i)} disabled={i === signers.length - 1}>▼</button>
                                            </div>
                                        )}
                                        <button type="button" className="gct-btn gct-btn-danger gct-btn-sm" onClick={() => retirer(s.user_id)}>Retirer</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="gct-btn gct-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Soumettre le document</button>
                </form>
            </div>
        </div>
    );
}

export default DocumentForm;