/**
 * FitTrack - iOS Mobile-First Body Weight & Physique Tracker
 * Highest Security Edition: Private Bucket + Signed URLs + Supabase Auth Lock
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentTab: 'tab-log',
    allRecords: [],
    recordsWithPhotos: [],
    stats: null,
    settings: {
      target_weight: 65.0,
      height_cm: 175.0,
      user_name: '體態記錄'
    },
    networkInfo: null,
    selectedPhotoBlob: null,
    selectedPhotoAngle: 'front',
    selectedTags: new Set(),
    chartInstance: null,
    chartRange: '7',
    compareMode: 'slider', // 'slider' or 'side'
    sliderPos: 50 // percentage
  };

  // DOM Elements
  const elements = {
    // Auth Screen (Private Vault Lock)
    authScreen: document.getElementById('authScreen'),
    appContainer: document.getElementById('app'),
    vaultActivationBox: document.getElementById('vaultActivationBox'),
    activationInput: document.getElementById('activationInput'),
    btnApplyActivation: document.getElementById('btnApplyActivation'),
    btnActionLogin: document.getElementById('btnActionLogin'),
    btnActionRegister: document.getElementById('btnActionRegister'),
    authForm: document.getElementById('authForm'),
    authEmail: document.getElementById('authEmail'),
    authPassword: document.getElementById('authPassword'),
    authErrorMsg: document.getElementById('authErrorMsg'),
    btnSubmitAuth: document.getElementById('btnSubmitAuth'),
    currentUserEmail: document.getElementById('currentUserEmail'),
    btnSignOut: document.getElementById('btnSignOut'),

    // Navigation
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    headerTitle: document.getElementById('headerTitle'),
    btnQuickScan: document.getElementById('btnQuickScan'),
    
    // Log Form
    recordForm: document.getElementById('recordForm'),
    weightInput: document.getElementById('weightInput'),
    bodyFatInput: document.getElementById('bodyFatInput'),
    recordDateInput: document.getElementById('recordDateInput'),
    noteInput: document.getElementById('noteInput'),
    stepBtns: document.querySelectorAll('.step-btn'),
    tagChips: document.querySelectorAll('.tag-chip'),
    angleRadios: document.querySelectorAll('input[name="photoAngle"]'),
    btnSubmitRecord: document.getElementById('btnSubmitRecord'),
    
    // Camera & Photo Elements
    cameraInput: document.getElementById('cameraInput'),
    photoPreviewContainer: document.getElementById('photoPreviewContainer'),
    photoPlaceholder: document.getElementById('photoPlaceholder'),
    photoPreviewWrapper: document.getElementById('photoPreviewWrapper'),
    photoPreviewImg: document.getElementById('photoPreviewImg'),
    previewAngleBadge: document.getElementById('previewAngleBadge'),
    btnRetakePhoto: document.getElementById('btnRetakePhoto'),
    btnRemovePhoto: document.getElementById('btnRemovePhoto'),

    // Trends / Stats
    statLatestWeight: document.getElementById('statLatestWeight'),
    statDate: document.getElementById('statDate'),
    statChange: document.getElementById('statChange'),
    statChangeWrap: document.getElementById('statChangeWrap'),
    statFromStart: document.getElementById('statFromStart'),
    statToTarget: document.getElementById('statToTarget'),
    statTargetVal: document.getElementById('statTargetVal'),
    statBmi: document.getElementById('statBmi'),
    statBmiCategory: document.getElementById('statBmiCategory'),
    rangeBtns: document.querySelectorAll('.range-btn'),
    weightChartCanvas: document.getElementById('weightChart'),

    // Timeline
    timelineContainer: document.getElementById('timelineContainer'),
    timelineCountText: document.getElementById('timelineCountText'),
    filterPhotosOnly: document.getElementById('filterPhotosOnly'),

    // Comparison
    compareBeforeSelect: document.getElementById('compareBeforeSelect'),
    compareAfterSelect: document.getElementById('compareAfterSelect'),
    compareSummaryBadge: document.getElementById('compareSummaryBadge'),
    compareWeightDiff: document.getElementById('compareWeightDiff'),
    compareDaysDiff: document.getElementById('compareDaysDiff'),
    btnModeSlider: document.getElementById('btnModeSlider'),
    btnModeSide: document.getElementById('btnModeSide'),
    sliderCompareView: document.getElementById('sliderCompareView'),
    sideCompareView: document.getElementById('sideCompareView'),
    itemBeforeWrap: document.getElementById('itemBeforeWrap'),
    sliderDivider: document.getElementById('sliderDivider'),
    imgCompareBefore: document.getElementById('imgCompareBefore'),
    imgCompareAfter: document.getElementById('imgCompareAfter'),
    tagBeforeDate: document.getElementById('tagBeforeDate'),
    tagAfterDate: document.getElementById('tagAfterDate'),
    imgSideBefore: document.getElementById('imgSideBefore'),
    imgSideAfter: document.getElementById('imgSideAfter'),
    sideBeforeInfo: document.getElementById('sideBeforeInfo'),
    sideAfterInfo: document.getElementById('sideAfterInfo'),

    // Settings
    settingHeight: document.getElementById('settingHeight'),
    settingTargetWeight: document.getElementById('settingTargetWeight'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),
    btnExportData: document.getElementById('btnExportData'),
    netAddressDisplay: document.getElementById('netAddressDisplay'),

    // Supabase Settings & Modal
    supabaseStatusBadge: document.getElementById('supabaseStatusBadge'),
    inputSupabaseUrl: document.getElementById('inputSupabaseUrl'),
    inputSupabaseKey: document.getElementById('inputSupabaseKey'),
    btnSaveSupabase: document.getElementById('btnSaveSupabase'),
    btnClearSupabase: document.getElementById('btnClearSupabase'),
    supabaseSetupModal: document.getElementById('supabaseSetupModal'),
    modalInputUrl: document.getElementById('modalInputUrl'),
    modalInputKey: document.getElementById('modalInputKey'),
    btnModalSaveSupabase: document.getElementById('btnModalSaveSupabase'),
    btnCloseSupabaseModal: document.getElementById('btnCloseSupabaseModal'),

    // Modals & Toast
    photoModal: document.getElementById('photoModal'),
    modalImg: document.getElementById('modalImg'),
    modalDetails: document.getElementById('modalDetails'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    qrModal: document.getElementById('qrModal'),
    qrCanvasContainer: document.getElementById('qrCanvasContainer'),
    qrUrlText: document.getElementById('qrUrlText'),
    btnCloseQrModal: document.getElementById('btnCloseQrModal'),
    toast: document.getElementById('toast')
  };

  // Helper: Format local ISO string for datetime input
  function initDateTimeInput() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    elements.recordDateInput.value = localIso;
  }

  // Toast notification helper
  let toastTimer = null;
  function showToast(message, isError = false) {
    if (toastTimer) clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.className = isError ? 'toast error' : 'toast';
    elements.toast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 2800);
  }

  // ==================== AUTHENTICATION LOCK FLOW ====================
  function initAuthFlow() {
    if (!window.SupabaseService) return;

    function showActivationView() {
      elements.authScreen.classList.remove('hidden');
      elements.appContainer.classList.add('hidden');
      if (elements.vaultActivationBox) elements.vaultActivationBox.classList.remove('hidden');
      if (elements.authForm) elements.authForm.classList.add('hidden');
    }

    function showAuthFormView() {
      elements.authScreen.classList.remove('hidden');
      elements.appContainer.classList.add('hidden');
      if (elements.vaultActivationBox) elements.vaultActivationBox.classList.add('hidden');
      if (elements.authForm) elements.authForm.classList.remove('hidden');
      if (elements.authErrorMsg) elements.authErrorMsg.classList.add('hidden');
    }

    // Apply activation code / URL button
    if (elements.btnApplyActivation) {
      elements.btnApplyActivation.addEventListener('click', () => {
        const val = (elements.activationInput ? elements.activationInput.value : '').trim();
        if (!val) {
          showToast('請先貼上專屬啟動連結或金鑰代碼', true);
          return;
        }
        const ok = window.SupabaseService.activateFromString(val);
        if (ok) {
          showToast('🎉 保險箱已成功啟動！請建立密碼');
          showAuthFormView();
        } else {
          showToast('啟動代碼格式不正確，請確認後重新貼上', true);
        }
      });
    }

    // Helper: Execute authentication (login, register, or smart auto-detect)
    async function executeAuth(mode = 'auto') {
      const email = elements.authEmail.value.trim();
      const password = elements.authPassword.value.trim();

      if (!email || !password) {
        elements.authErrorMsg.textContent = '請先輸入個人 Email 與密碼';
        elements.authErrorMsg.classList.remove('hidden');
        if (!email) elements.authEmail.focus();
        else elements.authPassword.focus();
        showToast('請輸入 Email 與密碼', true);
        return;
      }
      if (password.length < 6) {
        elements.authErrorMsg.textContent = '密碼長度至少需 6 個字元';
        elements.authErrorMsg.classList.remove('hidden');
        elements.authPassword.focus();
        showToast('密碼長度至少需 6 個字元', true);
        return;
      }

      const btnText = elements.btnSubmitAuth.querySelector('.btn-text');
      const btnSpinner = elements.btnSubmitAuth.querySelector('.btn-spinner');
      btnText.classList.add('hidden');
      btnSpinner.classList.remove('hidden');
      elements.btnSubmitAuth.disabled = true;
      if (elements.btnActionLogin) elements.btnActionLogin.disabled = true;
      if (elements.btnActionRegister) elements.btnActionRegister.disabled = true;
      elements.authErrorMsg.classList.add('hidden');

      try {
        if (mode === 'register') {
          showToast('正在建立您的專屬私人保險箱...');
          await window.SupabaseService.signUp(email, password);
          try {
            await window.SupabaseService.signIn(email, password);
          } catch (e) {}
          showToast('🎉 保險箱帳號已建立並安全解鎖！');
        } else if (mode === 'login') {
          showToast('正在驗證密碼...');
          await window.SupabaseService.signIn(email, password);
          showToast('🔓 保險箱已解鎖！');
        } else {
          // AUTO mode: Try sign in first. If user doesn't exist, automatically sign up!
          showToast('正在解鎖私人保險箱...');
          try {
            await window.SupabaseService.signIn(email, password);
            showToast('🔓 保險箱已解鎖！');
          } catch (loginErr) {
            const msg = (loginErr.message || '').toLowerCase();
            if (msg.includes('invalid login credentials') || msg.includes('user not found') || msg.includes('invalid_grant')) {
              showToast('初次使用，正在為您建立專屬保險箱...');
              await window.SupabaseService.signUp(email, password);
              try {
                await window.SupabaseService.signIn(email, password);
              } catch (e) {}
              showToast('🎉 專屬保險箱建立成功，已解鎖！');
            } else {
              throw loginErr;
            }
          }
        }
      } catch (err) {
        console.error('Auth error:', err);
        elements.authErrorMsg.textContent = err.message || '驗證失敗，請檢查輸入內容';
        elements.authErrorMsg.classList.remove('hidden');
        showToast(err.message || '驗證失敗', true);
      } finally {
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
        elements.btnSubmitAuth.disabled = false;
        if (elements.btnActionLogin) elements.btnActionLogin.disabled = false;
        if (elements.btnActionRegister) elements.btnActionRegister.disabled = false;
      }
    }

    // Submit form (Smart auto-detect)
    elements.authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeAuth('auto');
    });

    // Explicit Action Buttons
    if (elements.btnActionLogin) {
      elements.btnActionLogin.addEventListener('click', () => executeAuth('login'));
    }
    if (elements.btnActionRegister) {
      elements.btnActionRegister.addEventListener('click', () => executeAuth('register'));
    }

    // Listen to session changes
    window.SupabaseService.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        elements.authScreen.classList.add('hidden');
        elements.appContainer.classList.remove('hidden');
        if (elements.currentUserEmail) {
          elements.currentUserEmail.textContent = session.user.email;
        }
        await loadAllData();
      } else {
        elements.appContainer.classList.add('hidden');
        elements.authScreen.classList.remove('hidden');
        if (elements.currentUserEmail) {
          elements.currentUserEmail.textContent = '未登入';
        }
        state.allRecords = [];
        state.recordsWithPhotos = [];
        renderTimeline();
      }
    });

    // Sign out handler
    if (elements.btnSignOut) {
      elements.btnSignOut.addEventListener('click', async () => {
        if (!confirm('確定要登出私人保險箱嗎？登出後所有人均無法查看任何體態照片。')) return;
        await window.SupabaseService.signOut();
        showToast('已安全登出私人保險箱');
      });
    }

    checkInitialAuth();
  }

  async function checkInitialAuth() {
    if (!window.SupabaseService || !window.SupabaseService.isConfigured()) {
      const isGitHubPages = window.location.hostname.includes('github.io') || window.location.protocol === 'https:';
      if (isGitHubPages) {
        elements.authScreen.classList.remove('hidden');
        elements.appContainer.classList.add('hidden');
        if (elements.vaultActivationBox) elements.vaultActivationBox.classList.remove('hidden');
        if (elements.authForm) elements.authForm.classList.add('hidden');
        return;
      }
      elements.authScreen.classList.add('hidden');
      elements.appContainer.classList.remove('hidden');
      return;
    }

    const session = await window.SupabaseService.getSession();
    if (session && session.user) {
      elements.authScreen.classList.add('hidden');
      elements.appContainer.classList.remove('hidden');
      if (elements.currentUserEmail) {
        elements.currentUserEmail.textContent = session.user.email;
      }
    } else {
      elements.appContainer.classList.add('hidden');
      elements.authScreen.classList.remove('hidden');
      if (elements.vaultActivationBox) elements.vaultActivationBox.classList.add('hidden');
      if (elements.authForm) elements.authForm.classList.remove('hidden');
    }
  }

  // ==================== NAVIGATION ====================
  function initNavigation() {
    const tabTitles = {
      'tab-log': '記錄體態',
      'tab-trends': '趨勢圖表',
      'tab-timeline': '體態時間軸',
      'tab-compare': '前後比對',
      'tab-settings': '設定與連線'
    };

    elements.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTabId = tab.dataset.tab;
        if (state.currentTab === targetTabId) return;

        elements.navTabs.forEach(t => t.classList.remove('active'));
        elements.tabPanes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPane = document.getElementById(targetTabId);
        if (targetPane) targetPane.classList.add('active');

        state.currentTab = targetTabId;
        elements.headerTitle.textContent = tabTitles[targetTabId] || '體態記錄';

        // Trigger tab-specific refresh
        if (targetTabId === 'tab-trends') {
          renderChart(state.chartRange);
        } else if (targetTabId === 'tab-compare') {
          refreshComparisonOptions();
        } else if (targetTabId === 'tab-timeline') {
          renderTimeline();
        }
      });
    });
  }

  // Stepper buttons for weight adjustment (+/- 0.1, +/- 0.5)
  function initSteppers() {
    elements.stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseFloat(btn.dataset.step);
        let current = parseFloat(elements.weightInput.value);
        if (isNaN(current)) {
          current = (state.stats && state.stats.latest) ? state.stats.latest.weight : 65.0;
        }
        const updated = (current + step).toFixed(1);
        elements.weightInput.value = updated;
      });
    });
  }

  // Quick tag toggling
  function initTagChips() {
    elements.tagChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const tag = chip.dataset.tag;
        if (state.selectedTags.has(tag)) {
          state.selectedTags.delete(tag);
          chip.classList.remove('active');
        } else {
          state.selectedTags.add(tag);
          chip.classList.add('active');
        }
      });
    });
  }

  // Photo Angle Selector
  function initAngleSelector() {
    const angleMap = { front: '正面', side: '側面', back: '背面' };
    elements.angleRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.selectedPhotoAngle = e.target.value;
        if (elements.previewAngleBadge) {
          elements.previewAngleBadge.textContent = angleMap[state.selectedPhotoAngle] || '正面';
        }
      });
    });
  }

  // ==================== iOS CAMERA & PHOTO HANDLING ====================
  function initCameraCapture() {
    elements.photoPreviewContainer.addEventListener('click', (e) => {
      if (e.target.closest('#btnRetakePhoto') || e.target.closest('#btnRemovePhoto')) return;
      if (!state.selectedPhotoBlob) {
        elements.cameraInput.click();
      }
    });

    elements.btnRetakePhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.cameraInput.click();
    });

    elements.btnRemovePhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      clearPhotoPreview();
    });

    // Handle photo taken via native iOS Safari sandbox
    elements.cameraInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        showToast('正在優化照片尺寸...');
        // Client-side image compression in RAM:
        // Max dimension 1600px ensures fast mobile upload & crisp muscle/body definition
        const compressedBlob = await compressImage(file, 1600, 0.85);
        state.selectedPhotoBlob = compressedBlob;

        // Preview in UI
        const previewUrl = URL.createObjectURL(compressedBlob);
        elements.photoPreviewImg.src = previewUrl;
        elements.photoPlaceholder.classList.add('hidden');
        elements.photoPreviewWrapper.classList.remove('hidden');

        showToast('📸 照片已就緒（不進手機相簿）');
      } catch (err) {
        console.error('Image compression failed:', err);
        showToast('照片處理失敗，請重試', true);
      } finally {
        elements.cameraInput.value = '';
      }
    });
  }

  // Helper: client-side image compression using in-memory Canvas
  function compressImage(file, maxDimension = 1600, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas toBlob returned null'));
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function clearPhotoPreview() {
    state.selectedPhotoBlob = null;
    elements.photoPreviewImg.src = '';
    elements.photoPreviewWrapper.classList.add('hidden');
    elements.photoPlaceholder.classList.remove('hidden');
    elements.cameraInput.value = '';
  }

  // ==================== FORM SUBMISSION ====================
  function initFormSubmit() {
    elements.recordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const weight = parseFloat(elements.weightInput.value);
      if (isNaN(weight) || weight <= 0) {
        showToast('請輸入有效體重', true);
        elements.weightInput.focus();
        return;
      }

      const bodyFat = elements.bodyFatInput.value ? parseFloat(elements.bodyFatInput.value) : null;
      const recordDate = elements.recordDateInput.value || new Date().toISOString();
      const note = elements.noteInput.value.trim();
      const tags = Array.from(state.selectedTags).join(',');

      // UI Loading state
      const btnText = elements.btnSubmitRecord.querySelector('.btn-text');
      const btnSpinner = elements.btnSubmitRecord.querySelector('.btn-spinner');
      btnText.classList.add('hidden');
      btnSpinner.classList.remove('hidden');
      elements.btnSubmitRecord.disabled = true;

      try {
        if (window.SupabaseService && window.SupabaseService.isConfigured()) {
          // ========== SUPABASE PRIVATE VAULT MODE ==========
          let photoPath = null;

          if (state.selectedPhotoBlob) {
            showToast('正在加密上傳至私人保險箱...');
            const uploadResult = await window.SupabaseService.uploadPhoto(state.selectedPhotoBlob);
            photoPath = uploadResult.path;
          }

          await window.SupabaseService.createRecord({
            weight: weight,
            body_fat: bodyFat,
            record_date: recordDate,
            note: note,
            tags: tags,
            photo_path: photoPath,
            photo_angle: state.selectedPhotoAngle
          });

          showToast('🎉 私人記錄已加密儲存！');
        } else {
          // ========== LOCAL SERVER FALLBACK MODE ==========
          const formData = new FormData();
          formData.append('weight', weight);
          if (bodyFat !== null) formData.append('body_fat', bodyFat);
          formData.append('record_date', recordDate);
          formData.append('note', note);
          formData.append('tags', tags);
          formData.append('photo_angle', state.selectedPhotoAngle);

          if (state.selectedPhotoBlob) {
            formData.append('photo', state.selectedPhotoBlob, `photo-${Date.now()}.jpg`);
          }

          const res = await fetch('/api/records', { method: 'POST', body: formData });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || '儲存失敗');
          showToast('🎉 本機記錄儲存成功！');
        }

        // Reset form inputs
        elements.noteInput.value = '';
        state.selectedTags.clear();
        elements.tagChips.forEach(c => c.classList.remove('active'));
        clearPhotoPreview();
        initDateTimeInput();

        // Refresh view data
        await loadAllData();

      } catch (err) {
        console.error('Submit error:', err);
        showToast('儲存失敗：' + (err.message || '請確認網路連線'), true);
      } finally {
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
        elements.btnSubmitRecord.disabled = false;
      }
    });
  }

  // ==================== DATA FETCHING ====================
  async function loadAllData() {
    try {
      if (window.SupabaseService && window.SupabaseService.isConfigured()) {
        const user = await window.SupabaseService.getCurrentUser();
        if (!user) {
          elements.appContainer.classList.add('hidden');
          elements.authScreen.classList.remove('hidden');
          return;
        }

        // Load from Supabase Private Vault
        const [records, stats, settings] = await Promise.all([
          window.SupabaseService.getAllRecords(),
          window.SupabaseService.getStats(),
          window.SupabaseService.getSettings()
        ]);

        state.allRecords = records || [];
        state.recordsWithPhotos = state.allRecords.filter(r => r.photo_path || r.photo_url);
        state.stats = stats;
        state.settings = settings;

        updateStatsView();
        updateSettingsView();

      } else {
        // Fallback: try local server
        try {
          const [recordsRes, statsRes, settingsRes, netRes] = await Promise.all([
            fetch('/api/records').then(r => r.json()),
            fetch('/api/stats').then(r => r.json()),
            fetch('/api/settings').then(r => r.json()),
            fetch('/api/network-info').then(r => r.json())
          ]);

          if (recordsRes.success) {
            state.allRecords = recordsRes.data || [];
            state.recordsWithPhotos = state.allRecords.filter(r => r.photo_path || r.photo_url);
          }
          if (statsRes.success) {
            state.stats = statsRes.data;
            updateStatsView();
          }
          if (settingsRes.success) {
            state.settings = settingsRes.data;
            updateSettingsView();
          }
          if (netRes.success) {
            state.networkInfo = netRes;
            elements.netAddressDisplay.textContent = netRes.primaryUrl;
          }
        } catch (localErr) {
          console.warn('Local API unavailable; Supabase not configured.');
        }
      }

      // If weight input is empty, prefill with latest weight
      if (!elements.weightInput.value && state.stats && state.stats.latest) {
        elements.weightInput.value = state.stats.latest.weight.toFixed(1);
      }

      // Re-render UI components
      renderTimeline();
      if (state.currentTab === 'tab-trends') {
        renderChart(state.chartRange);
      }
      refreshComparisonOptions();

    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  // ==================== STATS VIEW ====================
  function updateStatsView() {
    const s = state.stats;
    if (!s || !s.latest) {
      elements.statLatestWeight.textContent = '--';
      elements.statDate.textContent = '尚無記錄';
      elements.statChange.textContent = '--';
      elements.statFromStart.textContent = '起始: -- kg';
      elements.statToTarget.textContent = '--';
      elements.statTargetVal.textContent = '目標: -- kg';
      elements.statBmi.textContent = '--';
      return;
    }

    // Latest Weight
    elements.statLatestWeight.textContent = Number(s.latest.weight).toFixed(1);
    elements.statDate.textContent = s.latest.record_date.replace('T', ' ');

    // Total Weight Change
    const diff = s.weight_change;
    elements.statChange.textContent = (diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`);
    elements.statChangeWrap.className = 'stat-value ' + (diff < 0 ? 'stat-diff-neg' : (diff > 0 ? 'stat-diff-pos' : ''));
    elements.statFromStart.textContent = `起始: ${s.earliest ? Number(s.earliest.weight).toFixed(1) : '--'} kg`;

    // Target Gap
    const target = s.target_weight || 65.0;
    const gap = s.latest.weight - target;
    elements.statTargetVal.textContent = `目標: ${Number(target).toFixed(1)} kg`;
    if (gap > 0) {
      elements.statToTarget.textContent = `-${gap.toFixed(1)}`;
    } else {
      elements.statToTarget.textContent = `達成! 🎉`;
    }

    // BMI Calculation
    const heightM = (s.height_cm || 175) / 100;
    const bmi = (s.latest.weight / (heightM * heightM)).toFixed(1);
    elements.statBmi.textContent = bmi;

    let category = '正常';
    let catClass = 'badge-normal';
    if (bmi < 18.5) {
      category = '偏輕';
      catClass = 'badge-warning';
    } else if (bmi >= 24 && bmi < 27) {
      category = '過重';
      catClass = 'badge-warning';
    } else if (bmi >= 27) {
      category = '肥胖';
      catClass = 'badge-danger';
    }
    elements.statBmiCategory.textContent = category;
    elements.statBmiCategory.className = 'stat-sub ' + catClass;
  }

  // ==================== CHART.JS RENDERING ====================
  function initChartControls() {
    elements.rangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.rangeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.chartRange = btn.dataset.days;
        renderChart(state.chartRange);
      });
    });
  }

  function renderChart(daysRange) {
    if (!elements.weightChartCanvas || !window.Chart) return;

    let records = [...state.allRecords];
    if (records.length === 0) return;

    // Filter by days
    const now = new Date();
    if (daysRange !== 'all') {
      const days = parseInt(daysRange, 10);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      records = records.filter(r => new Date(r.record_date) >= cutoff);
    }

    // Sort chronologically (oldest to newest for line chart)
    records.sort((a, b) => new Date(a.record_date) - new Date(b.record_date));

    const labels = records.map(r => {
      const d = new Date(r.record_date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const dataPoints = records.map(r => Number(r.weight));

    const targetWeight = (state.stats && state.stats.target_weight) ? Number(state.stats.target_weight) : 65.0;

    const ctx = elements.weightChartCanvas.getContext('2d');

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    if (state.chartInstance) {
      state.chartInstance.destroy();
    }

    state.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '體重 (kg)',
            data: dataPoints,
            borderColor: '#10b981',
            backgroundColor: gradient,
            borderWidth: 3,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.35
          },
          {
            label: '目標體重',
            data: new Array(labels.length).fill(targetWeight),
            borderColor: 'rgba(6, 182, 212, 0.6)',
            borderWidth: 1.5,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} kg`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#64748b',
              font: { size: 11 }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.06)'
            },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
              callback: (val) => `${val}kg`
            }
          }
        }
      }
    });
  }

  // ==================== TIMELINE VIEW ====================
  function initTimelineFilter() {
    elements.filterPhotosOnly.addEventListener('change', () => {
      renderTimeline();
    });
  }

  function getRecordPhotoUrl(record) {
    if (!record) return null;
    if (record.photo_url) return record.photo_url;
    if (record.photo_path && !record.photo_path.startsWith('photo-')) return `/uploads/${record.photo_path}`;
    return null;
  }

  function renderTimeline() {
    const onlyPhotos = elements.filterPhotosOnly.checked;
    let list = onlyPhotos ? state.recordsWithPhotos : state.allRecords;

    elements.timelineCountText.textContent = `共 ${list.length} 筆記錄`;

    if (list.length === 0) {
      elements.timelineContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔒</div>
          <p>${onlyPhotos ? '目前尚無體態照片記錄' : '目前尚無任何紀錄'}</p>
          <p class="empty-sub">前往「記錄」頁面拍照登錄第一次私人體態吧！</p>
        </div>
      `;
      return;
    }

    const angleMap = { front: '🧍 正面', side: '🚶 側面', back: '🚶‍♂️ 背面' };

    elements.timelineContainer.innerHTML = list.map((record) => {
      const dateStr = record.record_date.replace('T', ' ');
      const tagsHtml = record.tags
        ? record.tags.split(',').filter(Boolean).map(t => `<span class="timeline-tag-badge">${escapeHtml(t)}</span>`).join('')
        : '';

      const photoUrl = getRecordPhotoUrl(record);
      const photoHtml = photoUrl
        ? `<div class="timeline-photo-wrap" data-photo="${escapeHtml(photoUrl)}" data-info="${escapeHtml(dateStr)} • ${record.weight}kg">
             <img src="${escapeHtml(photoUrl)}" alt="體態照" loading="lazy">
             <span class="timeline-photo-angle">${angleMap[record.photo_angle] || '體態照'}</span>
           </div>`
        : '';

      return `
        <div class="timeline-card" data-id="${record.id}">
          <div class="timeline-card-header">
            <span class="timeline-date">${dateStr}</span>
            <span class="timeline-weight-wrap">${Number(record.weight).toFixed(1)} <small style="font-size:14px;color:#94a3b8">kg</small></span>
          </div>

          ${photoHtml}

          <div class="timeline-card-body">
            ${record.body_fat ? `<div style="font-size:12px;color:#06b6d4;margin-bottom:6px">體脂率: ${record.body_fat}%</div>` : ''}
            ${tagsHtml ? `<div class="timeline-tags">${tagsHtml}</div>` : ''}
            ${record.note ? `<p class="timeline-note">${escapeHtml(record.note)}</p>` : ''}
          </div>

          <div class="timeline-card-footer">
            <button type="button" class="btn-delete-record" data-id="${record.id}" data-path="${record.photo_path || ''}">刪除記錄</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click event for photos (opens modal)
    elements.timelineContainer.querySelectorAll('.timeline-photo-wrap').forEach(wrap => {
      wrap.addEventListener('click', () => {
        const photoUrl = wrap.dataset.photo;
        const info = wrap.dataset.info;
        openPhotoModal(photoUrl, info);
      });
    });

    // Attach click event for delete buttons
    elements.timelineContainer.querySelectorAll('.btn-delete-record').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const photoPath = btn.dataset.path;
        if (!confirm('確定要從私人保險箱中刪除這筆紀錄與照片嗎？')) return;

        try {
          if (window.SupabaseService && window.SupabaseService.isConfigured()) {
            await window.SupabaseService.deleteRecord(id, photoPath);
          } else {
            const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
          }
          showToast('已刪除記錄');
          await loadAllData();
        } catch (err) {
          console.error('Delete error:', err);
          showToast('刪除失敗', true);
        }
      });
    });
  }

  function openPhotoModal(url, details) {
    elements.modalImg.src = url;
    elements.modalDetails.innerHTML = `<div style="font-size:15px;font-weight:700;color:#fff">${details}</div>`;
    elements.photoModal.classList.remove('hidden');
  }

  function closePhotoModal() {
    elements.photoModal.classList.add('hidden');
    elements.modalImg.src = '';
  }

  // ==================== BEFORE & AFTER COMPARISON ====================
  function initComparisonModule() {
    elements.btnModeSlider.addEventListener('click', () => {
      elements.btnModeSlider.classList.add('active');
      elements.btnModeSide.classList.remove('active');
      elements.sliderCompareView.classList.remove('hidden');
      elements.sideCompareView.classList.add('hidden');
      state.compareMode = 'slider';
    });

    elements.btnModeSide.addEventListener('click', () => {
      elements.btnModeSide.classList.add('active');
      elements.btnModeSlider.classList.remove('active');
      elements.sideCompareView.classList.remove('hidden');
      elements.sliderCompareView.classList.add('hidden');
      state.compareMode = 'side';
    });

    elements.compareBeforeSelect.addEventListener('change', updateComparisonDisplay);
    elements.compareAfterSelect.addEventListener('change', updateComparisonDisplay);

    initSliderInteraction();
  }

  function refreshComparisonOptions() {
    const list = state.recordsWithPhotos;

    if (list.length < 2) {
      elements.compareBeforeSelect.innerHTML = '<option value="">請先新增至少 2 筆附帶相片的記錄</option>';
      elements.compareAfterSelect.innerHTML = '<option value="">--</option>';
      return;
    }

    const sorted = [...list].sort((a, b) => new Date(a.record_date) - new Date(b.record_date));

    const optionsHtml = sorted.map(r => {
      const d = r.record_date.substring(0, 10);
      return `<option value="${r.id}">${d} (${r.weight}kg)</option>`;
    }).join('');

    elements.compareBeforeSelect.innerHTML = optionsHtml;
    elements.compareAfterSelect.innerHTML = optionsHtml;

    elements.compareBeforeSelect.value = sorted[0].id;
    elements.compareAfterSelect.value = sorted[sorted.length - 1].id;

    updateComparisonDisplay();
  }

  function updateComparisonDisplay() {
    const beforeId = String(elements.compareBeforeSelect.value);
    const afterId = String(elements.compareAfterSelect.value);

    const beforeRecord = state.allRecords.find(r => String(r.id) === beforeId);
    const afterRecord = state.allRecords.find(r => String(r.id) === afterId);

    if (!beforeRecord || !afterRecord) return;

    const beforeUrl = getRecordPhotoUrl(beforeRecord);
    const afterUrl = getRecordPhotoUrl(afterRecord);

    if (!beforeUrl || !afterUrl) return;

    const beforeDate = beforeRecord.record_date.substring(0, 10);
    const afterDate = afterRecord.record_date.substring(0, 10);

    // Slider View
    elements.imgCompareBefore.src = beforeUrl;
    elements.imgCompareAfter.src = afterUrl;
    elements.tagBeforeDate.textContent = `${beforeDate} (${beforeRecord.weight}kg)`;
    elements.tagAfterDate.textContent = `${afterDate} (${afterRecord.weight}kg)`;

    // Side-by-side View
    elements.imgSideBefore.src = beforeUrl;
    elements.imgSideAfter.src = afterUrl;
    elements.sideBeforeInfo.textContent = `${beforeDate} • ${beforeRecord.weight} kg`;
    elements.sideAfterInfo.textContent = `${afterDate} • ${afterRecord.weight} kg`;

    const diff = parseFloat((Number(afterRecord.weight) - Number(beforeRecord.weight)).toFixed(1));
    const d1 = new Date(beforeRecord.record_date);
    const d2 = new Date(afterRecord.record_date);
    const days = Math.abs(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));

    elements.compareWeightDiff.textContent = diff <= 0 ? `${diff} kg 🎉` : `+${diff} kg`;
    elements.compareDaysDiff.textContent = days;
    elements.compareSummaryBadge.classList.remove('hidden');
  }

  function initSliderInteraction() {
    const container = elements.sliderCompareView;
    const divider = elements.sliderDivider;
    const itemBefore = elements.itemBeforeWrap;

    let isDragging = false;

    function setSliderPosition(clientX) {
      const rect = container.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const percent = (x / rect.width) * 100;
      state.sliderPos = percent;

      divider.style.left = `${percent}%`;
      itemBefore.style.width = `${percent}%`;
    }

    container.addEventListener('touchstart', (e) => {
      isDragging = true;
      setSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      setSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => { isDragging = false; });
  }

  // ==================== SETTINGS & SUPABASE CONFIG ====================
  function updateSettingsView() {
    if (state.settings) {
      elements.settingHeight.value = state.settings.height_cm || '175';
      elements.settingTargetWeight.value = state.settings.target_weight || '65.0';
    }
  }

  function initSupabaseControls() {
    if (!window.SupabaseService) return;

    function refreshSupabaseStatus() {
      const creds = window.SupabaseService.getCredentials();
      const isConfigured = window.SupabaseService.isConfigured();

      if (elements.inputSupabaseUrl) elements.inputSupabaseUrl.value = creds.url;
      if (elements.inputSupabaseKey) elements.inputSupabaseKey.value = creds.key;

      if (isConfigured) {
        elements.supabaseStatusBadge.textContent = '🔒 私人桶加密連線中';
        elements.supabaseStatusBadge.style.color = '#10b981';
        elements.supabaseStatusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        elements.supabaseStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      } else {
        elements.supabaseStatusBadge.textContent = '尚未連線';
        elements.supabaseStatusBadge.style.color = '#f59e0b';
        elements.supabaseStatusBadge.style.background = 'rgba(245, 158, 11, 0.15)';
        elements.supabaseStatusBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      }
    }

    refreshSupabaseStatus();

    elements.btnSaveSupabase.addEventListener('click', async () => {
      const url = elements.inputSupabaseUrl.value.trim();
      const key = elements.inputSupabaseKey.value.trim();
      if (!url || !key) {
        showToast('請輸入 Supabase URL 與 Key', true);
        return;
      }
      const ok = window.SupabaseService.saveCredentials(url, key);
      if (ok) {
        showToast('✅ Supabase 雲端已連線！');
        refreshSupabaseStatus();
        await loadAllData();
      } else {
        showToast('連線失敗，請檢查輸入內容', true);
      }
    });

    elements.btnClearSupabase.addEventListener('click', () => {
      if (!confirm('確定要清除 Supabase 雲端連線設定嗎？')) return;
      window.SupabaseService.clearCredentials();
      refreshSupabaseStatus();
      showToast('已清除雲端連線設定');
      loadAllData();
    });

    elements.btnModalSaveSupabase.addEventListener('click', async () => {
      const url = elements.modalInputUrl.value.trim();
      const key = elements.modalInputKey.value.trim();
      if (!url || !key) {
        showToast('請輸入 Supabase URL 與 Key', true);
        return;
      }
      const ok = window.SupabaseService.saveCredentials(url, key);
      if (ok) {
        elements.supabaseSetupModal.classList.add('hidden');
        showToast('🎉 Supabase 私人保險箱已就緒！');
        refreshSupabaseStatus();
        await loadAllData();
      } else {
        showToast('連線失敗，請檢查格式', true);
      }
    });

    elements.btnCloseSupabaseModal.addEventListener('click', () => {
      elements.supabaseSetupModal.classList.add('hidden');
    });
  }

  function initSettingsHandlers() {
    elements.btnSaveSettings.addEventListener('click', async () => {
      const height = parseFloat(elements.settingHeight.value);
      const target = parseFloat(elements.settingTargetWeight.value);

      if (isNaN(height) || isNaN(target)) {
        showToast('請輸入有效數值', true);
        return;
      }

      try {
        if (window.SupabaseService && window.SupabaseService.isConfigured()) {
          await window.SupabaseService.saveSettings({ height_cm: height, target_weight: target });
        } else {
          const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ height_cm: height, target_weight: target })
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);
        }
        showToast('✅ 設定已儲存！');
        await loadAllData();
      } catch (err) {
        console.error('Save settings error:', err);
        showToast('設定儲存失敗', true);
      }
    });

    elements.btnExportData.addEventListener('click', () => {
      const exportData = {
        exportedAt: new Date().toISOString(),
        settings: state.settings,
        records: state.allRecords
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `body-tracker-vault-backup-${new Date().toISOString().substring(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // ==================== QUICK SCAN QR MODAL ====================
  function initQrModal() {
    elements.btnQuickScan.addEventListener('click', () => {
      let url = window.location.href;
      if (state.networkInfo && (url.includes('localhost') || url.includes('127.0.0.1'))) {
        url = state.networkInfo.primaryUrl;
      }
      elements.qrUrlText.textContent = url;

      elements.qrCanvasContainer.innerHTML = '';
      if (window.QRCode && window.QRCode.toCanvas) {
        const canvas = document.createElement('canvas');
        window.QRCode.toCanvas(canvas, url, { width: 220, margin: 2 }, (err) => {
          if (!err) elements.qrCanvasContainer.appendChild(canvas);
        });
      } else {
        elements.qrCanvasContainer.innerHTML = `<p style="color:#38bdf8;font-size:14px">${url}</p>`;
      }

      elements.qrModal.classList.remove('hidden');
    });

    elements.btnCloseQrModal.addEventListener('click', () => {
      elements.qrModal.classList.add('hidden');
    });

    elements.btnCloseModal.addEventListener('click', closePhotoModal);
    elements.photoModal.addEventListener('click', (e) => {
      if (e.target === elements.photoModal) closePhotoModal();
    });
    elements.qrModal.addEventListener('click', (e) => {
      if (e.target === elements.qrModal) elements.qrModal.classList.add('hidden');
    });
  }

  // Helper to escape HTML tags
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  // Initialize All Modules
  initDateTimeInput();
  initNavigation();
  initSteppers();
  initTagChips();
  initAngleSelector();
  initCameraCapture();
  initFormSubmit();
  initChartControls();
  initTimelineFilter();
  initComparisonModule();
  initSupabaseControls();
  initSettingsHandlers();
  initQrModal();

  // Initialize Auth Security Lock
  initAuthFlow();
});
