import React, { useState } from 'react';
import './app.css';
import Login from './components/Login';
import Signup from './components/signup';
import Navbar from './components/Navbar';
import DocumentList from './components/DocumentList';
import DocumentForm from './components/DocumentForm';
import DocumentDetail from './components/DocumentDetail';
import SignatureHistory from './components/SignatureHistory';
import MonCertificat from './components/MonCertificat';

function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('liste');
    const [documentId, setDocumentId] = useState(null);
    const [afficherInscription, setAfficherInscription] = useState(false);
    const [clePrivee, setClePrivee] = useState(null);

    const handleLogin = (userData) => {
        if (userData.cle_privee) {
            setClePrivee(userData.cle_privee);
        }
        setUser(userData);
        setPage('liste');
    };

    const handleDeconnexion = () => { setUser(null); setPage('liste'); setClePrivee(null); };

    const handleVoirDocument = (id) => { setDocumentId(id); setPage('detail'); };

    if (!user) {
        if (afficherInscription) return <Signup onInscrit={() => setAfficherInscription(false)} onAllerConnexion={() => setAfficherInscription(false)} />;
        return <Login onLogin={handleLogin} onAllerInscription={() => setAfficherInscription(true)} />;
    }

    if (clePrivee) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <svg width="40" height="40" fill="none" stroke="var(--success)" strokeWidth="1.5" viewBox="0 0 24 24">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                    </div>
                    <div className="login-title" style={{ fontSize: 18 }}>Cle privee generee</div>
                    <div className="login-sub" style={{ marginBottom: 20 }}>Sauvegardez votre cle privee maintenant — elle ne sera plus jamais affichee.</div>
                    <div className="gct-alert gct-alert-warning" style={{ marginBottom: 16, fontSize: 12 }}>
                        Cette cle est indispensable pour signer des documents. Ne la perdez pas.
                    </div>
                    <textarea readOnly value={clePrivee} rows={8} className="gct-input" style={{ fontFamily: 'monospace', fontSize: 10, marginBottom: 12 }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="gct-btn gct-btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(new Blob([clePrivee], { type: 'text/plain' }));
                            a.download = 'cle_privee.pem'; a.click();
                        }}>Telecharger (.pem)</button>
                        <button className="gct-btn gct-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setClePrivee(null)}>
                            J'ai sauvegarde ma cle
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Navbar user={user} onNaviguer={(p) => { setPage(p); }} onDeconnexion={handleDeconnexion} activePage={page} />
            <main className="main-content">
    {page === 'liste' && <DocumentList onVoirDocument={handleVoirDocument} />}
    {page === 'creer' && <DocumentForm user={user} onDocumentCree={() => setPage('liste')} />}
    {page === 'detail' && <DocumentDetail documentId={documentId} user={user} onRetour={() => setPage('liste')} />}
    {page === 'historique' && <SignatureHistory />}
    {page === 'certificat' && <MonCertificat user={user} onRetour={() => setPage('liste')} />}
</main>
        </div>
    );
}

export default App;