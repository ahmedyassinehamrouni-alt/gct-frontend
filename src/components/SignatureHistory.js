import React, { useEffect, useState } from 'react';
import api from '../api';

function SignatureHistory() {
    const [signatures, setSignatures] = useState([]);

    useEffect(() => {
        api.get('/signatures').then(r => setSignatures(r.data)).catch(console.error);
    }, []);

    return (
        <div>
            <div className="page-header">
                <div className="page-title">Historique des signatures</div>
                <div className="page-subtitle">{signatures.length} signature{signatures.length !== 1 ? 's' : ''} enregistree{signatures.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="gct-card">
                <table className="doc-table">
                    <thead>
                        <tr>
                            <th>Document</th>
                            <th>Signataire</th>
                            <th>Date de signature</th>
                            <th>Verification</th>
                        </tr>
                    </thead>
                    <tbody>
                        {signatures.map(s => (
                            <tr key={s.id}>
                                <td className="doc-title-cell">{s.document_titre}</td>
                                <td className="doc-author-cell">{s.nom_signataire}</td>
                                <td className="doc-date-cell">{new Date(s.date_signature).toLocaleString('fr-FR')}</td>
                                <td>
                                    <a href={`https://gct-backend-production.up.railway.app/api/verify/${s.id}`} target="_blank" rel="noreferrer"
                                        style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                                        Verifier
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {signatures.length === 0 && (
                            <tr><td colSpan="4" className="history-empty">Aucune signature enregistree.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SignatureHistory;