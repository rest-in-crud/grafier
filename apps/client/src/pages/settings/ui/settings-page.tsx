import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUser } from '@/features/auth/queries';
import { performUpdateUser, performDeleteAccount } from '@/features/auth/session';
import { ScreenBackground } from '@/shared/ui/screen-background';
import { TopBar } from '@/pages/dashboard/ui/top-bar';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';
import { Button } from '@/shared/ui/button';
import { PasswordStrength } from '@/shared/ui/password-strength';
import '../settings.css';

/* ── Save state ── */
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function useSaveState() {
  const [state, setState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const trigger = async (fn: () => Promise<void>) => {
    setState('saving');
    setErrorMsg('');
    try {
      await fn();
      setState('saved');
      setTimeout(() => setState('idle'), 2400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not save';
      setErrorMsg(msg);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return { state, errorMsg, trigger };
}

/* ── Save bar ── */
function SaveBar({
  state,
  errorMsg,
  label = 'SAVE CHANGES',
}: {
  state: SaveState;
  errorMsg: string;
  label?: string;
}) {
  return (
    <div className="section-foot">
      <Button type="submit" disabled={state === 'saving'}>
        {state === 'saving' ? 'SAVING…' : label}
      </Button>
      {state === 'saved' && (
        <span className="s-status s-saved">
          <span className="s-ok-dot" />
          SAVED · JUST NOW
        </span>
      )}
      {state === 'error' && (
        <span className="s-status s-error">· {errorMsg || 'COULD NOT SAVE'}</span>
      )}
      {state === 'idle' && <span className="s-status">· UNSAVED CHANGES WILL BE LOST</span>}
    </div>
  );
}

/* ── Profile section ── */
function ProfileSection({ userId, initialName }: { userId: string; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const { state, errorMsg, trigger } = useSaveState();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('NAME IS REQUIRED');
      return;
    }
    setError('');
    trigger(() => performUpdateUser(userId, { name: name.trim() }));
  };

  return (
    <section className="settings-section">
      <div className="s-label">
        · PROFILE
        <span className="s-num">01 / 04</span>
      </div>
      <div className="settings-body-col">
        <h2>Display name</h2>
        <p className="s-desc">How you appear to collaborators and on shared work.</p>
        <form onSubmit={onSubmit}>
          <div className="s-field">
            <div className="s-field-label">DISPLAY NAME</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-invalid={!!error}
            />
            {error && <div className="s-field-error">{error}</div>}
          </div>
          <SaveBar state={state} errorMsg={errorMsg} />
        </form>
      </div>
    </section>
  );
}

/* ── Email section ── */
function EmailSection({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <section className="settings-section">
      <div className="s-label">
        · EMAIL
        <span className="s-num">02 / 04</span>
      </div>
      <div className="settings-body-col">
        <h2>Email address</h2>
        <p className="s-desc">
          Used for sign-in and account recovery. Email changes are not yet supported.
        </p>
        <div className="s-readout">
          <span>{email}</span>
          <button type="button" className="s-readout-copy" onClick={copy}>
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Password section ── */
function PasswordSection({ userId }: { userId: string }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { state, errorMsg, trigger } = useSaveState();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!current) errs.current = 'CURRENT PASSWORD REQUIRED';
    if (next.length < 6) errs.next = 'MIN 6 CHARACTERS';
    if (next !== confirm) errs.confirm = 'PASSWORDS DO NOT MATCH';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    trigger(async () => {
      await performUpdateUser(userId, { password: next });
      setCurrent('');
      setNext('');
      setConfirm('');
    });
  };

  return (
    <section className="settings-section">
      <div className="s-label">
        · PASSWORD
        <span className="s-num">03 / 03</span>
      </div>
      <div className="settings-body-col">
        <h2>Password</h2>
        <p className="s-desc">
          Choose something memorable but not obvious. We'll sign you out of other devices after a
          successful change.
        </p>
        <form onSubmit={onSubmit}>
          <div className="s-field">
            <div className="s-field-label">CURRENT PASSWORD</div>
            <PasswordInput
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••••••"
              aria-invalid={!!errors.current}
            />
            {errors.current && <div className="s-field-error">{errors.current}</div>}
          </div>
          <div className="s-field">
            <div className="s-field-label">
              NEW PASSWORD
              <span className="s-hint">6+ CHARACTERS</span>
            </div>
            <PasswordInput
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="••••••••••••"
              aria-invalid={!!errors.next}
            />
            <PasswordStrength value={next} />
            {errors.next && <div className="s-field-error">{errors.next}</div>}
          </div>
          <div className="s-field">
            <div className="s-field-label">CONFIRM NEW PASSWORD</div>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••••••"
              aria-invalid={!!errors.confirm}
            />
            {errors.confirm && <div className="s-field-error">{errors.confirm}</div>}
          </div>
          <SaveBar state={state} errorMsg={errorMsg} label="UPDATE PASSWORD" />
        </form>
      </div>
    </section>
  );
}

/* ── OAuth password note ── */
function OAuthPasswordNote({ provider }: { provider: string }) {
  return (
    <section className="settings-section">
      <div className="s-label">· PASSWORD</div>
      <div className="settings-body-col">
        <h2>Password</h2>
        <p className="s-desc">Password management is handled by your sign-in provider.</p>
        <div className="s-oauth-note">
          SIGNED IN VIA {provider.toUpperCase()} · PASSWORD NOT MANAGED HERE
        </div>
      </div>
    </section>
  );
}

/* ── Danger section ── */
function DangerSection({ onDelete }: { onDelete: () => void }) {
  return (
    <section className="settings-section danger-zone">
      <div className="s-label">· DANGER</div>
      <div className="settings-body-col">
        <h2>Delete account</h2>
        <p className="s-desc">
          Permanently remove your account and all associated projects. This action is irreversible.
        </p>
        <button type="button" className="btn-danger" onClick={onDelete}>
          DELETE ACCOUNT
        </button>
      </div>
    </section>
  );
}

/* ── Delete confirmation modal ── */
function DeleteModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [phrase, setPhrase] = useState('');
  const ready = phrase.trim().toUpperCase() === 'DELETE MY ACCOUNT';

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>Are you sure?</h2>
        <p>
          This permanently deletes your account, projects and shared work. Type{' '}
          <span style={{ color: 'var(--fg)', fontFamily: 'var(--mono)' }}>DELETE MY ACCOUNT</span>{' '}
          below to confirm.
        </p>
        <Input
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="DELETE MY ACCOUNT"
          autoFocus
          spellCheck={false}
        />
        <div className="modal-btn-row">
          <Button type="button" variant="ghost" onClick={onClose}>
            CANCEL
          </Button>
          <button
            type="button"
            className="btn-danger"
            style={{ justifyContent: 'center' }}
            disabled={!ready}
            onClick={() => {
              if (ready) onConfirm();
            }}
          >
            DELETE PERMANENTLY
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Root page ── */
function SettingsPage() {
  const { user, isPending } = useUser();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!user) return;
    await performDeleteAccount(user.id);
    navigate('/signin', { replace: true });
  };

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-fg-dim font-mono text-xs uppercase tracking-widest">
        Loading…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ScreenBackground />
      <TopBar />

      <main className="settings-stage" data-screen-label="settings / account">
        <Link to="/" className="settings-back">
          <svg
            className="settings-back-arr"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="M6 1 2 5l4 4M2 5h7" />
          </svg>
          Back to Dashboard
        </Link>

        <header className="settings-header">
          <h1>Settings.</h1>
          <div className="settings-sub">Account · Email · Password</div>
        </header>

        <ProfileSection userId={user.id} initialName={user.name} />
        <EmailSection email={user.email} />
        {user.provider === 'local' || !user.provider ? (
          <PasswordSection userId={user.id} />
        ) : (
          <OAuthPasswordNote provider={user.provider} />
        )}
        <DangerSection onDelete={() => setConfirming(true)} />
      </main>

      {confirming && (
        <DeleteModal onClose={() => setConfirming(false)} onConfirm={handleDeleteConfirm} />
      )}
    </div>
  );
}

export { SettingsPage };
