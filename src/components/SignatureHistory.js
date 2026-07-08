import React, { useEffect, useState } from 'react';
import api from '../api';

// Ce composant affiche l'historique de toutes les signatures effectuées.
function SignatureHistory() {
    const [signatures, setSignatures] = useState([]);

    useEffect(() => {
        const charger = async () => {
            try {
                const reponse = await api.get('/signatures');
                setSignatures(reponse.data);
            } catch (err) {
                console.error(err);
            }
        };
        charger();
    }, []);

    return (
        <div className="page-container">
            <h3 className="mb-3">Historique des signatures</h3>

            <table className="table">
                <thead className="table-dark">
                    <tr>
                        <th>Document</th>
                        <th>Signé par</th>
                        <th>Date de signature</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    {signatures.map((sig) => (
                        <tr key={sig.id}>
                            <td>{sig.document_titre}</td>
                            <td>{sig.nom_signataire}</td>
                            <td>{new Date(sig.date_signature).toLocaleString()}</td>
                            <td>
                                <span className="badge bg-success">{sig.statut}</span>
                            </td>
                        </tr>
                    ))}

                    {signatures.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center text-muted">
                                Aucune signature pour le moment.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default SignatureHistory;