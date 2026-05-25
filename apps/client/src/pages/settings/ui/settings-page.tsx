import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUser } from '@/features/auth/queries';
import {
  performUpdateName,
  performChangePassword,
  performInitiateEmailChange,
  performDeleteAccount,
  performLogout,
} from '@/features/auth/session';
import { ScreenBackground } from '@/shared/ui/screen-background';
import { TopBar } from '@/pages/dashboard/ui/top-bar';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';
import { Button } from '@/shared/ui/button';
import { PasswordStrength } from '@/shared/ui/password-strength';

/* ── Shared class strings ── */
const section =
  'grid grid-cols-[200px_1fr] gap-12 border-t border-hairline py-9 last-of-type:border-b last-of-type:border-hairline max-[720px]:grid-cols-1 max-[720px]:gap-4 max-[720px]:py-7';
const label = 'pt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-fg-dim max-[720px]:pt-0';
const num = 'mt-1.5 block text-[9px] tracking-[0.1em] text-fg-dimmer';
const h2 = 'mb-1.5 text-lg font-medium tracking-[-0.005em] text-foreground';
const desc = 'mb-5 max-w-[44ch] text-[13px] leading-relaxed text-fg-dim';
const field = 'mb-4';
const fieldLabel =
  'mb-1.5 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-fg-dim';
const fieldError =
  'mt-1 min-h-[14px] truncate font-mono text-[10px] uppercase tracking-[0.08em] text-danger';
const readout =
  'flex items-center justify-between break-all border border-dashed border-hairline-strong bg-white/[0.015] px-[14px] py-3 font-mono text-[11px] tracking-[0.08em] text-fg-dim';
const readoutCopy =
  'ml-3 shrink-0 cursor-pointer border-none bg-transparent p-0 font-mono text-[9px] uppercase tracking-[0.2em] text-fg-dim transition-colors hover:text-foreground';
const btnDanger =
  'inline-flex cursor-pointer items-center gap-2.5 border border-danger bg-transparent px-[22px] py-[11px] font-mono text-[11px] uppercase tracking-[0.2em] text-danger transition-colors hover:bg-danger hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none';

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
  label: labelText = 'SAVE CHANGES',
}: {
  state: SaveState;
  errorMsg: string;
  label?: string;
}) {
  return (
    <div className="mt-5 flex items-center gap-3.5">
      <Button type="submit" disabled={state === 'saving'}>
        {state === 'saving' ? 'SAVING…' : labelText}
      </Button>
      {state === 'saved' && (
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-foreground" />
          SAVED · JUST NOW
        </span>
      )}
      {state === 'error' && (
        <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-danger">
          · {errorMsg || 'COULD NOT SAVE'}
        </span>
      )}
      {state === 'idle' && (
        <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dimmer">
          · UNSAVED
        </span>
      )}
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
    trigger(() => performUpdateName(userId, name.trim()));
  };

  return (
    <section className={section}>
      <div className={label}>
        · PROFILE
        <span className={num}>01 / 03</span>
      </div>
      <div>
        <h2 className={h2}>Display name</h2>
        <p className={desc}>How you appear to collaborators and on shared work.</p>
        <form onSubmit={onSubmit}>
          <div className={field}>
            <div className={fieldLabel}>DISPLAY NAME</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-invalid={!!error}
            />
            {error && <div className={fieldError}>{error}</div>}
          </div>
          <SaveBar state={state} errorMsg={errorMsg} />
        </form>
      </div>
    </section>
  );
}

/* ── Email section ── */
function EmailSection({
  userId,
  email,
  pendingEmail,
}: {
  userId: string;
  email: string;
  pendingEmail?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { state, errorMsg, trigger } = useSaveState();

  const copy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('VALID EMAIL REQUIRED');
      return;
    }
    if (trimmed === email.toLowerCase()) {
      setEmailError('NEW EMAIL MUST DIFFER FROM CURRENT');
      return;
    }
    setEmailError('');
    trigger(async () => {
      await performInitiateEmailChange(userId, trimmed);
      setNewEmail('');
    });
  };

  return (
    <section className={section}>
      <div className={label}>
        · EMAIL
        <span className={num}>02 / 03</span>
      </div>
      <div>
        <h2 className={h2}>Email address</h2>
        <p className={desc}>Used for sign-in and account recovery.</p>
        <div className={readout}>
          <span>{email}</span>
          <button type="button" className={readoutCopy} onClick={copy}>
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>

        {pendingEmail && (
          <div className="mt-3 border border-dashed border-hairline-strong px-[14px] py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
            VERIFICATION PENDING · CHECK INBOX FOR{' '}
            <span className="text-foreground">{pendingEmail}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6">
          <div className={field}>
            <div className={fieldLabel}>NEW EMAIL ADDRESS</div>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              aria-invalid={!!emailError}
            />
            {emailError && <div className={fieldError}>{emailError}</div>}
          </div>
          <SaveBar state={state} errorMsg={errorMsg} label="SEND VERIFICATION" />
        </form>
      </div>
    </section>
  );
}

/* ── Password section ── */
function PasswordSection({ userId }: { userId: string }) {
  const navigate = useNavigate();
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
      await performChangePassword(userId, current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setTimeout(() => {
        performLogout();
        navigate('/signin', { replace: true });
      }, 1600);
    });
  };

  return (
    <section className={section}>
      <div className={label}>
        · PASSWORD
        <span className={num}>03 / 03</span>
      </div>
      <div>
        <h2 className={h2}>Password</h2>
        <p className={desc}>
          Choose something memorable but not obvious. We'll sign you out of other devices after a
          successful change.
        </p>
        <form onSubmit={onSubmit}>
          <div className={field}>
            <div className={fieldLabel}>CURRENT PASSWORD</div>
            <PasswordInput
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••••••"
              aria-invalid={!!errors.current}
            />
            {errors.current && <div className={fieldError}>{errors.current}</div>}
          </div>
          <div className={field}>
            <div className={fieldLabel}>
              NEW PASSWORD
              <span className="text-[9px] normal-case tracking-[0.05em] text-fg-dimmer">
                6+ CHARACTERS
              </span>
            </div>
            <PasswordInput
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="••••••••••••"
              aria-invalid={!!errors.next}
            />
            <PasswordStrength value={next} />
            {errors.next && <div className={fieldError}>{errors.next}</div>}
          </div>
          <div className={field}>
            <div className={fieldLabel}>CONFIRM NEW PASSWORD</div>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••••••"
              aria-invalid={!!errors.confirm}
            />
            {errors.confirm && <div className={fieldError}>{errors.confirm}</div>}
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
    <section className={section}>
      <div className={label}>· PASSWORD</div>
      <div>
        <h2 className={h2}>Password</h2>
        <p className={desc}>Password management is handled by your sign-in provider.</p>
        <div className="border border-hairline bg-white/[0.01] px-[14px] py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dimmer">
          SIGNED IN VIA {provider.toUpperCase()} · PASSWORD NOT MANAGED HERE
        </div>
      </div>
    </section>
  );
}

/* ── Danger section ── */
function DangerSection({ onDelete }: { onDelete: () => void }) {
  return (
    <section className={section}>
      <div className={label}>· DANGER</div>
      <div>
        <h2 className={`${h2} text-danger`}>Delete account</h2>
        <p className={desc}>
          Permanently remove your account and all associated projects. This action is irreversible.
        </p>
        <button type="button" className={btnDanger} onClick={onDelete}>
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
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6 backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[460px] border border-hairline-strong bg-[rgba(10,10,10,0.97)] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3.5 top-3.5 flex h-[26px] w-[26px] cursor-pointer items-center justify-center border border-hairline-strong bg-transparent font-mono text-sm text-fg-dim transition-colors hover:border-foreground hover:text-foreground"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="mb-2.5 text-[22px] font-medium tracking-[-0.015em] text-danger">
          Are you sure?
        </h2>
        <p className="mb-[22px] text-[13px] leading-[1.55] text-fg-dim">
          This permanently deletes your account, projects and shared work. Type{' '}
          <span className="font-mono text-foreground">DELETE MY ACCOUNT</span> below to confirm.
        </p>
        <Input
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="DELETE MY ACCOUNT"
          autoFocus
          spellCheck={false}
        />
        <div className="mt-[22px] flex gap-2.5 [&>*]:flex-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            CANCEL
          </Button>
          <button
            type="button"
            className={`${btnDanger} justify-center`}
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
      <div className="flex min-h-dvh items-center justify-center bg-background font-mono text-xs uppercase tracking-widest text-fg-dim">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ScreenBackground />
      <TopBar />

      <main
        className="relative z-10 mx-auto max-w-[720px] px-10 pb-24 pt-14 max-[720px]:px-6 max-[720px]:pb-20 max-[720px]:pt-10"
        data-screen-label="settings / account"
      >
        <Link
          to="/"
          className="group mb-7 inline-flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-dim no-underline transition-colors hover:text-foreground"
        >
          <svg
            className="transition-transform duration-150 group-hover:-translate-x-[3px]"
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

        <header className="mb-14">
          <h1 className="mb-3 font-sans text-[40px] font-medium leading-none tracking-[-0.025em] text-foreground max-[720px]:text-[30px]">
            Settings.
          </h1>
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
            Account · Email · Password
          </div>
        </header>

        <ProfileSection userId={user.id} initialName={user.name} />
        <EmailSection userId={user.id} email={user.email} pendingEmail={user.pendingEmail} />
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
