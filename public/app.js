document.addEventListener('DOMContentLoaded', () => {
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
    chartShowMA7: true,
    compareMode: 'slider',
    sliderPos: 50,
    cameraStream: null,
    cameraFacing: 'environment',
    cameraDelay: 3,
    ghostEnabled: true,
    ghostOpacity: 0.35,
    activeCountdownInterval: null,
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth(),
    selectedCalendarDate: null
  };

  const elements = {
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

    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    headerTitle: document.getElementById('headerTitle'),
    btnQuickScan: document.getElementById('btnQuickScan'),
    btnOpenCalendar: document.getElementById('btnOpenCalendar'),
    streakCount: document.getElementById('streakCount'),
    
    recordForm: document.getElementById('recordForm'),
    weightInput: document.getElementById('weightInput'),
    bodyFatInput: document.getElementById('bodyFatInput'),
    recordDateInput: document.getElementById('recordDateInput'),
    noteInput: document.getElementById('noteInput'),
    stepBtns: document.querySelectorAll('.step-btn'),
    tagChips: document.querySelectorAll('.tag-chip'),
    angleRadios: document.querySelectorAll('input[name="photoAngle"]'),
    btnSubmitRecord: document.getElementById('btnSubmitRecord'),

    toggleTapeCard: document.getElementById('toggleTapeCard'),
    tapeToggleText: document.getElementById('tapeToggleText'),
    tapeInputsWrap: document.getElementById('tapeInputsWrap'),
    waistInput: document.getElementById('waistInput'),
    hipInput: document.getElementById('hipInput'),
    chestInput: document.getElementById('chestInput'),
    
    cameraInput: document.getElementById('cameraInput'),
    btnLaunchCountdownCamera: document.getElementById('btnLaunchCountdownCamera'),
    btnLaunchNativeFile: document.getElementById('btnLaunchNativeFile'),
    photoPreviewContainer: document.getElementById('photoPreviewContainer'),
    photoPlaceholder: document.getElementById('photoPlaceholder'),
    photoPreviewWrapper: document.getElementById('photoPreviewWrapper'),
    photoPreviewImg: document.getElementById('photoPreviewImg'),
    previewAngleBadge: document.getElementById('previewAngleBadge'),
    btnRetakePhoto: document.getElementById('btnRetakePhoto'),
    btnRemovePhoto: document.getElementById('btnRemovePhoto'),

    countdownCameraModal: document.getElementById('countdownCameraModal'),
    cameraLiveVideo: document.getElementById('cameraLiveVideo'),
    ghostOverlayImg: document.getElementById('ghostOverlayImg'),
    cameraCountdownDisplay: document.getElementById('cameraCountdownDisplay'),
    cameraFlashOverlay: document.getElementById('cameraFlashOverlay'),
    btnCloseCountdownCamera: document.getElementById('btnCloseCountdownCamera'),
    btnCameraTimerToggle: document.getElementById('btnCameraTimerToggle'),
    cameraTimerLabel: document.getElementById('cameraTimerLabel'),
    btnCameraGhostToggle: document.getElementById('btnCameraGhostToggle'),
    btnCameraFlip: document.getElementById('btnCameraFlip'),
    ghostSliderWrap: document.getElementById('ghostSliderWrap'),
    ghostOpacityVal: document.getElementById('ghostOpacityVal'),
    ghostOpacityRange: document.getElementById('ghostOpacityRange'),
    btnCameraShutter: document.getElementById('btnCameraShutter'),
    shutterInnerDelay: document.getElementById('shutterInnerDelay'),

    statLatestWeight: document.getElementById('statLatestWeight'),
    statMovingAvg: document.getElementById('statMovingAvg'),
    statWeeklyRate: document.getElementById('statWeeklyRate'),
    statDate: document.getElementById('statDate'),
    statChange: document.getElementById('statChange'),
    statChangeWrap: document.getElementById('statChangeWrap'),
    statFromStart: document.getElementById('statFromStart'),
    statToTarget: document.getElementById('statToTarget'),
    statTargetVal: document.getElementById('statTargetVal'),
    statEtaValue: document.getElementById('statEtaValue'),
    statEtaSub: document.getElementById('statEtaSub'),
    statBmi: document.getElementById('statBmi'),
    statBmiCategory: document.getElementById('statBmiCategory'),
    btnToggleMA7: document.getElementById('btnToggleMA7'),
    rangeBtns: document.querySelectorAll('.range-btn'),
    weightChartCanvas: document.getElementById('weightChart'),

    timelineContainer: document.getElementById('timelineContainer'),
    timelineCountText: document.getElementById('timelineCountText'),
    filterPhotosOnly: document.getElementById('filterPhotosOnly'),

    compareBeforeSelect: document.getElementById('compareBeforeSelect'),
    compareAfterSelect: document.getElementById('compareAfterSelect'),
    compareSummaryBadge: document.getElementById('compareSummaryBadge'),
    compareWeightDiff: document.getElementById('compareWeightDiff'),
    compareDaysDiff: document.getElementById('compareDaysDiff'),
    compareWaistDiffWrap: document.getElementById('compareWaistDiffWrap'),
    compareWaistDiff: document.getElementById('compareWaistDiff'),
    btnGenerateCollage: document.getElementById('btnGenerateCollage'),
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

    collageModal: document.getElementById('collageModal'),
    btnCloseCollageModal: document.getElementById('btnCloseCollageModal'),
    collageCanvas: document.getElementById('collageCanvas'),
    collageOutputImg: document.getElementById('collageOutputImg'),
    btnDownloadCollage: document.getElementById('btnDownloadCollage'),

    calendarModal: document.getElementById('calendarModal'),
    btnCloseCalendarModal: document.getElementById('btnCloseCalendarModal'),
    calendarStreakBadge: document.getElementById('calendarStreakBadge'),
    btnPrevMonth: document.getElementById('btnPrevMonth'),
    btnNextMonth: document.getElementById('btnNextMonth'),
    calendarMonthTitle: document.getElementById('calendarMonthTitle'),
    calendarDaysGrid: document.getElementById('calendarDaysGrid'),
    calendarSelectedDayInfo: document.getElementById('calendarSelectedDayInfo'),

    settingHeight: document.getElementById('settingHeight'),
    settingTargetWeight: document.getElementById('settingTargetWeight'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),
    btnExportData: document.getElementById('btnExportData'),
    netAddressDisplay: document.getElementById('netAddressDisplay'),

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

  function initDateTimeInput() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    elements.recordDateInput.value = localIso;
  }

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

  let audioCtx = null;
  function playTone(freq = 880, duration = 0.08, type = 'sine') {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playHaptic(pattern = [30]) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

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
        let authResult = null;
        if (mode === 'register') {
          showToast('正在建立您的專屬私人保險箱...');
          authResult = await window.SupabaseService.signUp(email, password);
          try {
            await window.SupabaseService.signIn(email, password);
          } catch (e) {}
        } else if (mode === 'login') {
          showToast('正在驗證密碼...');
          authResult = await window.SupabaseService.signIn(email, password);
        } else {
          showToast('正在驗證並解鎖私人保險箱...');
          try {
            authResult = await window.SupabaseService.signIn(email, password);
          } catch (loginErr) {
            const msg = (loginErr.message || '').toLowerCase();
            if (msg.includes('invalid login credentials') || msg.includes('user not found') || msg.includes('invalid_grant')) {
              showToast('初次使用，正在為您建立專屬保險箱...');
              authResult = await window.SupabaseService.signUp(email, password);
              try {
                await window.SupabaseService.signIn(email, password);
              } catch (e) {}
            } else {
              throw loginErr;
            }
          }
        }

        const session = await window.SupabaseService.getSession();
        if (session && session.user) {
          elements.authScreen.classList.add('hidden');
          elements.appContainer.classList.remove('hidden');
          if (elements.currentUserEmail) {
            elements.currentUserEmail.textContent = session.user.email;
          }
          showToast('🎉 私人保險箱已成功解鎖！');
          loadAllData().catch(console.error);
        } else {
          showToast('🎉 保險箱已建立，請點擊登入解鎖！');
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

    elements.authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeAuth('auto');
    });

    if (elements.btnActionLogin) {
      elements.btnActionLogin.addEventListener('click', () => executeAuth('login'));
    }
    if (elements.btnActionRegister) {
      elements.btnActionRegister.addEventListener('click', () => executeAuth('register'));
    }

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

  function initTapeModule() {
    if (elements.toggleTapeCard && elements.tapeInputsWrap) {
      elements.toggleTapeCard.addEventListener('click', () => {
        const isHidden = elements.tapeInputsWrap.classList.contains('hidden');
        if (isHidden) {
          elements.tapeInputsWrap.classList.remove('hidden');
          if (elements.tapeToggleText) elements.tapeToggleText.textContent = '收合 ▴';
        } else {
          elements.tapeInputsWrap.classList.add('hidden');
          if (elements.tapeToggleText) elements.tapeToggleText.textContent = '展開 ▾';
        }
      });
    }
  }

  function initCameraCapture() {
    elements.photoPreviewContainer.addEventListener('click', (e) => {
      if (e.target.closest('#btnRetakePhoto') || e.target.closest('#btnRemovePhoto') || e.target.closest('#btnLaunchNativeFile') || e.target.closest('#btnLaunchCountdownCamera')) return;
      if (!state.selectedPhotoBlob) {
        openCountdownCamera();
      }
    });

    if (elements.btnLaunchCountdownCamera) {
      elements.btnLaunchCountdownCamera.addEventListener('click', (e) => {
        e.stopPropagation();
        openCountdownCamera();
      });
    }

    if (elements.btnLaunchNativeFile) {
      elements.btnLaunchNativeFile.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.cameraInput.click();
      });
    }

    elements.btnRetakePhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      openCountdownCamera();
    });

    elements.btnRemovePhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      clearPhotoPreview();
    });

    elements.cameraInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        showToast('正在優化照片尺寸...');
        const compressedBlob = await compressImage(file, 1600, 0.85);
        state.selectedPhotoBlob = compressedBlob;

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

  function initCountdownCamera() {
    if (elements.btnCloseCountdownCamera) {
      elements.btnCloseCountdownCamera.addEventListener('click', closeCountdownCamera);
    }

    if (elements.btnCameraFlip) {
      elements.btnCameraFlip.addEventListener('click', () => {
        state.cameraFacing = state.cameraFacing === 'environment' ? 'user' : 'environment';
        playTone(660, 0.06);
        playHaptic([20]);
        openCountdownCamera();
      });
    }

    if (elements.btnCameraTimerToggle) {
      elements.btnCameraTimerToggle.addEventListener('click', () => {
        const delays = [3, 5, 10, 0];
        const nextIdx = (delays.indexOf(state.cameraDelay) + 1) % delays.length;
        state.cameraDelay = delays[nextIdx];
        if (elements.cameraTimerLabel) {
          elements.cameraTimerLabel.textContent = state.cameraDelay > 0 ? `${state.cameraDelay}s` : '關閉';
        }
        if (elements.shutterInnerDelay) {
          elements.shutterInnerDelay.textContent = state.cameraDelay > 0 ? `${state.cameraDelay}s` : '即時';
        }
        playTone(720, 0.05);
        playHaptic([15]);
      });
    }

    if (elements.btnCameraGhostToggle) {
      elements.btnCameraGhostToggle.addEventListener('click', () => {
        state.ghostEnabled = !state.ghostEnabled;
        elements.btnCameraGhostToggle.classList.toggle('active', state.ghostEnabled);
        elements.btnCameraGhostToggle.innerHTML = state.ghostEnabled ? '👻 疊影: 開' : '👻 疊影: 關';
        updateGhostOverlay();
        playTone(600, 0.05);
      });
    }

    if (elements.ghostOpacityRange) {
      elements.ghostOpacityRange.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.ghostOpacity = val / 100;
        if (elements.ghostOverlayImg) elements.ghostOverlayImg.style.opacity = state.ghostOpacity;
        if (elements.ghostOpacityVal) elements.ghostOpacityVal.textContent = `${val}%`;
      });
    }

    if (elements.btnCameraShutter) {
      elements.btnCameraShutter.addEventListener('click', triggerCameraShutter);
    }
  }

  async function openCountdownCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('當前環境不支援即時串流相機，為您開啟相簿選擇', true);
      elements.cameraInput.click();
      return;
    }

    try {
      if (state.cameraStream) {
        state.cameraStream.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: state.cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      state.cameraStream = stream;
      elements.cameraLiveVideo.srcObject = stream;
      await elements.cameraLiveVideo.play();

      if (state.cameraFacing === 'user') {
        elements.cameraLiveVideo.style.transform = 'scaleX(-1)';
      } else {
        elements.cameraLiveVideo.style.transform = 'none';
      }

      updateGhostOverlay();
      elements.countdownCameraModal.classList.remove('hidden');
      playHaptic([25]);

    } catch (err) {
      console.warn('getUserMedia error:', err);
      showToast('無法調用鏡頭（可能未授予相機權限），已為您切換至檔案選擇', true);
      elements.cameraInput.click();
    }
  }

  function updateGhostOverlay() {
    if (!state.ghostEnabled) {
      if (elements.ghostOverlayImg) elements.ghostOverlayImg.classList.add('hidden');
      if (elements.ghostSliderWrap) elements.ghostSliderWrap.classList.add('hidden');
      return;
    }

    const photoRecords = state.allRecords.filter(r => (r.photo_path || r.photo_url) && (r.photo_angle === state.selectedPhotoAngle || !r.photo_angle));
    photoRecords.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
    const prevRecord = photoRecords[0];

    if (prevRecord) {
      const url = getRecordPhotoUrl(prevRecord);
      if (url && elements.ghostOverlayImg) {
        elements.ghostOverlayImg.src = url;
        elements.ghostOverlayImg.style.opacity = state.ghostOpacity;
        elements.ghostOverlayImg.classList.remove('hidden');
        if (elements.ghostSliderWrap) elements.ghostSliderWrap.classList.remove('hidden');
        return;
      }
    }

    if (elements.ghostOverlayImg) elements.ghostOverlayImg.classList.add('hidden');
    if (elements.ghostSliderWrap) elements.ghostSliderWrap.classList.add('hidden');
  }

  function closeCountdownCamera() {
    if (state.activeCountdownInterval) {
      clearInterval(state.activeCountdownInterval);
      state.activeCountdownInterval = null;
    }
    if (elements.cameraCountdownDisplay) elements.cameraCountdownDisplay.classList.add('hidden');
    if (elements.btnCameraShutter) elements.btnCameraShutter.disabled = false;

    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(t => t.stop());
      state.cameraStream = null;
    }
    if (elements.cameraLiveVideo) elements.cameraLiveVideo.srcObject = null;
    if (elements.countdownCameraModal) elements.countdownCameraModal.classList.add('hidden');
  }

  function triggerCameraShutter() {
    if (state.activeCountdownInterval) return;

    if (state.cameraDelay === 0) {
      capturePhotoBlob();
      return;
    }

    elements.btnCameraShutter.disabled = true;
    let remaining = state.cameraDelay;
    elements.cameraCountdownDisplay.textContent = remaining;
    elements.cameraCountdownDisplay.classList.remove('hidden');
    elements.cameraCountdownDisplay.classList.remove('pulse');
    void elements.cameraCountdownDisplay.offsetWidth;
    elements.cameraCountdownDisplay.classList.add('pulse');
    playTone(880, 0.08);
    playHaptic([30]);

    state.activeCountdownInterval = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        elements.cameraCountdownDisplay.textContent = remaining;
        elements.cameraCountdownDisplay.classList.remove('pulse');
        void elements.cameraCountdownDisplay.offsetWidth;
        elements.cameraCountdownDisplay.classList.add('pulse');
        playTone(880, 0.08);
        playHaptic([30]);
      } else {
        clearInterval(state.activeCountdownInterval);
        state.activeCountdownInterval = null;
        elements.cameraCountdownDisplay.classList.add('hidden');
        elements.btnCameraShutter.disabled = false;
        capturePhotoBlob();
      }
    }, 1000);
  }

  function capturePhotoBlob() {
    playTone(1760, 0.2, 'square');
    playHaptic([60, 40, 60]);

    if (elements.cameraFlashOverlay) {
      elements.cameraFlashOverlay.classList.remove('hidden');
      setTimeout(() => elements.cameraFlashOverlay.classList.add('hidden'), 200);
    }

    const video = elements.cameraLiveVideo;
    const vW = (video && video.videoWidth) ? video.videoWidth : 1280;
    const vH = (video && video.videoHeight) ? video.videoHeight : 720;
    const canvas = document.createElement('canvas');
    let w = vW, h = vH;
    const maxDim = 1600;
    if (w > maxDim || h > maxDim) {
      if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
      else { w = Math.round((w * maxDim) / h); h = maxDim; }
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    if (state.cameraFacing === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob((blob) => {
      if (!blob) {
        showToast('拍照失敗，請重試', true);
        closeCountdownCamera();
        return;
      }
      state.selectedPhotoBlob = blob;
      elements.photoPreviewImg.src = URL.createObjectURL(blob);
      elements.photoPlaceholder.classList.add('hidden');
      elements.photoPreviewWrapper.classList.remove('hidden');
      closeCountdownCamera();
      showToast('📸 讀秒拍攝完成！相片不存入手機相簿');
    }, 'image/jpeg', 0.88);
  }

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
      const waist = (elements.waistInput && elements.waistInput.value) ? parseFloat(elements.waistInput.value) : null;
      const hip = (elements.hipInput && elements.hipInput.value) ? parseFloat(elements.hipInput.value) : null;
      const chest = (elements.chestInput && elements.chestInput.value) ? parseFloat(elements.chestInput.value) : null;

      const recordDate = elements.recordDateInput.value || new Date().toISOString();
      const note = elements.noteInput.value.trim();
      const tags = Array.from(state.selectedTags).join(',');

      const btnText = elements.btnSubmitRecord.querySelector('.btn-text');
      const btnSpinner = elements.btnSubmitRecord.querySelector('.btn-spinner');
      btnText.classList.add('hidden');
      btnSpinner.classList.remove('hidden');
      elements.btnSubmitRecord.disabled = true;

      try {
        if (window.SupabaseService && window.SupabaseService.isConfigured()) {
          let photoPath = null;

          if (state.selectedPhotoBlob) {
            showToast('正在加密上傳至私人保險箱...');
            const uploadResult = await window.SupabaseService.uploadPhoto(state.selectedPhotoBlob);
            photoPath = uploadResult.path;
          }

          await window.SupabaseService.createRecord({
            weight: weight,
            body_fat: bodyFat,
            waist_cm: waist,
            hip_cm: hip,
            chest_cm: chest,
            record_date: recordDate,
            note: note,
            tags: tags,
            photo_path: photoPath,
            photo_angle: state.selectedPhotoAngle
          });

          showToast('🎉 私人記錄已加密儲存！');
        } else {
          const formData = new FormData();
          formData.append('weight', weight);
          if (bodyFat !== null) formData.append('body_fat', bodyFat);
          if (waist !== null) formData.append('waist_cm', waist);
          if (hip !== null) formData.append('hip_cm', hip);
          if (chest !== null) formData.append('chest_cm', chest);
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

        playTone(1046, 0.1);
        setTimeout(() => playTone(1318, 0.16), 110);
        playHaptic([40, 30, 60]);

        elements.noteInput.value = '';
        if (elements.waistInput) elements.waistInput.value = '';
        if (elements.hipInput) elements.hipInput.value = '';
        if (elements.chestInput) elements.chestInput.value = '';
        state.selectedTags.clear();
        elements.tagChips.forEach(c => c.classList.remove('active'));
        clearPhotoPreview();
        initDateTimeInput();

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

  async function loadAllData() {
    try {
      if (window.SupabaseService && window.SupabaseService.isConfigured()) {
        const user = await window.SupabaseService.getCurrentUser();
        if (!user) {
          elements.appContainer.classList.add('hidden');
          elements.authScreen.classList.remove('hidden');
          return;
        }

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

      if (!elements.weightInput.value && state.stats && state.stats.latest) {
        elements.weightInput.value = state.stats.latest.weight.toFixed(1);
      }

      renderTimeline();
      updateStreakDisplay();
      if (state.currentTab === 'tab-trends') {
        renderChart(state.chartRange);
      }
      refreshComparisonOptions();

    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  function updateStatsView() {
    const s = state.stats;
    if (!s || !s.latest) {
      elements.statLatestWeight.textContent = '--';
      if (elements.statMovingAvg) elements.statMovingAvg.textContent = '--';
      if (elements.statWeeklyRate) elements.statWeeklyRate.textContent = '週速率: --';
      elements.statDate.textContent = '尚無記錄';
      elements.statChange.textContent = '--';
      elements.statFromStart.textContent = '起始: -- kg';
      elements.statToTarget.textContent = '--';
      elements.statTargetVal.textContent = '目標: -- kg';
      if (elements.statEtaValue) elements.statEtaValue.textContent = '--';
      if (elements.statEtaSub) elements.statEtaSub.textContent = '持續記錄後預測';
      elements.statBmi.textContent = '--';
      return;
    }

    elements.statLatestWeight.textContent = Number(s.latest.weight).toFixed(1);
    elements.statDate.textContent = s.latest.record_date.replace('T', ' ');

    const diff = s.weight_change;
    elements.statChange.textContent = (diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`);
    elements.statChangeWrap.className = 'stat-value ' + (diff < 0 ? 'stat-diff-neg' : (diff > 0 ? 'stat-diff-pos' : ''));
    elements.statFromStart.textContent = `起始: ${s.earliest ? Number(s.earliest.weight).toFixed(1) : '--'} kg`;

    const target = s.target_weight || 65.0;
    const gap = s.latest.weight - target;
    elements.statTargetVal.textContent = `目標: ${Number(target).toFixed(1)} kg`;
    if (gap > 0) {
      elements.statToTarget.textContent = `-${gap.toFixed(1)}`;
    } else {
      elements.statToTarget.textContent = `達成! 🎉`;
    }

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

    if (state.allRecords.length > 0) {
      const sorted = [...state.allRecords].sort((a, b) => new Date(a.record_date) - new Date(b.record_date));
      const latestTime = new Date(s.latest.record_date).getTime();
      const sevenDaysAgo = latestTime - 6 * 24 * 60 * 60 * 1000;
      const recentRecords = sorted.filter(r => {
        const t = new Date(r.record_date).getTime();
        return t >= sevenDaysAgo && t <= latestTime;
      });
      const recentSum = recentRecords.reduce((acc, curr) => acc + Number(curr.weight), 0);
      const latestMA = parseFloat((recentSum / (recentRecords.length || 1)).toFixed(1));

      if (elements.statMovingAvg) {
        elements.statMovingAvg.textContent = latestMA.toFixed(1);
      }

      const priorCutoff = sevenDaysAgo - 7 * 24 * 60 * 60 * 1000;
      const priorRecords = sorted.filter(r => {
        const t = new Date(r.record_date).getTime();
        return t >= priorCutoff && t < sevenDaysAgo;
      });

      let weeklyRate = null;
      if (priorRecords.length > 0) {
        const priorSum = priorRecords.reduce((acc, curr) => acc + Number(curr.weight), 0);
        const priorMA = priorSum / priorRecords.length;
        weeklyRate = parseFloat((latestMA - priorMA).toFixed(1));
      } else if (sorted.length >= 2) {
        const earliest = sorted[0];
        const spanDays = Math.max(1, (latestTime - new Date(earliest.record_date).getTime()) / (24 * 3600 * 1000));
        weeklyRate = parseFloat(((s.latest.weight - earliest.weight) / (spanDays / 7)).toFixed(1));
      }

      if (elements.statWeeklyRate) {
        if (weeklyRate !== null && !isNaN(weeklyRate)) {
          elements.statWeeklyRate.textContent = weeklyRate < 0 ? `週速率: ${weeklyRate.toFixed(1)} kg/週` : `週速率: +${weeklyRate.toFixed(1)} kg/週`;
        } else {
          elements.statWeeklyRate.textContent = '週速率: 持續記錄中';
        }
      }

      if (elements.statEtaValue) {
        if (s.latest.weight <= target) {
          elements.statEtaValue.textContent = '已達標! 🎉';
          if (elements.statEtaSub) elements.statEtaSub.textContent = '恭喜達成目標體重';
        } else if (weeklyRate !== null && weeklyRate < 0) {
          const weeksLeft = (s.latest.weight - target) / (-weeklyRate);
          const etaDate = new Date(Date.now() + weeksLeft * 7 * 24 * 60 * 60 * 1000);
          elements.statEtaValue.textContent = `${etaDate.getMonth() + 1}/${etaDate.getDate()} (約 ${Math.ceil(weeksLeft)} 週)`;
          if (elements.statEtaSub) elements.statEtaSub.textContent = '依近期速率預估';
        } else {
          elements.statEtaValue.textContent = '--';
          if (elements.statEtaSub) elements.statEtaSub.textContent = '需更多下降數據';
        }
      }
    }
  }

  function initChartControls() {
    elements.rangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.rangeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.chartRange = btn.dataset.days;
        renderChart(state.chartRange);
      });
    });

    if (elements.btnToggleMA7) {
      elements.btnToggleMA7.addEventListener('click', () => {
        state.chartShowMA7 = !state.chartShowMA7;
        elements.btnToggleMA7.classList.toggle('active', state.chartShowMA7);
        elements.btnToggleMA7.textContent = `MA7 均線: ${state.chartShowMA7 ? '開' : '關'}`;
        renderChart(state.chartRange);
      });
    }
  }

  function renderChart(daysRange) {
    if (!elements.weightChartCanvas || !window.Chart) return;

    let records = [...state.allRecords];
    if (records.length === 0) return;

    const allChronological = [...state.allRecords].sort((a, b) => new Date(a.record_date) - new Date(b.record_date));

    const now = new Date();
    if (daysRange !== 'all') {
      const days = parseInt(daysRange, 10);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      records = records.filter(r => new Date(r.record_date) >= cutoff);
    }

    records.sort((a, b) => new Date(a.record_date) - new Date(b.record_date));

    const labels = records.map(r => {
      const d = new Date(r.record_date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const dataPoints = records.map(r => Number(r.weight));

    const ma7Points = records.map(r => {
      const rTime = new Date(r.record_date).getTime();
      const startTime = rTime - 6 * 24 * 60 * 60 * 1000;
      const windowRecords = allChronological.filter(item => {
        const t = new Date(item.record_date).getTime();
        return t >= startTime && t <= rTime;
      });
      const sum = windowRecords.reduce((acc, curr) => acc + Number(curr.weight), 0);
      return parseFloat((sum / (windowRecords.length || 1)).toFixed(1));
    });

    const targetWeight = (state.stats && state.stats.target_weight) ? Number(state.stats.target_weight) : 65.0;

    const ctx = elements.weightChartCanvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    if (state.chartInstance) {
      state.chartInstance.destroy();
    }

    const datasets = [
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
      }
    ];

    if (state.chartShowMA7) {
      datasets.push({
        label: '7日均線 (MA7)',
        data: ma7Points,
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderDash: [5, 4],
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
        tension: 0.35
      });
    }

    datasets.push({
      label: '目標體重',
      data: new Array(labels.length).fill(targetWeight),
      borderColor: 'rgba(6, 182, 212, 0.6)',
      borderWidth: 1.5,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false
    });

    state.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
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

      const tapeBadges = [
        record.waist_cm ? `<span class="timeline-tape-badge">腰 ${record.waist_cm}cm</span>` : '',
        record.hip_cm ? `<span class="timeline-tape-badge">臀 ${record.hip_cm}cm</span>` : '',
        record.chest_cm ? `<span class="timeline-tape-badge">胸 ${record.chest_cm}cm</span>` : ''
      ].filter(Boolean).join('');

      return `
        <div class="timeline-card" data-id="${record.id}">
          <div class="timeline-card-header">
            <span class="timeline-date">${dateStr}</span>
            <span class="timeline-weight-wrap">${Number(record.weight).toFixed(1)} <small style="font-size:14px;color:#94a3b8">kg</small></span>
          </div>

          ${photoHtml}

          <div class="timeline-card-body">
            ${record.body_fat ? `<div style="font-size:12px;color:#06b6d4;margin-bottom:6px">體脂率: ${record.body_fat}%</div>` : ''}
            ${tapeBadges ? `<div class="timeline-tape-badges">${tapeBadges}</div>` : ''}
            ${tagsHtml ? `<div class="timeline-tags">${tagsHtml}</div>` : ''}
            ${record.note ? `<p class="timeline-note">${escapeHtml(record.note)}</p>` : ''}
          </div>

          <div class="timeline-card-footer">
            <button type="button" class="btn-delete-record" data-id="${record.id}" data-path="${record.photo_path || ''}">刪除記錄</button>
          </div>
        </div>
      `;
    }).join('');

    elements.timelineContainer.querySelectorAll('.timeline-photo-wrap').forEach(wrap => {
      wrap.addEventListener('click', () => {
        const photoUrl = wrap.dataset.photo;
        const info = wrap.dataset.info;
        openPhotoModal(photoUrl, info);
      });
    });

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

    if (elements.btnGenerateCollage) {
      elements.btnGenerateCollage.addEventListener('click', generateTransformationCollage);
    }

    if (elements.btnCloseCollageModal) {
      elements.btnCloseCollageModal.addEventListener('click', () => {
        elements.collageModal.classList.add('hidden');
      });
    }

    elements.collageModal.addEventListener('click', (e) => {
      if (e.target === elements.collageModal) elements.collageModal.classList.add('hidden');
    });

    if (elements.btnDownloadCollage) {
      elements.btnDownloadCollage.addEventListener('click', () => {
        const url = elements.collageOutputImg.src;
        if (!url) return;
        const a = document.createElement('a');
        a.href = url;
        a.download = `FitTrack-Transformation-${new Date().toISOString().substring(0, 10)}.jpg`;
        a.click();
      });
    }

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

    elements.imgCompareBefore.src = beforeUrl;
    elements.imgCompareAfter.src = afterUrl;
    elements.tagBeforeDate.textContent = `${beforeDate} (${beforeRecord.weight}kg)`;
    elements.tagAfterDate.textContent = `${afterDate} (${afterRecord.weight}kg)`;

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

    if (beforeRecord.waist_cm && afterRecord.waist_cm) {
      const wDiff = parseFloat((Number(afterRecord.waist_cm) - Number(beforeRecord.waist_cm)).toFixed(1));
      elements.compareWaistDiff.textContent = wDiff <= 0 ? `${wDiff} cm` : `+${wDiff} cm`;
      elements.compareWaistDiffWrap.classList.remove('hidden');
    } else {
      elements.compareWaistDiffWrap.classList.add('hidden');
    }

    elements.compareSummaryBadge.classList.remove('hidden');
  }

  async function generateTransformationCollage() {
    const beforeId = String(elements.compareBeforeSelect.value);
    const afterId = String(elements.compareAfterSelect.value);

    const beforeRecord = state.allRecords.find(r => String(r.id) === beforeId);
    const afterRecord = state.allRecords.find(r => String(r.id) === afterId);

    if (!beforeRecord || !afterRecord) {
      showToast('請先選擇 Before 與 After 兩筆紀錄', true);
      return;
    }

    const beforeUrl = getRecordPhotoUrl(beforeRecord);
    const afterUrl = getRecordPhotoUrl(afterRecord);

    if (!beforeUrl || !afterUrl) {
      showToast('所選記錄缺少照片，無法生成海報', true);
      return;
    }

    showToast('✨ 正在繪製高清對比海報...');

    try {
      const [beforeBlob, afterBlob] = await Promise.all([
        fetch(beforeUrl).then(r => r.blob()),
        fetch(afterUrl).then(r => r.blob())
      ]);

      const [imgBefore, imgAfter] = await Promise.all([
        createImageFromBlob(beforeBlob),
        createImageFromBlob(afterBlob)
      ]);

      const canvas = elements.collageCanvas;
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');

      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1350);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#0b0f19');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      const glowGrad = ctx.createRadialGradient(200, 200, 10, 200, 200, 300);
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.14)');
      glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 600, 500);

      const glowGrad2 = ctx.createRadialGradient(880, 200, 10, 880, 200, 300);
      glowGrad2.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
      glowGrad2.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glowGrad2;
      ctx.fillRect(500, 0, 600, 500);

      ctx.fillStyle = '#10b981';
      roundRect(ctx, 440, 42, 200, 32, 16);
      ctx.fill();

      ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('FitTrack TRANSFORMATION', 540, 64);

      ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('體 態 蛻 變 對 比 記 錄', 540, 116);

      ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('持 之 以 恆 • 見 證 每 一 步 蛻 變', 540, 146);

      const cardW = 470;
      const cardH = 820;
      const cardY = 175;
      const leftX = 50;
      const rightX = 560;

      drawPhotoCard(ctx, imgBefore, leftX, cardY, cardW, cardH, 'BEFORE', beforeRecord);
      drawPhotoCard(ctx, imgAfter, rightX, cardY, cardW, cardH, 'AFTER', afterRecord);

      const bannerX = 50;
      const bannerY = 1025;
      const bannerW = 980;
      const bannerH = 170;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      roundRect(ctx, bannerX, bannerY, bannerW, bannerH, 24);
      ctx.fill();
      ctx.stroke();

      const diffVal = parseFloat((Number(afterRecord.weight) - Number(beforeRecord.weight)).toFixed(1));
      const daysCount = Math.abs(Math.round((new Date(afterRecord.record_date) - new Date(beforeRecord.record_date)) / (1000 * 60 * 60 * 24)));

      let waistDiff = null;
      if (beforeRecord.waist_cm && afterRecord.waist_cm) {
        waistDiff = (afterRecord.waist_cm - beforeRecord.waist_cm).toFixed(1);
      }

      const colCount = waistDiff !== null ? 3 : 2;
      const colWidth = bannerW / colCount;

      ctx.textAlign = 'center';
      ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('體 重 變 化', bannerX + colWidth * 0.5, bannerY + 48);

      ctx.font = '900 48px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = diffVal <= 0 ? '#10b981' : '#f43f5e';
      ctx.fillText((diffVal <= 0 ? `${diffVal} kg` : `+${diffVal} kg`), bannerX + colWidth * 0.5, bannerY + 110);

      ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('蛻 變 歷 時', bannerX + colWidth * 1.5, bannerY + 48);

      ctx.font = '900 48px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${daysCount} 天`, bannerX + colWidth * 1.5, bannerY + 110);

      if (colCount === 3) {
        ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('腰 圍 縮 減', bannerX + colWidth * 2.5, bannerY + 48);

        ctx.font = '900 48px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = waistDiff <= 0 ? '#f59e0b' : '#f43f5e';
        ctx.fillText((waistDiff <= 0 ? `${waistDiff} cm` : `+${waistDiff} cm`), bannerX + colWidth * 2.5, bannerY + 110);
      }

      ctx.restore();

      ctx.textAlign = 'center';
      ctx.font = '500 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.fillText('🔒 FitTrack 私人體態保險箱 • 專屬端對端隱私加密存儲', 540, 1260);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      elements.collageOutputImg.src = dataUrl;
      elements.collageModal.classList.remove('hidden');
      showToast('🎉 對比海報已生成！');

    } catch (err) {
      console.error('Collage error:', err);
      showToast('生成海報失敗：' + err.message, true);
    }
  }

  function createImageFromBlob(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawPhotoCard(ctx, img, x, y, w, h, label, record) {
    ctx.save();
    roundRect(ctx, x, y, w, h, 20);
    ctx.clip();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, w, h);

    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let sW, sH, sX, sY;
    if (imgRatio > boxRatio) {
      sH = img.height;
      sW = img.height * boxRatio;
      sX = (img.width - sW) / 2;
      sY = 0;
    } else {
      sW = img.width;
      sH = img.width / boxRatio;
      sX = 0;
      sY = (img.height - sH) / 2;
    }
    ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h);

    const grad = ctx.createLinearGradient(x, y + h - 220, x, y + h);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.7)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y + h - 220, w, 220);

    const badgeBg = label === 'BEFORE' ? 'rgba(71, 85, 105, 0.88)' : 'rgba(16, 185, 129, 0.9)';
    ctx.fillStyle = badgeBg;
    roundRect(ctx, x + 20, y + 20, 110, 36, 18);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + 75, y + 44);

    const dateStr = record.record_date.substring(0, 10);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(dateStr, x + 24, y + h - 90);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 38px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`${Number(record.weight).toFixed(1)} kg`, x + 24, y + h - 45);

    const subDetails = [];
    if (record.body_fat) subDetails.push(`體脂 ${record.body_fat}%`);
    if (record.waist_cm) subDetails.push(`腰圍 ${record.waist_cm}cm`);
    if (subDetails.length > 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(subDetails.join(' • '), x + 24, y + h - 18);
    }

    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 20);
    ctx.stroke();
    ctx.restore();
  }

  function computeStreak(records) {
    if (!records || records.length === 0) return 0;
    const dateSet = new Set(records.map(r => r.record_date.substring(0, 10)));
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let checkDate = new Date(now);
    let key = toKey(checkDate);
    if (!dateSet.has(key)) {
      checkDate.setDate(checkDate.getDate() - 1);
      key = toKey(checkDate);
      if (!dateSet.has(key)) return 0;
    }

    let streak = 0;
    while (dateSet.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      key = toKey(checkDate);
    }
    return streak;
  }

  function updateStreakDisplay() {
    const streak = computeStreak(state.allRecords);
    if (elements.streakCount) elements.streakCount.textContent = streak;
    if (elements.calendarStreakBadge) elements.calendarStreakBadge.textContent = streak;
  }

  function initCalendarModule() {
    if (elements.btnOpenCalendar) {
      elements.btnOpenCalendar.addEventListener('click', () => {
        elements.calendarModal.classList.remove('hidden');
        renderMonthlyCalendar();
      });
    }

    if (elements.btnCloseCalendarModal) {
      elements.btnCloseCalendarModal.addEventListener('click', () => {
        elements.calendarModal.classList.add('hidden');
      });
    }

    elements.calendarModal.addEventListener('click', (e) => {
      if (e.target === elements.calendarModal) {
        elements.calendarModal.classList.add('hidden');
      }
    });

    if (elements.btnPrevMonth) {
      elements.btnPrevMonth.addEventListener('click', () => {
        state.calendarMonth--;
        if (state.calendarMonth < 0) {
          state.calendarMonth = 11;
          state.calendarYear--;
        }
        renderMonthlyCalendar();
      });
    }

    if (elements.btnNextMonth) {
      elements.btnNextMonth.addEventListener('click', () => {
        state.calendarMonth++;
        if (state.calendarMonth > 11) {
          state.calendarMonth = 0;
          state.calendarYear++;
        }
        renderMonthlyCalendar();
      });
    }
  }

  function renderMonthlyCalendar() {
    if (!elements.calendarDaysGrid || !elements.calendarMonthTitle) return;

    elements.calendarMonthTitle.textContent = `${state.calendarYear} 年 ${state.calendarMonth + 1} 月`;

    const firstDayIndex = new Date(state.calendarYear, state.calendarMonth, 1).getDay();
    const daysInMonth = new Date(state.calendarYear, state.calendarMonth + 1, 0).getDate();

    const sortedChronological = [...state.allRecords].sort((a, b) => new Date(a.record_date) - new Date(b.record_date));
    const lowestDates = new Set();
    let minWeight = Infinity;
    sortedChronological.forEach(r => {
      const w = Number(r.weight);
      if (w < minWeight) {
        minWeight = w;
        lowestDates.add(r.record_date.substring(0, 10));
      }
    });

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    let gridHtml = '';

    for (let i = 0; i < firstDayIndex; i++) {
      gridHtml += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${state.calendarYear}-${pad(state.calendarMonth + 1)}-${pad(day)}`;
      const dayRecords = state.allRecords.filter(r => r.record_date.startsWith(dateKey));
      const hasWeight = dayRecords.length > 0;
      const hasPhoto = dayRecords.some(r => r.photo_path || r.photo_url);
      const isLowest = lowestDates.has(dateKey);
      const isToday = dateKey === todayKey;

      let dots = '';
      if (hasWeight) dots += '<i class="dot dot-green"></i>';
      if (hasPhoto) dots += '<i class="dot dot-purple"></i>';
      if (isLowest) dots += '<i class="dot dot-star">⭐</i>';

      gridHtml += `
        <div class="calendar-day ${hasWeight ? 'has-record' : ''} ${isToday ? 'today' : ''}" data-date="${dateKey}">
          <span class="day-num">${day}</span>
          <div class="day-indicators">${dots}</div>
        </div>
      `;
    }

    elements.calendarDaysGrid.innerHTML = gridHtml;

    elements.calendarDaysGrid.querySelectorAll('.calendar-day[data-date]').forEach(cell => {
      cell.addEventListener('click', () => {
        elements.calendarDaysGrid.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');

        const dateKey = cell.dataset.date;
        state.selectedCalendarDate = dateKey;
        renderCalendarDayDetails(dateKey);
      });
    });
  }

  function renderCalendarDayDetails(dateKey) {
    if (!elements.calendarSelectedDayInfo) return;

    const records = state.allRecords.filter(r => r.record_date.startsWith(dateKey));
    if (records.length === 0) {
      elements.calendarSelectedDayInfo.innerHTML = `
        <div style="font-weight:700; color:#fff; font-size:14px; margin-bottom:4px;">${dateKey}</div>
        <div style="color:var(--text-secondary); font-size:12px;">該日尚無體態紀錄</div>
      `;
      elements.calendarSelectedDayInfo.classList.remove('hidden');
      return;
    }

    const cardsHtml = records.map(r => {
      const photoUrl = getRecordPhotoUrl(r);
      const photoThumb = photoUrl
        ? `<div class="cal-thumb-wrap" data-photo="${escapeHtml(photoUrl)}" data-info="${dateKey} • ${r.weight}kg">
             <img src="${escapeHtml(photoUrl)}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;cursor:pointer;">
           </div>`
        : '';

      const tapeInfo = [
        r.waist_cm ? `腰: ${r.waist_cm}cm` : '',
        r.hip_cm ? `臀: ${r.hip_cm}cm` : '',
        r.chest_cm ? `胸: ${r.chest_cm}cm` : ''
      ].filter(Boolean).join(' • ');

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); border-radius:10px; padding:8px 12px; margin-top:6px;">
          <div>
            <div style="font-size:16px; font-weight:800; color:#10b981;">${Number(r.weight).toFixed(1)} <small style="font-size:12px; color:#94a3b8;">kg</small></div>
            ${r.body_fat ? `<div style="font-size:12px; color:#38bdf8;">體脂: ${r.body_fat}%</div>` : ''}
            ${tapeInfo ? `<div style="font-size:12px; color:#f59e0b;">${tapeInfo}</div>` : ''}
            ${r.note ? `<div style="font-size:12px; color:#cbd5e1; margin-top:2px;">${escapeHtml(r.note)}</div>` : ''}
          </div>
          ${photoThumb}
        </div>
      `;
    }).join('');

    elements.calendarSelectedDayInfo.innerHTML = `
      <div style="font-weight:700; color:#fff; font-size:14px; margin-bottom:4px;">📅 ${dateKey} (共 ${records.length} 筆)</div>
      ${cardsHtml}
    `;
    elements.calendarSelectedDayInfo.classList.remove('hidden');

    elements.calendarSelectedDayInfo.querySelectorAll('.cal-thumb-wrap').forEach(wrap => {
      wrap.addEventListener('click', () => {
        openPhotoModal(wrap.dataset.photo, wrap.dataset.info);
      });
    });
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

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  initDateTimeInput();
  initNavigation();
  initSteppers();
  initTagChips();
  initAngleSelector();
  initTapeModule();
  initCameraCapture();
  initCountdownCamera();
  initFormSubmit();
  initChartControls();
  initTimelineFilter();
  initComparisonModule();
  initCalendarModule();
  initSupabaseControls();
  initSettingsHandlers();
  initQrModal();

  initAuthFlow();
});
