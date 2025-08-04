# 🧪 PayPal Sandbox - Guía de Pruebas

## 🎯 Configuración Actual - MODO FLEXIBLE

Tu aplicación ahora tiene **control manual** del modo PayPal, independiente del entorno de deployment.

### ✅ Estado:
- **Modo**: Controlado por `NEXT_PUBLIC_PAYPAL_MODE`
- **Environment**: Puede funcionar en sandbox incluso en Vercel
- **Client ID**: Automático según el modo seleccionado

### 🎛️ **NUEVA VARIABLE DE CONTROL:**
```bash
NEXT_PUBLIC_PAYPAL_MODE=sandbox   # Fuerza modo sandbox
NEXT_PUBLIC_PAYPAL_MODE=live      # Fuerza modo live  
NEXT_PUBLIC_PAYPAL_MODE=auto      # Modo automático (default)
```

## 🚀 **Casos de Uso:**

### 🧪 **Probar Sandbox en Vercel:**
1. En Vercel → Settings → Environment Variables
2. Agregar: `NEXT_PUBLIC_PAYPAL_MODE=sandbox`
3. Redeploy tu aplicación
4. ¡Ahora funciona con cuentas sandbox en producción!

### 🌐 **Activar Live en Localhost:**
1. En `.env.local` cambiar: `NEXT_PUBLIC_PAYPAL_MODE=live`
2. Reiniciar servidor de desarrollo
3. Funciona con PayPal real en desarrollo local

### 🔄 **Modo Automático (Default):**
- Local → Sandbox automáticamente
- Vercel → Live automáticamente

## 🔑 Credenciales de Prueba

### 👤 Cuenta Personal (Comprador)
```
Email: sb-buyer@personal.example.com
Password: 12345678
```

### 🏢 Cuenta Business (Vendedor)
```
Email: sb-seller@business.example.com  
Password: 12345678
```

### 💳 Tarjeta de Crédito de Prueba
```
Número: 4111111111111111
CVV: 123
Fecha de Expiración: 01/2030
Nombre: Test User
```

## 🛠️ Cómo Realizar Pruebas

### Opción 1: Con Cuenta PayPal Sandbox
1. Ve al carrito y haz clic en "Pagar con PayPal"
2. Se abrirá la ventana de PayPal en modo sandbox
3. Usa las credenciales de arriba:
   - Email: `sb-buyer@personal.example.com`
   - Password: `12345678`
4. Completa el pago

### Opción 2: Con Tarjeta de Crédito
1. Ve al carrito y haz clic en "Pagar con Tarjeta"
2. Ingresa los datos de la tarjeta de prueba de arriba
3. Completa el pago

## 🔧 Herramienta de Diagnóstico

En la página del carrito verás un botón **"🔧 PayPal Debug"** en la esquina inferior derecha que te muestra:
- Estado actual (Sandbox/Production)
- Configuración activa
- Credenciales de prueba
- Enlaces útiles

## 🌐 Recursos Útiles

- **PayPal Developer Dashboard**: https://developer.paypal.com/
- **Sandbox Accounts**: https://developer.paypal.com/tools/sandbox/accounts/
- **Test Credit Cards**: https://developer.paypal.com/api/rest/sandbox/

## ⚠️ Problemas Comunes

### "Invalid Account" o errores de autenticación:
- Verifica que estés usando las credenciales exactas de arriba
- Asegúrate de estar en localhost (no en producción)
- Revisa que el Client ID de sandbox esté correcto en .env.local

### "Invalid Client ID":
- Verifica que `NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX` esté configurado
- Reinicia el servidor de desarrollo después de cambiar .env.local

### La ventana de PayPal no se abre:
- Verifica tu navegador permita pop-ups
- Intenta en modo incógnito
- Revisa la consola del navegador para errores

## 🚀 Pasar a Producción

### ✅ **Opción 1: Forzar Live (Recomendado)**
```bash
# En Vercel Environment Variables:
NEXT_PUBLIC_PAYPAL_MODE=live
```

### ✅ **Opción 2: Modo Automático**
```bash
# Sin NEXT_PUBLIC_PAYPAL_MODE (o =auto)
# Detecta automáticamente según el entorno
```

### 🧪 **Mantener Sandbox en Producción (Para Pruebas)**
```bash
# En Vercel Environment Variables:
NEXT_PUBLIC_PAYPAL_MODE=sandbox
# ¡Perfecto para probar en el dominio real!
```

## 🔧 **Variables de Entorno para Vercel:**

Agrega estas en tu dashboard de Vercel:
```bash
NEXT_PUBLIC_PAYPAL_MODE=sandbox                    # O 'live' cuando estés listo
NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX=tu_sandbox_id
NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE=tu_live_id
```