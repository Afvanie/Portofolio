
# Admin Panel (Supabase) — Projects, Certificates, Experiences

Admin panel React (Vite) untuk mengelola **Projects**, **Certificates**, dan **Years of Experience** di **Supabase**. Panel ini termasuk **login admin** (Supabase Auth), **route proteksi**, dan halaman **CRUD**.

## 1) Persiapan Supabase

### Buat tabel
Jalankan SQL berikut di Supabase (SQL Editor):

```sql
-- Projects
create table if not exists public.projects (
  id bigserial primary key,
  title text not null,
  description text,
  img text,
  link text,
  github text,
  features jsonb default '[]'::jsonb,
  techstack jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Certificates
create table if not exists public.certificates (
  id bigserial primary key,
  img text not null,
  created_at timestamptz default now()
);

-- Experiences
create table if not exists public.experiences (
  id bigserial primary key,
  year int not null,
  description text,
  created_at timestamptz default now()
);

-- Admin allowlist (optional)
create table if not exists public.admins (
  id uuid primary key default auth.uid(),
  email text unique
);
```

### RLS & Policies (aman tapi simpel)

```sql
-- Enable RLS
alter table public.projects enable row level security;
alter table public.certificates enable row level security;
alter table public.experiences enable row level security;
alter table public.admins enable row level security;

-- Read: public (semua orang)
create policy "public read projects" on public.projects for select using (true);
create policy "public read certificates" on public.certificates for select using (true);
create policy "public read experiences" on public.experiences for select using (true);

-- Write: hanya admin yang login & terdaftar di table admins (email cocok)
-- NOTE: Supabase Auth 'auth.email()' berfungsi setelah user login.
create policy "admin write projects" on public.projects for all
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "admin write certificates" on public.certificates for all
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "admin write experiences" on public.experiences for all
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

-- Admins table:
create policy "admins self view" on public.admins for select using (auth.uid() = id);
create policy "admins insert by self" on public.admins for insert with check (auth.uid() = id);
create policy "admins update by self" on public.admins for update using (auth.uid() = id);
```

> **Cara menambahkan admin:**
> 1. Buat user melalui **Authentication → Users** (invite email/password) atau sign up sendiri.
> 2. Setelah user ada, jalankan:
>    ```sql
>    insert into public.admins (id, email) values ('<AUTH_UID>', '<EMAIL>');
>    ```
>    Ganti `<AUTH_UID>` dengan UUID user dari halaman Auth users.

### (Opsional) Storage Bucket
Jika ingin menyimpan gambar di Supabase Storage:
- Buat bucket `profile-images` dan atur public read.
- Upload gambar sertifikat ke sana dan gunakan URL publik sebagai `img`.

## 2) Jalankan Admin Panel

```bash
# 1. copy folder ini keluar, lalu:
npm i
cp .env.example .env
# isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
npm run dev
```

Buka `http://localhost:5173`, login dengan akun admin.

## 3) Integrasi ke Website Portofolio

Di website (halaman publik), ambil data dari Supabase agar dinamis.

Contoh minimal (vanilla JS):
```html
<script type="module">
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
  const supabase = createClient('YOUR_URL', 'YOUR_ANON_KEY')

  async function renderProjects(){
    const { data } = await supabase.from('projects').select('*').order('id', {ascending:false})
    const el = document.querySelector('#projects')
    el.innerHTML = data.map(p => \`
      <div class="project">
        <img src="\${p.img || ''}" alt="" />
        <h3>\${p.title}</h3>
        <p>\${p.description||''}</p>
        <div>
          \${p.link ? `<a href="\${p.link}" target="_blank">Live</a>` : ''}
          \${p.github ? `<a href="\${p.github}" target="_blank">GitHub</a>` : ''}
        </div>
      </div>
    \`).join('')
  }
  async function renderCertificates(){
    const { data } = await supabase.from('certificates').select('*').order('id', {ascending:false})
    document.querySelector('#certificates').innerHTML = data.map(c => \`<img src="\${c.img}" alt="" />\`).join('')
  }
  async function renderExperiences(){
    const { data } = await supabase.from('experiences').select('*').order('year', {ascending:false})
    document.querySelector('#experiences').innerHTML = data.map(e => \`<li><strong>\${e.year}</strong> — \${e.description||''}</li>\`).join('')
  }
  renderProjects(); renderCertificates(); renderExperiences();
</script>
```

Letakkan elemen target di HTML:
```html
<section id="projects"></section>
<section id="certificates"></section>
<ul id="experiences"></ul>
```

## 4) Deploy
- Admin panel bisa di-deploy ke Netlify/Vercel/Cloudflare Pages (SPA).
- Pastikan **RLS** dan **policies** sudah benar sehingga hanya admin yang bisa menulis.

## 5) Catatan
- Field `features` & `techstack` adalah `jsonb`. Isi sebagai array JSON (contoh `["React","Supabase"]`).
- Jika ingin pemisahan role lebih kompleks, gunakan JWT custom claims atau Postgres roles.
- UI sengaja simple, fokus fungsional & minim dependensi.
