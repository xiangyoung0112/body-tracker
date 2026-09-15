window.SupabaseService = (() => {
  const STORAGE_KEY_URL = 'fittrack_supabase_url';
  const STORAGE_KEY_KEY = 'fittrack_supabase_key';

  const DEFAULT_URL = 'https://skwbxthrdkcdrqvzoaxy.supabase.co';
  const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrd2J4dGhyZGtjZHJxdnpvYXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDg3NTksImV4cCI6MjA5ODU4NDc1OX0.7I44Rw_MsUh-pPm0LE0NPymQy01GvxnMRjder7l7kfQ';

  function parseActivationString(str) {
    if (!str) return null;
    try {
      let clean = str.trim();
      if (clean.includes('#')) {
        clean = clean.split('#')[1];
      } else if (clean.includes('?')) {
        clean = clean.split('?')[1];
      }
      clean = clean.replace(/^[#?]/, '');
      const params = new URLSearchParams(clean);
      let vaultUrl = params.get('vault');
      let vaultKey = params.get('k');
      if (vaultUrl && vaultKey) {
        return {
          url: decodeURIComponent(vaultUrl).trim(),
          key: decodeURIComponent(vaultKey).trim()
        };
      }
    } catch (e) {
      console.warn('Failed to parse activation string:', e);
    }
    return null;
  }

  function checkUrlActivation() {
    try {
      const searchStr = window.location.hash || window.location.search;
      if (searchStr && searchStr.includes('vault=')) {
        const parsed = parseActivationString(searchStr);
        if (parsed) {
          localStorage.setItem(STORAGE_KEY_URL, parsed.url);
          localStorage.setItem(STORAGE_KEY_KEY, parsed.key);
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      }
    } catch (e) {
      console.warn('URL activation parse error:', e);
    }
  }

  checkUrlActivation();

  let client = null;
  let currentUrl = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_URL;
  let currentKey = localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_KEY;

  const signedUrlCache = new Map();

  function initClient(url, key) {
    if (url && key && window.supabase) {
      try {
        client = window.supabase.createClient(url.trim(), key.trim(), {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        currentUrl = url.trim();
        currentKey = key.trim();
        localStorage.setItem(STORAGE_KEY_URL, currentUrl);
        localStorage.setItem(STORAGE_KEY_KEY, currentKey);
        return true;
      } catch (err) {
        console.error('Supabase init error:', err);
        return false;
      }
    }
    return false;
  }

  if (currentUrl && currentKey && window.supabase) {
    initClient(currentUrl, currentKey);
  }

  return {
    isConfigured() {
      return !!client;
    },

    getClient() {
      return client;
    },

    getCredentials() {
      return { url: currentUrl, key: currentKey };
    },

    saveCredentials(url, key) {
      return initClient(url, key);
    },

    activateFromString(str) {
      const parsed = parseActivationString(str);
      if (parsed) {
        return initClient(parsed.url, parsed.key);
      }
      return false;
    },

    clearCredentials() {
      client = null;
      currentUrl = '';
      currentKey = '';
      localStorage.removeItem(STORAGE_KEY_URL);
      localStorage.removeItem(STORAGE_KEY_KEY);
      signedUrlCache.clear();
    },

    async getCurrentUser() {
      if (!client) return null;
      try {
        const { data: { user } } = await client.auth.getUser();
        return user;
      } catch (e) {
        return null;
      }
    },

    async getSession() {
      if (!client) return null;
      try {
        const { data: { session } } = await client.auth.getSession();
        return session;
      } catch (e) {
        return null;
      }
    },

    async signIn(email, password) {
      if (!client) throw new Error('雲端連線尚未設定，請先使用專屬啟動連結');
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      if (error) throw error;
      return data;
    },

    async signUp(email, password) {
      if (!client) throw new Error('雲端連線尚未設定，請先使用專屬啟動連結');
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: password.trim()
      });
      if (error) throw error;
      return data;
    },

    async signOut() {
      if (!client) return;
      signedUrlCache.clear();
      await client.auth.signOut();
    },

    onAuthStateChange(callback) {
      if (!client) return { data: { subscription: { unsubscribe: () => {} } } };
      return client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          signedUrlCache.clear();
        }
        callback(event, session);
      });
    },

    async uploadPhoto(blob) {
      if (!client) throw new Error('Supabase 尚未初始化');

      const user = await this.getCurrentUser();
      if (!user) throw new Error('請先登入專屬帳號以進行照片上傳');

      const fileName = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;

      const { data, error } = await client.storage
        .from('body-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Private upload error:', error);
        throw error;
      }

      const signedUrl = await this.getSignedPhotoUrl(fileName, 3600);

      return {
        path: fileName,
        signedUrl: signedUrl
      };
    },

    async getSignedPhotoUrl(photoPath, expiresIn = 3600) {
      if (!client || !photoPath) return null;

      const cached = signedUrlCache.get(photoPath);
      const now = Date.now();
      if (cached && cached.expiresAt > now + 300 * 1000) {
        return cached.url;
      }

      try {
        const { data, error } = await client.storage
          .from('body-photos')
          .createSignedUrl(photoPath, expiresIn);

        if (error || !data) {
          console.warn('Failed to create signed URL for:', photoPath, error);
          return null;
        }

        signedUrlCache.set(photoPath, {
          url: data.signedUrl,
          expiresAt: now + expiresIn * 1000
        });

        return data.signedUrl;
      } catch (e) {
        console.error('Signed URL generation error:', e);
        return null;
      }
    },

    async deletePhoto(photoPath) {
      if (!client || !photoPath) return;
      try {
        signedUrlCache.delete(photoPath);
        await client.storage.from('body-photos').remove([photoPath]);
      } catch (e) {
        console.warn('Failed to delete photo from storage:', e);
      }
    },

    async getAllRecords(withPhotos = false) {
      if (!client) return [];

      let query = client
        .from('weight_records')
        .select('*')
        .order('record_date', { ascending: false })
        .order('id', { ascending: false });

      if (withPhotos) {
        query = query.not('photo_path', 'is', null).neq('photo_path', '');
      }

      const { data, error } = await query;
      if (error) {
        console.error('Fetch records error:', error);
        throw error;
      }

      const records = data || [];

      await Promise.all(
        records.map(async (r) => {
          if (r.photo_path) {
            r.photo_url = await this.getSignedPhotoUrl(r.photo_path, 3600);
          }
        })
      );

      return records;
    },

    async createRecord({ weight, body_fat, waist_cm, hip_cm, chest_cm, record_date, note, tags, photo_path, photo_angle }) {
      if (!client) throw new Error('Supabase 尚未初始化');

      const user = await this.getCurrentUser();

      const weightVal = (weight !== null && weight !== undefined && weight !== '' && !isNaN(Number(weight)))
        ? parseFloat(weight)
        : null;

      const payload = {
        weight: weightVal,
        body_fat: body_fat ? parseFloat(body_fat) : null,
        waist_cm: waist_cm ? parseFloat(waist_cm) : null,
        hip_cm: hip_cm ? parseFloat(hip_cm) : null,
        chest_cm: chest_cm ? parseFloat(chest_cm) : null,
        record_date: record_date || new Date().toISOString(),
        note: note || '',
        tags: tags || '',
        photo_path: photo_path || null,
        photo_angle: photo_angle || 'front',
        user_id: user ? user.id : null
      };

      const { data, error } = await client
        .from('weight_records')
        .insert([payload])
        .select();

      if (error) {
        console.error('Create record error:', error);
        throw error;
      }

      const record = data && data[0];
      if (record && record.photo_path) {
        record.photo_url = await this.getSignedPhotoUrl(record.photo_path, 3600);
      }

      return record;
    },

    async deleteRecord(id, photoPath) {
      if (!client) throw new Error('Supabase 尚未初始化');

      const { error } = await client
        .from('weight_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete record error:', error);
        throw error;
      }

      if (photoPath) {
        await this.deletePhoto(photoPath);
      }

      return true;
    },

    async getStats() {
      if (!client) {
        return {
          total_count: 0,
          latest: null,
          earliest: null,
          min_weight: null,
          max_weight: null,
          target_weight: 65.0,
          height_cm: 175.0,
          weight_change: 0
        };
      }

      const records = await this.getAllRecords(false);
      const settings = await this.getSettings();

      const withWeight = (records || []).filter(r => r.weight !== null && r.weight !== undefined && !isNaN(Number(r.weight)));

      if (withWeight.length === 0) {
        return {
          total_count: (records || []).length,
          latest: null,
          earliest: null,
          min_weight: null,
          max_weight: null,
          target_weight: parseFloat(settings.target_weight || '65.0'),
          height_cm: parseFloat(settings.height_cm || '175.0'),
          weight_change: 0
        };
      }

      const chron = [...withWeight].sort((a, b) => new Date(a.record_date) - new Date(b.record_date));
      const earliest = chron[0];
      const latest = chron[chron.length - 1];

      let minW = withWeight[0].weight;
      let maxW = withWeight[0].weight;
      for (const r of withWeight) {
        if (r.weight < minW) minW = r.weight;
        if (r.weight > maxW) maxW = r.weight;
      }

      const diff = parseFloat((latest.weight - earliest.weight).toFixed(1));

      return {
        total_count: (records || []).length,
        latest: latest,
        earliest: earliest,
        min_weight: minW,
        max_weight: maxW,
        target_weight: parseFloat(settings.target_weight || '65.0'),
        height_cm: parseFloat(settings.height_cm || '175.0'),
        weight_change: diff
      };
    },

    async getSettings() {
      if (!client) {
        return { target_weight: '65.0', height_cm: '175.0' };
      }

      try {
        const { data, error } = await client.from('user_settings').select('*');
        if (error) throw error;
        const result = { target_weight: '65.0', height_cm: '175.0' };
        if (data) {
          data.forEach(item => { result[item.key] = item.value; });
        }
        return result;
      } catch (err) {
        console.warn('Failed to load settings:', err);
        return { target_weight: '65.0', height_cm: '175.0' };
      }
    },

    async saveSettings(settingsObj) {
      if (!client) throw new Error('Supabase 尚未初始化');

      const user = await this.getCurrentUser();
      const entries = Object.entries(settingsObj);
      for (const [key, value] of entries) {
        await client
          .from('user_settings')
          .upsert({
            key,
            value: String(value),
            user_id: user ? user.id : null
          }, { onConflict: 'key' });
      }
      return this.getSettings();
    }
  };
})();
