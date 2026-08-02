import React, { useEffect, useState } from 'react';
import api from '../api';

const LABEL_ROLE = { admin: 'Administrateur', chef: 'Chef de service', agent: 'Agent' };

// Liste fixe des departements GCT — a adapter si besoin, mais garder cette liste
// synchronisee avec DEPARTEMENTS_VALIDES dans backend/routes/adminRoutes.js
export const DEPARTEMENTS = [
    'Production',
    'Maintenance',
    'Informatique',
    'Ressources Humaines',
    'Finance & Comptabilite',
    'Qualite, Securite & Environnement',
    'Achats & Logistique',
    'Laboratoire & R&D',
    'Direction Generale',
];

function AdminUsers({ user }) {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [afficherFormCreation, setAfficherFormCreation] = useState(false);

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [poste, setPoste] = useState('');
    const [departement, setDepartement] = useState('');
    const [roleApp, setRoleApp] = useState('agent');
    const [creationEnCours, setCreationEnCours] = useState(false);

    const [editId, setEditId] = useState(null);
    const [editPoste, setEditPoste] = useState('');
    const [editDepartement, setEditDepartement] = useState('');
    const [editRoleApp, setEditRoleApp] = useState('agent');

    const charger = async () => {
        try {
            const res = await api.get('/admin/users', { params: { role_app: user.role_app } });
            setUsers(res.data);
        } catch (err) {
            setMessage("Impossible de charger la liste des comptes."); setMessageType('danger');
        }
    };

    useEffect(() => { charger(); }, []);

    const resetForm = () => { setNom(''); setPrenom(''); setEmail(''); setMotDePasse(''); setPoste(''); setDepartement(''); setRoleApp('agent'); };

    const handleCreer = async (e) => {
        e.preventDefault();
        setCreationEnCours(true); setMessage('');
        try {
            await api.post('/admin/users', {
                role_app: roleApp, nom, prenom, email, mot_de_passe: motDePasse,
                poste, departement
            }, { params: { role_app: user.role_app } });
            setMessage('Compte cree avec succes.'); setMessageType('success');
            resetForm(); setAfficherFormCreation(false); charger();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur lors de la creation du compte.'); setMessageType('danger');
        } finally { setCreationEnCours(false); }
    };

    const commencerEdition = (u) => {
        setEditId(u.id); setEditPoste(u.poste || ''); setEditDepartement(u.departement || ''); setEditRoleApp(u.role_app);
    };

    const EnregisterEdition = async (id) => {
        try {
            await api.put(`/admin/users/${id}`, {
                poste: editPoste, departement: editDepartement, role_app: editRoleApp
            }, { params: { role_app: user.role_app } });
            setEditId(null); charger();
        } catch (err) {
            setMessage(err.response?.data?.message || "Erreur lors de la mise a jour."); setMessageType('danger');
        }
    };

    const toggleActif = async (u) => {
        try {
            await api.put(`/admin/users/${u.id}`, { actif: u.actif ? 0 : 1 }, { params: { role_app: user.role_app } });
            charger();
        } catch (err) {
            setMessage("Erreur lors du changement de statut."); setMessageType('danger');
        }
    };

    const reinitialiserMotDePasse = async (u) => {
        const nouveau = window.prompt(`Nouveau mot de passe pour ${u.prenom} ${u.nom} :`);
        if (!nouveau) return;
        try {
            await api.put(`/admin/users/${u.id}/password`, { nouveau_mot_de_passe: nouveau }, { params: { role_app: user.role_app } });
            setMessage('Mot de passe reinitialise.'); setMessageType('success');
        } catch (err) {
            setMessage(err.response?.data?.message || "Erreur lors de la reinitialisation."); setMessageType('danger');
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="page-title">Administration</div>
                    <div className="page-subtitle">Gestion des comptes, postes, departements et droits</div>
                </div>
                <button className="gct-btn gct-btn-primary" onClick={() => setAfficherFormCreation(v => !v)}>
                    {afficherFormCreation ? 'Fermer' : '+ Creer un compte'}
                </button>
            </div>

            {message && <div className={`gct-alert gct-alert-${messageType}`} style={{ maxWidth: 720 }}>{message}</div>}

            {afficherFormCreation && (
                <div className="gct-card" style={{ maxWidth: 640 }}>
                    <form onSubmit={handleCreer}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div className="gct-form-group" style={{ flex: 1 }}>
                                <label className="gct-label">Prenom</label>
                                <input className="gct-input" value={prenom} onChange={e => setPrenom(e.target.value)} required />
                            </div>
                            <div className="gct-form-group" style={{ flex: 1 }}>
                                <label className="gct-label">Nom</label>
                                <input className="gct-input" value={nom} onChange={e => setNom(e.target.value)} required />
                            </div>
                        </div>
                        <div className="gct-form-group">
                            <label className="gct-label">Email</label>
                            <input className="gct-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="gct-form-group">
                            <label className="gct-label">Mot de passe initial</label>
                            <input className="gct-input" type="text" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} required />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div className="gct-form-group" style={{ flex: 1 }}>
                                <label className="gct-label">Poste</label>
                                <input className="gct-input" placeholder="Ex: Ingenieur informatique" value={poste} onChange={e => setPoste(e.target.value)} />
                            </div>
                            <div className="gct-form-group" style={{ flex: 1 }}>
                                <label className="gct-label">Departement</label>
                                <select className="gct-input" value={departement} onChange={e => setDepartement(e.target.value)} required>
                                    <option value="">Selectionner...</option>
                                    {DEPARTEMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="gct-form-group">
                            <label className="gct-label">Droits</label>
                            <select className="gct-input" value={roleApp} onChange={e => setRoleApp(e.target.value)}>
                                <option value="agent">Agent — cree/signe ses documents</option>
                                <option value="chef">Chef de service — voit tout son departement</option>
                                <option value="admin">Administrateur — gere les comptes, voit tout</option>
                            </select>
                        </div>
                        <button type="submit" className="gct-btn gct-btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={creationEnCours}>
                            {creationEnCours ? 'Creation...' : 'Creer le compte'}
                        </button>
                    </form>
                </div>
            )}

            <div className="gct-card">
                <table className="doc-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Poste</th>
                            <th>Departement</th>
                            <th>Droits</th>
                            <th>Statut</th>
                            <th style={{ width: '220px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="doc-title-cell">{u.prenom} {u.nom}{u.id === user.id && <span className="signer-you">(vous)</span>}</td>
                                <td className="doc-author-cell">{u.email}</td>
                                {editId === u.id ? (
                                    <>
                                        <td><input className="gct-input" style={{ padding: '4px 8px', fontSize: 12 }} value={editPoste} onChange={e => setEditPoste(e.target.value)} /></td>
                                        <td>
                                            <select className="gct-input" style={{ padding: '4px 8px', fontSize: 12 }} value={editDepartement} onChange={e => setEditDepartement(e.target.value)}>
                                                <option value="">—</option>
                                                {DEPARTEMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <select className="gct-input" style={{ padding: '4px 8px', fontSize: 12 }} value={editRoleApp} onChange={e => setEditRoleApp(e.target.value)}>
                                                <option value="agent">Agent</option>
                                                <option value="chef">Chef de service</option>
                                                <option value="admin">Administrateur</option>
                                            </select>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="doc-date-cell">{u.poste || '—'}</td>
                                        <td className="doc-date-cell">{u.departement || '—'}</td>
                                        <td><span className="gct-badge gct-badge-muted">{LABEL_ROLE[u.role_app] || u.role_app}</span></td>
                                    </>
                                )}
                                <td>
                                    {u.actif ? <span className="gct-badge gct-badge-success">actif</span> : <span className="gct-badge gct-badge-danger">desactive</span>}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {editId === u.id ? (
                                            <>
                                                <button className="gct-btn gct-btn-success gct-btn-sm" onClick={() => EnregisterEdition(u.id)}>Enregister</button>
                                                <button className="gct-btn gct-btn-ghost gct-btn-sm" onClick={() => setEditId(null)}>Annuler</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="gct-btn gct-btn-ghost gct-btn-sm" onClick={() => commencerEdition(u)}>Modifier</button>
                                                <button className="gct-btn gct-btn-ghost gct-btn-sm" onClick={() => reinitialiserMotDePasse(u)}>Mdp</button>
                                                {u.id !== user.id && (
                                                    <button className={`gct-btn gct-btn-sm ${u.actif ? 'gct-btn-danger' : 'gct-btn-success'}`} onClick={() => toggleActif(u)}>
                                                        {u.actif ? 'Desactiver' : 'Activer'}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr><td colSpan="7" className="history-empty">Aucun compte.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUsers;
