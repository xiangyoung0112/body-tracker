/**
 * FitTrack - Supabase Cloud Service Layer
 * Enables 24/7 serverless operation without needing a computer running.
 */

const SupabaseService = (() => {
  // Storage keys for localStorage
  const STORAGE_KEY_URL = 'fittrack_supabase_url';
  const STORAGE_KEY_KEY = 'fittrack_supabase_key';

  // Optional: Pre-configured defaults can be placed here if desired
  let client = null;
  let currentUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  let currentKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  // Initialize client if credentials exist
  function initClient(url, key) {
    if (url && key && window.supabase) {
      try {
        client = window.supabase.createClient(url.trim(), key.trim());
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

  // Initial attempt with stored credentials
  if (currentUrl && currentKey && window.supabase) {
    initClient(currentUrl, currentKey);
  }

  return {
    isConfigured() {
      return !!client;
    },

    getCredentials() {
      return {
        url: currentUrl,
        key: currentKey
      };
    },

    saveCredentials(url, key) {
      return initClient(url, key);
    },

    clearCredentials() {
      client = null;
      currentUrl = '';
      currentKey = '';
      localStorage.removeItem(STORAGE_KEY_URL);
      localStorage.removeItem(STORAGE_KEY_KEY);
    },

    // Upload body photo to Supabase Storage bucket 'body-photos'
    // Returns { publicUrl, path }
    async uploadPhoto(blob) {
      if (!client) throw new Error('Supabase 尚未設定');

      const fileName = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;

      const { data, error } = await client.storage
        .from('body-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload photo error:', error);
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = client.storage
        .from('body-photos')
        .getPublicUrl(fileName);

      return {
        publicUrl: publicUrlData.publicUrl,
        path: fileName
      };
    },

    // Delete photo from bucket
    async deletePhoto(photoPath) {
      if (!client || !photoPath) return;
      try {
        await client.storage.from('body-photos').remove([photoPath]);
      } catch (e) {
        console.warn('Failed to delete photo from storage:', e);
      }
    },

    // Fetch all records
    async getAllRecords(withPhotos = false) {
      if (!client) return [];

      let query = client
        .from('weight_records')
        .select('*')
        .order('record_date', { ascending: false })
        .order('id', { ascending: false });

      if (withPhotos) {
        query = query.not('photo_url', 'is', null).neq('photo_url', '');
      }

      const { data, error } = await query;
      if (error) {
        console.error('Fetch records error:', error);
        throw error;
      }
      return data || [];
    },

    // Create a new record
    async createRecord({ weight, body_fat, record_date, note, tags, photo_url, photo_path, photo_angle }) {
      if (!client) throw new Error('Supabase 尚未設定');

      const payload = {
        weight: parseFloat(weight),
        body_fat: body_fat ? parseFloat(body_fat) : null,
        record_date: record_date || new Date().toISOString(),
        note: note || '',
        tags: tags || '',
        photo_url: photo_url || null,
        photo_path: photo_path || null,
        photo_angle: photo_angle || 'front'
      };

      const { data, error } = await client
        .from('weight_records')
        .insert([payload])
        .select();

      if (error) {
        console.error('Create record error:', error);
        throw error;
      }

      return data && data[0];
    },

    // Delete record by ID and remove photo from bucket
    async deleteRecord(id, photoPath) {
      if (!client) throw new Error('Supabase 尚未設定');

      // 1. Delete from database
      const { error } = await client
        .from('weight_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete record error:', error);
        throw error;
      }

      // 2. Delete photo file from bucket
      if (photoPath) {
        await this.deletePhoto(photoPath);
      }

      return true;
    },

    // Compute stats from records and settings
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

      const records = await this.getAllRecords();
      const settings = await this.getSettings();

      if (records.length === 0) {
        return {
          total_count: 0,
          latest: null,
          earliest: null,
          min_weight: null,
          max_weight: null,
          target_weight: parseFloat(settings.target_weight || '65.0'),
          height_cm: parseFloat(settings.height_cm || '175.0'),
          weight_change: 0
        };
      }

      // Sort chronologically for calculation
      const chron = [...records].sort((a, b) => new Date(a.record_date) - new Date(b.record_date));
      const earliest = chron[0];
      const latest = chron[chron.length - 1];

      let minW = records[0].weight;
      let maxW = records[0].weight;
      for (const r of records) {
        if (r.weight < minW) minW = r.weight;
        if (r.weight > maxW) maxW = r.weight;
      }

      const diff = parseFloat((latest.weight - earliest.weight).toFixed(1));

      return {
        total_count: records.length,
        latest: latest,
        earliest: earliest,
        min_weight: minW,
        max_weight: maxW,
        target_weight: parseFloat(settings.target_weight || '65.0'),
        height_cm: parseFloat(settings.height_cm || '175.0'),
        weight_change: diff
      };
    },

    // Get user settings
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
        console.warn('Failed to load settings from Supabase:', err);
        return { target_weight: '65.0', height_cm: '175.0' };
      }
    },

    // Save user settings
    async saveSettings(settingsObj) {
      if (!client) throw new Error('Supabase 尚未設定');

      const entries = Object.entries(settingsObj);
      for (const [key, value] of entries) {
        await client
          .from('user_settings')
          .upsert({ key, value: String(value) }, { onConflict: 'key' });
      }
      return this.getSettings();
    }
  };
})();
