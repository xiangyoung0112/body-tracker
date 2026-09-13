-- =======================================================
-- FitTrack 體態私人保險箱升級 SQL (Private Vault Security)
-- =======================================================

-- 1. 確保 user_id 欄位存在於資料表中
ALTER TABLE public.weight_records ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users DEFAULT auth.uid();
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users DEFAULT auth.uid();

-- 2. 將 body-photos 相片桶轉為 PRIVATE 私人桶（徹底關閉公開網址）
UPDATE storage.buckets SET public = false WHERE id = 'body-photos';

-- 3. 移除舊有的公開存取政策
DROP POLICY IF EXISTS "Allow all on weight_records" ON public.weight_records;
DROP POLICY IF EXISTS "Allow all on user_settings" ON public.user_settings;
DROP POLICY IF EXISTS "Allow all on body-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can select own records" ON public.weight_records;
DROP POLICY IF EXISTS "Authenticated users can insert own records" ON public.weight_records;
DROP POLICY IF EXISTS "Authenticated users can update own records" ON public.weight_records;
DROP POLICY IF EXISTS "Authenticated users can delete own records" ON public.weight_records;
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.user_settings;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can select photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;

-- 4. 啟用最高等級 RLS（只有登入後的 Authenticated 角色才能存取）

-- weight_records: 登入者可讀寫自己或專案中的紀錄
CREATE POLICY "Authenticated users can select own records" ON public.weight_records
FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can insert own records" ON public.weight_records
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can update own records" ON public.weight_records
FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can delete own records" ON public.weight_records
FOR DELETE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

-- user_settings: 僅限登入者讀寫設定
CREATE POLICY "Authenticated users can manage settings" ON public.user_settings
FOR ALL TO authenticated USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- storage.objects (body-photos 儲存桶):
-- 僅限登入者可上傳、讀取與刪除相片，未登入者完全無權限
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'body-photos');

CREATE POLICY "Authenticated users can select photos" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'body-photos');

CREATE POLICY "Authenticated users can delete photos" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'body-photos');
