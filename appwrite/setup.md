# Appwrite Setup Guide

## 1. Crear proyecto en Appwrite Cloud

1. Ve a https://cloud.appwrite.io y crea una cuenta o inicia sesión.
2. Crea un nuevo proyecto (p.ej. `media-social`).
3. Copia el **Project ID** → `NEXT_PUBLIC_APPWRITE_PROJECT_ID` en `.env.local`.
4. En **Settings → API Keys**, crea una API Key con todos los permisos → `APPWRITE_API_KEY`.

---

## 2. Crear la base de datos

En **Databases**, crea una base de datos con ID exacto: `media-social`

---

## 3. Crear colecciones y atributos

### `profiles`
| Atributo | Tipo | Requerido | Default |
|---|---|---|---|
| `username` | String (255) | Sí | — |
| `display_name` | String (100) | No | — |
| `bio` | String (500) | No | — |
| `avatar_url` | String (2048) | No | — |
| `favorites_public` | Boolean | Sí | `true` |
| `username_locked` | Boolean | Sí | `false` |

**Permisos de colección:** Any read, Users write.

**Índices:**
- `username` → clave única (key) sobre atributo `username`

---

### `items`
| Atributo | Tipo | Requerido | Default |
|---|---|---|---|
| `external_id` | String (255) | Sí | — |
| `category` | String (20) | Sí | — |
| `title` | String (500) | Sí | — |
| `description` | String (5000) | No | — |
| `cover_url` | String (2048) | No | — |
| `genres` | String[] (100 c/u) | Sí | — |
| `year` | Integer | No | — |
| `external_data` | String (65535) | No | — |
| `cached_at` | String (255) | Sí | — |
| `avg_rating` | Float | Sí | `0` |
| `rating_count` | Integer | Sí | `0` |
| `comment_count` | Integer | Sí | `0` |
| `favorite_count` | Integer | Sí | `0` |

**Permisos de colección:** Any read, Users write.

**Índices:**
- `category` sobre atributo `category`
- `external_id` sobre atributos `external_id` + `category` (compuesto)

---

### `favorites`
| Atributo | Tipo | Requerido |
|---|---|---|
| `user_id` | String (255) | Sí |
| `item_id` | String (255) | Sí |

**Permisos de colección:** Users read/write.

**Índices:**
- `user_id` sobre atributo `user_id`
- `user_item` único sobre atributos `user_id` + `item_id` (unique)

---

### `comments`
| Atributo | Tipo | Requerido |
|---|---|---|
| `user_id` | String (255) | Sí |
| `item_id` | String (255) | Sí |
| `content` | String (2000) | Sí |
| `username` | String (255) | Sí |
| `avatar_url` | String (2048) | No |

**Permisos de colección:** Any read, Users write.

**Índices:**
- `item_id` sobre atributo `item_id`

---

### `comment_reports`
| Atributo | Tipo | Requerido |
|---|---|---|
| `reporter_id` | String (255) | Sí |
| `comment_id` | String (255) | Sí |
| `reason` | String (500) | No |

**Permisos de colección:** Users read/write.

**Índices:**
- `reporter_comment` único sobre atributos `reporter_id` + `comment_id` (unique)

---

### `ratings`
| Atributo | Tipo | Requerido |
|---|---|---|
| `user_id` | String (255) | Sí |
| `item_id` | String (255) | Sí |
| `score` | Integer | Sí |

**Permisos de colección:** Users read/write.

**Índices:**
- `user_item` único sobre atributos `user_id` + `item_id` (unique)

---

## 4. Configurar Google OAuth

1. En **Auth → Settings → OAuth2 Providers**, habilita **Google**.
2. Copia el **Redirect URI** que muestra Appwrite (algo como `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/[PROJECT_ID]`).
3. Ve a https://console.cloud.google.com:
   - Crea un proyecto o usa uno existente.
   - En **APIs & Services → Credentials**, crea un **OAuth 2.0 Client ID** (tipo Web).
   - En **Authorized redirect URIs**, pega el URI de Appwrite.
4. Copia **Client ID** y **Client Secret** → pégalos en Appwrite.

---

## 5. Configurar plataformas (para producción)

En **Settings → Platforms**, agrega:
- **Web** con tu dominio de producción (p.ej. `media-social.vercel.app`)
- **Web** con `localhost` para desarrollo

---

## 6. Variables de entorno finales

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<tu-project-id>
APPWRITE_API_KEY=<tu-api-key>
TMDB_API_KEY=<tu-tmdb-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
