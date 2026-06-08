# LOUVAI AO SENHOR - PWA Hinário Oficial

Hinário Oficial da Igreja Evangélica Reformada de Angola (IERA) com 301 hinos, agora como Progressive Web App (PWA) com suporte **offline-first**.

## 🚀 Recursos PWA

- ✅ **Instalável**: Botão "Instalar" no Google Chrome, Firefox e Edge
- ✅ **Offline-First**: Funciona completamente sem internet após primeira visita
- ✅ **App Standalone**: Interface sem barra de navegador do browser
- ✅ **Fast Search**: Índice invertido para busca instantânea de 301 hinos
- ✅ **Dark Mode**: Modo escuro automático
- ✅ **Audio Support**: Reprodução de áudio dos hinos (onde disponível)
- ✅ **Paginação**: Navegação organizada com 20 hinos por página
- ✅ **Sincronização**: Salva favoritos e orações localmente

## 📦 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `Hinario_IERA.html` | Aplicação principal (SPA) com todos os hinos |
| `manifest.json` | Configuração PWA (ícones, cores, metadata) |
| `service-worker.js` | Cache offline e sincronização |
| `README.md` | Este arquivo |

## 🔧 Setup / Instalação

### 1. Servir via HTTP (obrigatório para PWA)

PWAs **requerem HTTPS** em produção, mas em desenvolvimento pode usar HTTP local.

#### Opção A: Python (rápido)
```bash
# Python 3
python -m http.server 8000

# Ou Python 2
python -m SimpleHTTPServer 8000
```

Acesse: **http://localhost:8000/Hinario_IERA.html**

#### Opção B: Node.js (http-server)
```bash
npm install -g http-server
cd "LOUVAI AO SENHOR"
http-server -p 8000
```

#### Opção C: VS Code Live Server
- Instale extensão "Live Server"
- Click direito → "Open with Live Server"
- Acesse a URL fornecida (ex: `http://127.0.0.1:5500`)

### 2. Testar no Chrome

1. Abra em **Google Chrome**: `http://localhost:8000/Hinario_IERA.html`
2. Aguarde 3-5 segundos para service worker registrar
3. Clique no **⚙️ ícone** (canto superior direito) → **"Instalar"**
4. Ou veja o botão de instalação na omnibox

### 3. Testar Offline

1. Instale o app
2. Em DevTools (F12) → Application → Service Workers → marque **"Offline"**
3. Recarregue (Ctrl+R)
4. App continua funcionando com todos os hinos em cache

### 4. DevTools Verificação

**Chrome DevTools (F12):**

- **Application > Manifest**: Verifica `manifest.json`
- **Application > Service Workers**: Status do SW (active/waiting)
- **Application > Storage > Cache Storage**: Ver cache do app (hymns, fonts)
- **Application > Storage > Local Storage**: Favoritos e histórico do usuário
- **Network**: Offline simula rede desligada

## 📝 Dados Locais (LocalStorage)

O app salva automaticamente:

```javascript
iera_favorites   // IDs dos hinos favoritos
iera_history     // Últimos 50 hinos acessados
iera_prayers     // Pedidos de oração salvos
iera_agenda      // Eventos da igreja
iera_theme       // Tema preferido (light/dark)
```

**Limpar dados**: DevTools > Application > Local Storage > Deletar domínio

## 🎵 Adicionando Áudio aos Hinos

Para adicionar reprodução de áudio a um hino:

```javascript
// Em HYMNS_DATA, adicionar propriedade "audio" ao objeto do hino:
{
  number: 2,
  title: "OUÇO A BENIGNA VOZ",
  lyrics: "...",
  language: "Português",
  audio: "https://example.com/hino2.mp3"  // ← Adicionar aqui
}
```

O botão ▶️ aparecerá automaticamente para hinos com áudio.

**Formatos recomendados**: MP3, OGG, WAV
**Compressão**: 128 kbps (arquivo pequeno, qualidade aceitável)

## 🔍 Busca Avançada

A busca usa **índice invertido** para performance:

- **Busca por Número**: Digita número exato (`2`, `150`)
- **Busca por Título**: Qualquer palavra do título (`BENIGNA`, `VOZ`)
- **Busca por Letra**: Tokeniza e busca nas letras (`Jesus`, `Senhor`)

Exemplo: Buscar "Jesus" encontra ~100 hinos em <50ms mesmo offline.

## 📱 Ícone e Cores Personalizadas

- **Cores Primárias**: Azul marinho (#003087) + Dourado (#C9A227)
- **Ícone**: SVG com gradiente (escala 192px a 512px)
- **Theme Color**: Azul primário reflete na barra status Android

Para alterar, editar em `manifest.json`:
```json
"theme_color": "#003087",
"background_color": "#F8F7F2"
```

## 🚀 Deploy em Produção

### Pré-requisitos
- Domínio com **HTTPS** (certificado SSL/TLS válido)
- Servidor web (Apache, Nginx, Firebase Hosting, etc.)

### Passos

1. **Upload dos arquivos** para seu servidor:
   - `Hinario_IERA.html`
   - `manifest.json`
   - `service-worker.js`
   - Pasta de assets (se houver)

2. **Headers HTTP** (recomendado em `.htaccess` ou config nginx):
   ```apache
   # .htaccess (Apache)
   Header set Cache-Control "public, max-age=3600"
   Header set Service-Worker-Allowed "/"
   Header set X-Content-Type-Options "nosniff"
   ```

3. **MIME Types** (certifique-se em web server):
   - `.json` → `application/json`
   - `.js` → `application/javascript`
   - `.html` → `text/html; charset=utf-8`

4. **Testar em dispositivo real**:
   - Abra em Chrome para Android
   - Aguarde "Instalar" aparecer
   - Clique e instale na tela inicial

## 🛠️ Troubleshooting

| Problema | Solução |
|----------|---------|
| Service Worker não registra | Verificar console (F12) → errors; reiniciar server |
| "Instalar" não aparece | Aguardar 3-5s; verificar HTTPS/localhost; limpar cache |
| Offline não funciona | Cache é construído na primeira visita; aguardar carregamento completo |
| Datos não sincronizam | Verificar LocalStorage em DevTools; limpar e recarregar |
| Ícone distorcido | Verificar SVG em manifest.json; testar em `<img>` |

## 📄 Estrutura JSON de Hino

```javascript
{
  number: 2,                // Número único 1-301
  title: "OUÇO A BENIGNA VOZ",
  lyrics: "1. Ouço a benigna voz...",
  language: "Português",    // ou Kimbundu, Kikongo, Umbundu
  audio: "URL-opcional"     // Campo opcional para áudio
}
```

## 🔐 Privacidade

- ✅ **Sem servidor**: Todos os dados salvos localmente no dispositivo
- ✅ **Sem cookies**: Não rastreia usuário
- ✅ **Sem analytics**: Sem coleta de dados
- ✅ **Offline-first**: Não envia dados para internet

## 📞 Suporte

**Desenvolvido por**: António Garcia  
**Igreja**: Evangélica Reformada de Angola (IERA)  
**Versão**: 1.0 PWA  
**Última atualização**: 2026-06-08

---

**Instruções rápidas de teste:**
```bash
cd "LOUVAI AO SENHOR"
python -m http.server 8000
# Abra http://localhost:8000/Hinario_IERA.html no Chrome
# Clique em "Instalar"
# Teste offline em F12 → Network → "Offline"
```
