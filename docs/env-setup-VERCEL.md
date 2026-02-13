# Configuración de Variables de Entorno para Vercel

## 🎯 Estrategia de Entornos

### **Local Development**
- Archivo: `.env.local`
- Clerk: **TEST keys** (pk_test_, sk_test_)
- Supabase: **Producción** (misma DB con RLS)
- URL: `http://localhost:3000`

### **Production (branch: main)**
- Variables en Vercel configuradas para production
- Clerk: **LIVE keys** (pk_live_, sk_live_)
- Supabase: **Producción** (con máxima seguridad)
- URL: `https://www.biomechanics.cl` (redirige desde biomechanics.cl)

## 🔧 Configuración en Vercel

### 1. Variables para **TODAS LAS BRANCHES** (Development & Production):
```bash
# Supabase (compartido - protegido por RLS)
NEXT_PUBLIC_SUPABASE_URL=https://jbgwwdtjwagvradijzvy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Variables ESPECÍFICAS para **PRODUCTION** (branch: main):
```bash
# En Vercel: Settings > Environment Variables > Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuYmlvbWVjaGFuaWNzLmNsJA
CLERK_SECRET_KEY=sk_live_x1D3IKtl3bBVOsBJbDqkBiVzST1sM2hjPL42ymMq4A
NEXT_PUBLIC_APP_URL=https://www.biomechanics.cl
```

## ⚡ Pasos en Vercel Dashboard

1. **Ve a Settings > Environment Variables**
2. **Para cada variable:**
   - Agrega el nombre (ej: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - Agrega el valor correspondiente
   - **IMPORTANTE:** Selecciona el entorno correcto:
     - `Development` para QA/staging branches
     - `Production` para main branch
     - `Preview` si quieres que funcione en pull requests

## 🛡️ Seguridad

### **¿Por qué esta configuración es segura?**

1. **Clerk Keys Separadas:**
   - `pk_test_` / `sk_test_` → Development/QA
   - `pk_live_` / `sk_live_` → Production
   - Los usuarios de test NO pueden acceder a producción

2. **Supabase RLS (Row Level Security):**
   - Misma base de datos, diferentes permisos por usuario
   - Los datos están protegidos a nivel de base de datos
   - Clerk maneja la autenticación, Supabase valida permisos

3. **URLs Diferentes:**
   - Development: URLs temporales de Vercel
   - Production: Tu dominio oficial

## 🚨 Problema Actual

Si el componente `SignIn` de Clerk no se muestra, probablemente es porque:

1. **Vercel está usando las variables del entorno incorrecto**
2. **Las keys de Clerk no coinciden con el dominio**

### **Solución:**
1. Ve a Vercel Dashboard → tu proyecto
2. Settings → Environment Variables
3. Asegúrate de que la branch `shop-pressables` tenga las **TEST keys**
4. Redeploy la branch `shop-pressables`

## 📝 Checklist de Configuración

- [ ] Variables de Supabase configuradas en "All Environments"
- [ ] Variables de Clerk TEST configuradas en "Development"
- [ ] Variables de Clerk LIVE configuradas en "Production"
- [ ] URLs configuradas correctamente por entorno
- [ ] Redeploy después de cambiar variables
- [ ] Verificar que Clerk dashboard tiene los dominios correctos

## 🔄 Para Redeploy

Después de cambiar variables de entorno en Vercel:
1. Ve a Deployments
2. Encuentra el último deployment de tu branch
3. Click en "..." → "Redeploy"
4. O simplemente haz un push a la branch
