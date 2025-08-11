import React from 'react';
import { Alert, Button } from 'react-bootstrap';

const FirebaseRulesWarning = () => {
  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/u/0/project/ropatrae-2ee37/firestore/rules', '_blank');
  };

  return (
    <Alert variant="danger" className="position-fixed" style={{
      top: '20px',
      right: '20px',
      zIndex: 9999,
      maxWidth: '400px',
      border: '3px solid #dc3545',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
    }}>
      <Alert.Heading className="h5">🚨 ACCIÓN REQUERIDA 🚨</Alert.Heading>
      <hr />
      <p className="mb-2">
        <strong>Error detectado:</strong><br />
        <code>"Missing or insufficient permissions"</code>
      </p>
      <p className="mb-3">
        <strong>Solución:</strong> Aplicar reglas de Firestore del archivo:<br />
        <code>firestore-rules-notificaciones-fix.txt</code>
      </p>
      <div className="d-grid gap-2">
        <Button variant="danger" size="sm" onClick={openFirebaseConsole}>
          🌐 Abrir Firebase Console
        </Button>
        <small className="text-muted">
          1. Copia el archivo firestore-rules-notificaciones-fix.txt<br />
          2. Pégalo en Firebase Console → Rules<br />
          3. Haz click en "Publish"
        </small>
      </div>
    </Alert>
  );
};

export default FirebaseRulesWarning;
