// Shared styles for the sign-up pages (register + verify-email).
export const BRAND = "#4A3AFF";

export const authCss = `
          @keyframes pageEnterReverse {
            from { opacity: 0; transform: perspective(1200px) rotateY(12deg) translateX(60px); }
            to   { opacity: 1; transform: perspective(1200px) rotateY(0deg) translateX(0); }
          }
          @keyframes pageLeaveReverse {
            from { opacity: 1; transform: perspective(1200px) rotateY(0deg) translateX(0); }
            to   { opacity: 0; transform: perspective(1200px) rotateY(-12deg) translateX(-60px); }
          }
          .auth-card {
            animation: pageEnterReverse 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
            border-radius: 2rem 0.75rem 2rem 0.75rem;
            border: 1px solid var(--border-subtle);
            background: var(--surface-elevated);
            backdrop-filter: blur(20px);
            box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
            transform-origin: right center;
          }
          .auth-card.leaving { animation: pageLeaveReverse 0.48s cubic-bezier(0.22, 1, 0.36, 1) both; }
          .underline-input {
            background: transparent; border: none; border-bottom: 3px solid var(--border-strong);
            border-radius: 0; width: 100%; padding: 0.5rem 0; color: var(--text-primary); font-size: 0.95rem;
            outline: none; transition: border-color 0.25s ease; caret-color: #4A3AFF;
          }
          .underline-input::placeholder { color: var(--text-muted); font-size: 0.875rem; }
          .underline-input:focus { border-bottom-color: #4A3AFF; }
          .underline-input:disabled { opacity: 0.4; cursor: not-allowed; }
          .field-label {
            font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
            color: var(--text-secondary); margin-bottom: 0.35rem; display: block;
          }
          .auth-btn {
            width: 100%; margin-top: 20px; background-color: #4A3AFF; color: white; font-weight: 600;
            padding: 0.8rem 1rem; border-radius: 2rem 0.75rem 2rem 0.75rem; transition: all 0.3s ease;
            letter-spacing: 0.02em; font-size: 0.9rem;
          }
          .auth-btn:hover:not(:disabled) {
            background-color: #3628e0; box-shadow: 0 0 28px #4A3AFF55; transform: translateY(-1px);
          }
          .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .auth-btn-ghost {
            width: 100%; margin-top: 12px; background: transparent; color: var(--text-secondary);
            font-weight: 500; padding: 0.6rem 1rem; border-radius: 2rem 0.75rem 2rem 0.75rem;
            border: 1px solid var(--border-subtle); font-size: 0.85rem; transition: all 0.25s ease;
          }
          .auth-btn-ghost:hover:not(:disabled) { background: var(--border-subtle); }
          .auth-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
          .google-btn {
            width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.75rem;
            padding: 0.75rem 1rem; border: 1px solid #4A3AFF; border-radius: 2rem 0.75rem 2rem 0.75rem;
            color: #fff; font-weight: 600; font-size: 0.9rem; background: #4A3AFF;
            transition: all 0.25s ease;
          }
          .google-btn:hover:not(:disabled) { background: #3628e0; box-shadow: 0 0 28px #4A3AFF55; transform: translateY(-1px); }
          .google-icon {
            width: 26px; height: 26px; border-radius: 999px; background: #fff;
            display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .google-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .divider-line { display: flex; align-items: center; gap: 1rem; margin: 1.25rem 0; }
          .divider-line::before, .divider-line::after { content: ''; flex: 1; height: 1px; background: var(--border-subtle); }
          .divider-line span { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 0.05em; }
          .page-switch-link { color: #4A3AFF; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
          .page-switch-link:hover { opacity: 0.75; }
          .toast-wrap {
            position: fixed; top: 5.5rem; right: 1rem; z-index: 60; max-width: 22rem; width: 90%;
            animation: slideIn 0.3s ease both;
          }
          @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
          .rule-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--text-muted); }
          .rule-item.met { color: #4A3AFF; }
          [data-theme="dark"] .rule-item.met { color: #a59dff; }
          .back-link {
            display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;
            color: var(--text-muted); background: none; border: none; cursor: pointer; margin-bottom: 1rem;
          }
          .back-link:hover { color: var(--text-primary); }
          .modal-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 70;
            display: flex; align-items: center; justify-content: center; padding: 1rem;
            animation: fadeIn 0.2s ease both;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .modal-box {
            background: var(--surface-elevated); border: 1px solid var(--border-subtle); border-radius: 1.5rem;
            padding: 2rem; max-width: 26rem; width: 100%; box-shadow: 0 32px 80px rgba(0,0,0,0.8);
          }
        `;
