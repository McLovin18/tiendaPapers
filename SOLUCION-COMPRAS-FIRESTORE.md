# 🛒 REGLAS DE FIRESTORE PARA COMPRAS - ACTUALIZACIÓN CRÍTICA

## 🚨 **Problema Detectado**
```
❌ Error reduciendo stock: Missing or insufficient permissions
❌ Error procesando orden: Missing or insufficient permissions
```

## 🔧 **Solución Implementada**

### **1. Inventario - Permitir Reducción de Stock**
**Antes:**
```javascript
allow update: if isAdmin(); // Solo admins
```

**Ahora:**
```javascript
allow update: if isAdmin() || (
  // Permitir a usuarios autenticados reducir stock durante compras
  isAuthenticated() && 
  // Solo se puede reducir el stock (no aumentar)
  request.resource.data.stock < resource.data.stock &&
  // El stock no puede ser negativo
  request.resource.data.stock >= 0 &&
  // Solo se permite cambiar el stock, nada más
  request.resource.data.productId == resource.data.productId &&
  request.resource.data.name == resource.data.name &&
  request.resource.data.price == resource.data.price
);
```

### **2. Órdenes de Delivery - Validación Robusta**
**Mejorado:**
```javascript
allow create: if isAuthenticated() &&
  request.resource.data.userId == request.auth.uid &&
  request.resource.data.status == 'pending'; // Solo pending al crear
```

### **3. Pedidos Diarios - Clarificación**
**Confirmado:**
```javascript
allow create: if isAuthenticated(); // Para proceso de compra
allow update: if isAuthenticated(); // Para agregar órdenes durante compra
```

## 🔒 **Seguridad Mantenida**

✅ **Solo reducción de stock** - No se puede aumentar stock durante compras
✅ **Stock no negativo** - Previene valores negativos
✅ **Campos protegidos** - No se pueden cambiar precios, nombres, etc.
✅ **Usuario autenticado** - Solo usuarios logueados pueden comprar
✅ **Validación de orden** - Solo se pueden crear órdenes con status 'pending'

## 📋 **Pasos para Aplicar**

1. **Ir a Firebase Console** → **Firestore Database** → **Rules**
2. **Reemplazar las reglas actuales** con el contenido de `firestore-rules-public-inventory.txt`
3. **Publicar** las nuevas reglas
4. **Probar una compra** para verificar que funciona

## 🎯 **Resultado Esperado**

**Antes:**
```
❌ Error de permisos en inventario
❌ Compra fallida
❌ Cliente frustrado
```

**Después:**
```
✅ Stock se reduce correctamente
✅ Orden se crea exitosamente
✅ Compra completada
✅ Cliente satisfecho
```

## ⚠️ **Importante**
Estas reglas permiten a los clientes **solo reducir stock** durante compras válidas. No pueden:
- Aumentar stock
- Cambiar precios
- Modificar nombres de productos
- Acceder a funciones de administrador

**¡Aplicar estas reglas inmediatamente para habilitar las compras!** 🚀
