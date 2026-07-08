import React, { useState } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import DocumentList from './components/DocumentList';
import DocumentForm from './components/DocumentForm';
import DocumentDetail from './components/DocumentDetail';
import SignatureHistory from './components/SignatureHistory';
import MonCertificat from './components/MonCertificat';

// App.js est le composant principal de l'application.
// Il décide quelle "page" afficher, en utilisant simplement un état React
// (pas de librairie de routage, pour rester simple à comprendre).
function App() {
    const [user, setUser] = useState(null);             // utilisateur connecté (null = pas connecté)
    const [page, setPage] = useState('liste');           // page actuellement affichée
    const [documentId, setDocumentId] = useState(null);  // document choisi pour la consultation

    // Appelé quand le formulaire de connexion réussit
    const handleLogin = (utilisateurConnecte) => {
        // Si le serveur a généré une nouvelle clé privée (1ère connexion du responsable),
        // on la garde dans le localStorage car elle ne sera plus jamais renvoyée après.
        if (utilisateurConnecte.cle_privee) {
            localStorage.setItem('cle_privee', utilisateurConnecte.cle_privee);
        }
        setUser(utilisateurConnecte);
        setPage('liste');
    };

    // Appelé quand on clique sur "Déconnexion"
    const handleDeconnexion = () => {
        setUser(null);
    };

    // Appelé quand on clique sur "Consulter" dans la liste des documents
    const handleVoirDocument = (id) => {
        setDocumentId(id);
        setPage('detail');
    };

    // Si personne n'est connecté, on affiche seulement la page de connexion
    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    // Une fois connecté, on affiche la barre de navigation + la page choisie
    return (
        <div>
            <Navbar user={user} onNaviguer={setPage} onDeconnexion={handleDeconnexion} />

            {page === 'liste' && <DocumentList onVoirDocument={handleVoirDocument} />}

            {page === 'creer' && (
                <DocumentForm user={user} onDocumentCree={() => setPage('liste')} />
            )}

            {page === 'detail' && (
                <DocumentDetail
                    documentId={documentId}
                    user={user}
                    onRetour={() => setPage('liste')}
                />
            )}

            {page === 'historique' && <SignatureHistory />}

            {page === 'certificat' && (
                <MonCertificat user={user} onRetour={() => setPage('liste')} />
            )}
        </div>
    );
}

export default App;