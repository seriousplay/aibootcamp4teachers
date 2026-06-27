/* ===== 认证模块：登录/注册/登出 UI 与逻辑 ===== */

const AUTH = (function() {

  function renderAuthPage() {
    const overlay = document.createElement('div');
    overlay.className = 'auth-overlay';
    overlay.id = 'authOverlay';
    overlay.innerHTML = `
      <div class="auth-card">
        <div class="auth-logo">
          <h1>AI赋能教学实操培训</h1>
          <p>微学习平台 · 学员登录</p>
        </div>
        <div class="auth-tabs">
          <div class="auth-tab active" id="tabLogin" onclick="AUTH.switchTab('login')">登录</div>
          <div class="auth-tab" id="tabRegister" onclick="AUTH.switchTab('register')">注册</div>
        </div>

        <!-- 登录表单 -->
        <div class="auth-form active" id="formLogin">
          <div class="form-group">
            <label class="form-label">手机号</label>
            <input class="form-input" id="loginPhone" type="tel" placeholder="请输入手机号" maxlength="11" onkeydown="if(event.key==='Enter')AUTH.doLogin()">
          </div>
          <div class="form-group">
            <label class="form-label">密码</label>
            <input class="form-input" id="loginPwd" type="password" placeholder="请输入密码" onkeydown="if(event.key==='Enter')AUTH.doLogin()">
          </div>
          <div class="form-error" id="loginError"></div>
          <button class="auth-btn" onclick="AUTH.doLogin()">登 录</button>
        </div>

        <!-- 注册表单 -->
        <div class="auth-form" id="formRegister">
          <div class="form-group">
            <label class="form-label">姓名</label>
            <input class="form-input" id="regName" type="text" placeholder="请输入您的姓名">
          </div>
          <div class="form-group">
            <label class="form-label">手机号</label>
            <input class="form-input" id="regPhone" type="tel" placeholder="请输入手机号" maxlength="11">
          </div>
          <div class="form-group">
            <label class="form-label">密码</label>
            <input class="form-input" id="regPwd" type="password" placeholder="设置密码（至少6位）">
          </div>
          <div class="form-error" id="regError"></div>
          <button class="auth-btn" onclick="AUTH.doRegister()">注 册</button>
        </div>

        <div class="auth-footer">
          首次使用请先注册 · 培训现场可快速注册
        </div>

        <div class="auth-mode-badge">
          <div class="mode-indicator ${API.mode === 'online' ? 'mode-online' : 'mode-offline'}" id="authModeBadge">
            <span class="mode-dot"></span>
            <span>${API.mode === 'online' ? '云端模式' : '本地模式'}</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function removeAuthPage() {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.remove();
  }

  function switchTab(tab) {
    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
    document.getElementById('formLogin').classList.toggle('active', tab === 'login');
    document.getElementById('formRegister').classList.toggle('active', tab === 'register');
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('regError').classList.remove('show');
  }

  function validatePhone(phone) {
    return /^1\d{10}$/.test(phone);
  }

  async function doLogin() {
    const phone = document.getElementById('loginPhone').value.trim();
    const pwd = document.getElementById('loginPwd').value;
    const errEl = document.getElementById('loginError');

    if (!validatePhone(phone)) { errEl.textContent = '请输入正确的手机号'; errEl.classList.add('show'); return; }
    if (!pwd) { errEl.textContent = '请输入密码'; errEl.classList.add('show'); return; }

    try {
      const data = await API.login(phone, pwd);
      removeAuthPage();
      APP.onLoginSuccess(data.user);
    } catch(e) {
      errEl.textContent = e.message || '登录失败';
      errEl.classList.add('show');
    }
  }

  async function doRegister() {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const pwd = document.getElementById('regPwd').value;
    const errEl = document.getElementById('regError');

    if (!name) { errEl.textContent = '请输入姓名'; errEl.classList.add('show'); return; }
    if (!validatePhone(phone)) { errEl.textContent = '请输入正确的手机号'; errEl.classList.add('show'); return; }
    if (pwd.length < 6) { errEl.textContent = '密码至少6位'; errEl.classList.add('show'); return; }

    try {
      const data = await API.register(phone, pwd, name);
      removeAuthPage();
      APP.onLoginSuccess(data.user);
    } catch(e) {
      errEl.textContent = e.message || '注册失败';
      errEl.classList.add('show');
    }
  }

  function doLogout() {
    API.logout();
    location.reload();
  }

  return { renderAuthPage, removeAuthPage, switchTab, doLogin, doRegister, doLogout };
})();
