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

// Relit l'utilisateur depuis le stockage local au demarrage de l'app,
// pour eviter d'etre deconnecte a chaque rafraichissement de la page.
function chargerUtilisateurStocke() {
    try {
        const brut = localStorage.getItem('gct_user');
        return brut ? JSON.parse(brut) : null;
    } catch {
        return null;
    }
}

function App() {
    const [user, setUser] = useState(chargerUtilisateurStocke);
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

        // On ne persiste jamais la cle privee — uniquement les infos de session.
        const { cle_privee, ...userSansClePrivee } = userData;
        localStorage.setItem('gct_user', JSON.stringify(userSansClePrivee));
    };

    const handleDeconnexion = () => {
        setUser(null);
        setPage('liste');
        setClePrivee(null);
        localStorage.removeItem('gct_user');
    };

    const handleVoirDocument = (id) => { setDocumentId(id); setPage('detail'); };

    // ... reste du fichier inchangé (le if (!user), le if (clePrivee), le return final)
}

export default App;