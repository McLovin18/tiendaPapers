# 🛒 Tienda Online - Sistema Completo

## 📋 Características Principales

### 🛍️ **Sistema de E-commerce**
- ✅ Catálogo de productos con categorías (Mujer, Hombre, Niños, Bebé, Sport)
- ✅ Carrito de compras persistente
- ✅ Integración completa con PayPal
- ✅ Sistema de favoritos
- ✅ Comentarios y reseñas de productos

### 🚚 **Sistema de Delivery**
- ✅ Gestión automática de órdenes de entrega
- ✅ Asignación de repartidores por ubicación
- ✅ Seguimiento de estado en tiempo real
- ✅ Sistema de calificaciones para repartidores
- ✅ Panel administrativo completo

### 🔐 **Seguridad Avanzada**
- ✅ Autenticación con Firebase Auth
- ✅ Roles de usuario (Cliente, Delivery, Admin)
- ✅ Reglas de seguridad robustas en Firestore
- ✅ Validación y sanitización de datos
- ✅ Protección contra inyección de código

### 🌍 **Cobertura Geográfica**
- ✅ Guayaquil (Centro, Norte, Sur, Urdesa, Samborondón)
- ✅ Santa Elena (Santa Elena, La Libertad, Ballenita, Salinas)
- ✅ Cálculo automático de distancias y costos

## 🚀 **Tecnologías Utilizadas**

- **Frontend**: Next.js 15.4.3, React, TypeScript
- **Backend**: Firebase (Firestore, Auth)
- **Pagos**: PayPal Integration
- **Styling**: Bootstrap, CSS Modules
- **Seguridad**: Firebase Security Rules, Input Validation

## 📦 **Instalación y Configuración**

1. **Clonar el repositorio**
```bash
git clone https://github.com/Hectorck/onlineStore.git
cd tiendaOnline
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env.local` con:
```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu_paypal_client_id
```

4. **Configurar Firebase**
- Aplicar las reglas de `firestore-rules.txt` en Firebase Console
- Configurar autenticación por email/contraseña

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 👥 **Roles y Permisos**

### **Cliente**
- Ver productos y realizar compras
- Gestionar favoritos y perfil
- Seguir estado de pedidos
- Calificar repartidores

### **Repartidor (Delivery)**
- Ver órdenes asignadas
- Actualizar estado de entregas
- Ver historial de entregas

### **Administrador**
- Gestión completa de productos
- Asignación de órdenes a repartidores
- Estadísticas de delivery
- Panel de control completo

## 🔧 **Scripts Disponibles**

```bash
npm run dev      # Ejecutar en desarrollo
npm run build    # Construir para producción
npm run start    # Iniciar en producción
npm run lint     # Verificar código
```

## 📱 **Funcionalidades por Página**

- **/** - Página principal con productos destacados
- **/products** - Catálogo completo con filtros
- **/cart** - Carrito y proceso de pago
- **/myOrders** - Historial de pedidos del usuario
- **/favourite** - Productos favoritos
- **/admin/orders** - Panel administrativo
- **/delivery/orders** - Panel de repartidor

## 🏗️ **Estructura del Proyecto**

```
src/
├── app/
│   ├── components/     # Componentes reutilizables
│   ├── context/        # Contextos de React
│   ├── services/       # Servicios de Firebase
│   ├── utils/          # Utilidades y configuración
│   └── [páginas]/      # Páginas de la aplicación
```

## 🤝 **Contribuir**

1. Fork el proyecto
2. Crear rama para nueva característica
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT.

---

**Desarrollado con ❤️ por el equipo de desarrollo**
