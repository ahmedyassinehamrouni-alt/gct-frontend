import React, { useState } from 'react';
import api from '../api';

// Ce composant affiche le formulaire pour créer un nouveau document.
// Utilisé seulement par les employés (le bouton n'apparaît que pour eux dans la Navbar).
function DocumentForm({ user, onDocumentCree }) {
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [fichier, setFichier] = useState(null);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fichier) {
            setMessage('Veuillez choisir un fichier PDF.');
            return;
        }

        // On utilise FormData car on envoie un fichier (pas juste du texte)
        const formData = new FormData();
        formData.append('titre', titre);
        formData.append('description', description);
        formData.append('user_id', user.id);
        formData.append('fichier_pdf', fichier);

        try {
            await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Document envoyé avec succès !');
            setTitre('');
            setDescription('');
            setFichier(null);

            // On retourne à la liste des documents après un court instant
            setTimeout(() => {
                onDocumentCree();
            }, 1000);

        } catch (err) {
            console.error(err);
            setMessage("Erreur lors de l'envoi du document.");
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '520px' }}>
            <h3 className="mb-3">Créer un nouveau document</h3>

            <div className="card p-4">
                {message && <div className="alert alert-info">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Titre du document</label>
                        <input
                            type="text"
                            className="form-control"
                            value={titre}
                            onChange={(e) => setTitre(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description (facultatif)</label>
                        <textarea
                            className="form-control"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Fichier PDF</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="application/pdf"
                            onChange={(e) => setFichier(e.target.files[0])}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Envoyer le document
                    </button>
                </form>
            </div>
        </div>
    );
}

export default DocumentForm;