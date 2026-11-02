# Raqamli to‘y taklifnomasi + Zarhal Studio

- `/` — to‘y taklifnomasi (hero, kelin-kuyov, countdown, tafsilotlar, dastur, galereya, musiqa, to‘yxona, RSVP, ulashish)
- `/studio` — kreativ studiya sahifasi (xizmatlar, portfolio, narxlar, jarayon, FAQ, buyurtma formasi)

## Ishga tushirish
```
bun install
bun run dev      # ishlab chiqish
bun run build    # production build
bunx vitest run  # testlar
```

## Sozlash
Hamma ma’lumot `src/config/site.ts` faylida:
- `wedding` — ismlar, sana (`date` ISO formatda), manzil, `mapsUrl`, dastur, galereya suratlari.
- `wedding.musicSrc` — audio fayl (masalan, `public/music.mp3` → `"/music.mp3"`). Bo‘sh bo‘lsa yumshoq ambient ohang brauzerda yaratiladi.
- `wedding.rsvpEndpoint`, `studio.orderEndpoint` — forma endpointi (masalan Formspree). Bo‘sh bo‘lsa formalar **demo rejimda** ishlaydi va saqlanmaganini ochiq aytadi.
- `studio` — Telegram/Instagram havolalari, xizmatlar, narxlar, FAQ. Fikrlar real bo‘lmasa `demo: true` qoldiring.

Suratlarni `src/assets/` ga qo‘yib, configda import qiling.

## Joylash
Lovable’da **Publish** tugmasi orqali.

## Vercelga ko‘chirish

Vercel sozlamalari repozitoriydagi `vercel.json` orqali beriladi. Bu sayt faqat statik sahifalardan iborat emas: taklifnomani saqlash, javoblar va media uchun server ishlashi shart. `dist` ni alohida statik sayt sifatida joylashtirmang.

### 1. Yangi ma’lumotlar xizmati

Lovable Cloud’ning maxfiy server kaliti eksport qilinmaydi. Uni GitHub yoki chatga chiqarishga urinmang. Siz boshqaradigan, loyihadagi Auth, Data API va Storage mijozlariga mos yangi xizmat kerak; oddiy PostgreSQL bazasi o‘zi yetarli emas.

- `drizzle/migrations/0000_migration.sql`, `0001_migration.sql`, `0002_invites_and_extras.sql` fayllarini yangi bo‘sh bazaga ketma-ket, bir marta qo‘llang. `drizzle/schema.ts` dan yangi sxema yaratmang: u mavjud sxemani ifodalamaydi.
- `invite-media` nomli **private** saqlash bo‘limini yarating. SQL fayllari uni yaratmaydi.
- More → Database → Manage → Settings → Export data orqali mavjud ma’lumotlarni eksport qilib, yangi xizmatga ko‘chiring. Qisqa havolalar saqlanishi uchun taklifnoma `id` va `owner_code` qiymatlarini o‘zgartirmang; egalar havolasini maxfiy tuting.
- Yuklangan rasm va qo‘shiqlarni ham nomlarini o‘zgartirmasdan ko‘chiring. Ma’lumotlar eksporti media fayllari yoki hisoblarni avtomatik ko‘chirmaydi. Hisoblar alohida ko‘chiriladi; aks holda eski kirish ishlamaydi.

### 2. Vercel → Settings → Environment Variables

Quyidagi qiymatlarni **yangi xizmatdan** oling; eski `.env` dagi qiymatlarni ko‘chirib qo‘yish yetarli emas. Production va kerak bo‘lsa Preview uchun sozlang.

| Nomi | Qiymat turi |
| --- | --- |
| `VITE_SUPABASE_URL` | Yangi xizmatning ommaviy API manzili |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yangi xizmatning ommaviy kaliti |
| `SUPABASE_URL` | Shu yangi xizmatning server API manzili |
| `SUPABASE_PUBLISHABLE_KEY` | Shu yangi xizmatning ommaviy kaliti |
| `SUPABASE_SERVICE_ROLE_KEY` | Shu yangi xizmatning faqat serverda ishlatiladigan maxfiy kaliti |

Maxfiy kalit nomiga hech qachon `VITE_` qo‘shmang va uni repozitoriyga yozmang. Vercelning shifrlangan sozlamalarida saqlang. Kirish xizmati sozlamalarida Vercel manziliga qaytishga ruxsat berish ham kerak.

### 3. Qayta joylashtirish va tekshirish

- Repozitoriydagi ushbu o‘zgarishlar Vercel ulangan tarmoqqa yetib borganini tekshiring.
- Avvalgi `dist` yoki Vite uchun qo‘lda qo‘yilgan output sozlamalarini olib tashlang; `vercel.json` dagi `.vercel/output` ishlasin.
- Environment Variables kiritilgach, Vercelda **Redeploy** qiling.
- `/yaratish` orqali taklifnoma yarating, `/t/<id>` havolasini yangi oynada oching, javob yuboring va `/javoblar/<code>` da javobni tekshiring.
- Rasm va qo‘shiq yuklashni alohida tekshiring: Vercel Functions so‘rov hajmi chegarasi 4.5 MB, saytdagi 25 MB chegarasi uni oshirmaydi. Katta fayllar uchun bevosita saqlash xizmatiga yuklash alohida moslashtirilishi kerak.
- Telegram yetkazilishi Lovable boshqaradigan xizmatga ham bog‘langan; kalitlarni nusxalashning o‘zi yetmaydi. Vercelda undan foydalanish alohida moslashtirilmaguncha yetkazilish tasdiqlanmagan.

**Holat:** Vercel uchun joylashtirish sozlamalari tayyorlandi. Yangi xizmat, ma’lumot/media ko‘chirish va Vercel sozlamalariga kirish bo‘lmagani uchun to‘liq ko‘chirish hamda tashqi saytdagi sinov hali yakunlanmagan.
