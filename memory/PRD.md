# SATMOKO STUDIO - AI Creative Platform

## Project Overview
Platform kreasi digital profesional dengan fitur AI lengkap menggunakan Gemini API.

## Tech Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Database:** Supabase (PostgreSQL)
- **AI Engine:** Google Gemini API (dengan Veo untuk video)
- **Deployment:** Vercel

## Arsitektur

### File Structure
```
/app/
├── App.tsx              # Main app component
├── index.tsx            # Entry point
├── index.css            # Global styles
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── components/
│   ├── ProfileSettings.tsx    # User profile + LOGOUT
│   ├── MemberControl.tsx      # Admin: APPROVE/DELETE member
│   ├── LoginForm.tsx          # Auth form
│   ├── ChatAssistant.tsx      # AI Chat
│   ├── ImageGenerator.tsx     # Text to Image (Gemini)
│   ├── VideoGenerator.tsx     # Image to Video (Veo)
│   ├── VideoDirector.tsx      # AI Video Director
│   ├── VoiceCloning.tsx       # Voice cloning AI
│   ├── StudioCreator.tsx      # Ad studio automation
│   ├── StoryboardToVideo.tsx  # Script to video
│   ├── AspectRatioEditor.tsx  # Image resize
│   ├── DirectChat.tsx         # P2P messaging
│   ├── TopupCenter.tsx        # Credit topup
│   ├── StorageManager.tsx     # Admin: Data management
│   ├── PriceManager.tsx       # Admin: Pricing
│   ├── SystemLogs.tsx         # Admin: Logs
│   └── ...landing components
├── lib/
│   └── api.ts           # Supabase + Gemini API integration
└── .env                 # Environment variables (TIDAK push ke GitHub)
```

### Database Tables (Supabase)
- `members` - User data, credits, status
- `topup_requests` - Topup requests pending approval
- `settings` - System settings (pricing, etc)

## Fitur Utama

### User Features
1. **AI Chat Assistant** - Chat dengan Gemini AI
2. **Image Generator** - Text to image generation
3. **Video Generator** - Image to video dengan Veo 3.1
4. **Video Director** - AI-powered video directing
5. **Voice Cloning** - Clone voice dengan AI
6. **Studio Iklan** - Automated ad creation
7. **Storyboard to Video** - Convert script to video
8. **Aspect Ratio Editor** - Resize images
9. **Direct Chat** - P2P messaging
10. **Topup Center** - Add credits
11. **Profile Settings** - Edit profile + LOGOUT button

### Admin Features
1. **Member Control** - Approve/Delete/Edit members
2. **Topup Approval** - Approve/Reject topup requests
3. **Storage Manager** - Manage data
4. **Price Manager** - Set pricing
5. **System Logs** - View logs

## Keamanan

### Best Practices Implemented
1. API keys disimpan di `.env` (tidak hardcode)
2. `.gitignore` memblokir `.env` files
3. Supabase Anon Key (public) - aman untuk frontend
4. Admin password sebaiknya dipindahkan ke sistem auth yang lebih aman

### Environment Variables
```env
VITE_GEMINI_API_1=<gemini_api_key>
VITE_GEMINI_API_2=<backup_key_optional>
VITE_GEMINI_API_3=<backup_key_optional>
VITE_DATABASE_URL=<supabase_url>
VITE_SUPABASE_ANON=<supabase_anon_key>
VITE_ADMIN_EMAILS=<admin_emails_comma_separated>
VITE_TELEGRAM_BOT_TOKEN=<telegram_bot_token>
VITE_TELEGRAM_CHAT_ID=<telegram_chat_id>
```

### Vercel Deployment
Tambahkan environment variables di:
**Vercel Dashboard → Project → Settings → Environment Variables**

## Pelajaran Penting

### 1. Gemini API Capabilities (2026)
- ✅ Text generation
- ✅ Image generation
- ✅ Video generation (Veo)
- ✅ Voice/Audio processing

### 2. Vite Configuration untuk Preview
```typescript
// vite.config.ts
server: {
  port: 3000,
  host: '0.0.0.0',
  allowedHosts: ['.emergentagent.com', 'localhost']
}
```

### 3. API Key Security
- JANGAN hardcode API key di source code
- Gunakan .env files
- Pastikan .gitignore memblokir .env
- Google akan AUTO-BLOCK API key yang terekspos di GitHub public

### 4. Supabase Integration
- Anon Key aman untuk frontend (public)
- Service Role Key JANGAN expose (backend only)
- Gunakan Row Level Security (RLS)

## Updates Log

### 28 Jan 2026
- ✅ Added LOGOUT button di ProfileSettings
- ✅ Added APPROVE/DELETE member di MemberControl
- ✅ Fixed API key security (moved to .env)
- ✅ Configured Vite allowedHosts untuk preview

## Owner
- **Project:** Satmoko Studio
- **Admin Email:** pringgosatmoko@gmail.com

---
*Dokumentasi ini dibuat untuk referensi development di masa depan*
