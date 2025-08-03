# 🔥 CONFIGURACIÓN DE FIREBASE STORAGE - SOLUCIÓN AL ERROR DE PERMISOS

## ❌ **Error Actual:**
```
FirebaseError: Firebase Storage: User does not have permission to access 'products/100_0_1754250679671.png'. (storage/unauthorized)
```

## ✅ **Solución:**

### **PASO 1: Ve a Firebase Console**
1. Abre https://console.firebase.google.com
2. Selecciona tu proyecto
3. Ve a **Storage** (no Firestore)
4. Haz clic en la pestaña **"Rules"**

### **PASO 2: Reemplaza las reglas actuales con estas:**

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Funciones auxiliares
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && (
        request.auth.uid == "byRByEqdFOYxXOmUu9clvujvIUg1" ||
        (request.auth.token.email != null && request.auth.token.email == "hectorcobea03@gmail.com")
      );
    }
    
    function isValidImageSize() {
      return request.resource.size < 10 * 1024 * 1024; // Máximo 10MB
    }
    
    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    // Imágenes de productos
    match /products/{imageId} {
      allow read: if true; // Públicas
      allow write: if isAuthenticated() && isValidImageSize() && isValidImageType();
      allow delete: if isAdmin();
    }
    
    // Imágenes de usuarios
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write, delete: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Fallback
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### **PASO 3: Publica las reglas**
- Haz clic en **"Publicar"** o **"Publish"**

## 🚨 **IMPORTANTE:**
- Estas reglas van en **Storage → Rules** (NO en Firestore → Rules)
- Son dos servicios diferentes con reglas separadas
- Storage maneja archivos/imágenes
- Firestore maneja datos/documentos

## 🧪 **Alternativa para Desarrollo (Temporalmente Permisiva):**
Si necesitas una solución rápida para desarrollo:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## ✅ **Después de configurar:**
1. Guarda las reglas
2. Recarga la aplicación
3. Intenta subir una imagen nuevamente
4. El error debería desaparecer

---
*💡 Nota: El archivo `firestore-rules-with-inventory.txt` es para Firestore Database, no para Storage.*
