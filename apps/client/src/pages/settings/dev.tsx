import { useState } from 'react';
import { ScreenBackground } from '@/shared/ui/screen-background';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';
import { Button } from '@/shared/ui/button';
import { PasswordStrength } from '@/shared/ui/password-strength';
import './settings.css';

/* ── Mock users ── */
const MOCK_LOCAL = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'dev@grafier.io',
  name: 'Dev User',
  provider: 'local' as const,
};
const MOCK_OAUTH = {
  id: 'f0e9d8c7-b6a5-4321-fedc-ba0987654321',
  email: 'dev.google@grafier.io',
  name: 'OAuth Dev',
  provider: 'google' as const,
};

type MockUser = typeof MOCK_LOCAL | typeof MOCK_OAUTH;
type SimResponse = 'success' | 'error';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/* ── Simulated save hook ── */
function useMockSave(response: SimResponse) {
  const [state, setState] = useState<SaveState>('idle');

  const trigger = async (onSuccess?: () => void) => {
    setState('saving');
    await new Promise((r) => setTimeout(r, 700));
    if (response === 'success') {
      setState('saved');
      onSuccess?.();
      setTimeout(() => setState('idle'), 2400);
    } else {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return { state, trigger };
}

/* ── Save bar ── */
function SaveBar({ state, label = 'SAVE CHANGES' }: { state: SaveState; label?: string }) {
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
        <span className="s-status s-error">· COULD NOT SAVE · (SIMULATED ERROR)</span>
      )}
      {state === 'idle' && <span className="s-status">· UNSAVED CHANGES WILL BE LOST</span>}
    </div>
  );
}

/* ── Profile section ── */
function ProfileSection({ user, response }: { user: MockUser; response: SimResponse }) {
  const [name, setName] = useState(user.name);
  const [error, setError] = useState('');
  const { state, trigger } = useMockSave(response);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('NAME IS REQUIRED');
      return;
    }
    setError('');
    trigger();
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
          <SaveBar state={state} />
        </form>
      </div>
    </section>
  );
}

/* ── Email section ── */
function EmailSection({ user }: { user: MockUser }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(user.email).then(() => {
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
          <span>{user.email}</span>
          <button type="button" className="s-readout-copy" onClick={copy}>
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Password section ── */
function PasswordSection({ response }: { response: SimResponse }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { state, trigger } = useMockSave(response);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!current) errs.current = 'CURRENT PASSWORD REQUIRED';
    if (next.length < 6) errs.next = 'MIN 6 CHARACTERS';
    if (next !== confirm) errs.confirm = 'PASSWORDS DO NOT MATCH';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    trigger(() => {
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
        <p className="s-desc">We'll sign you out of other devices after a successful change.</p>
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
              NEW PASSWORD <span className="s-hint">6+ CHARACTERS</span>
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
          <SaveBar state={state} label="UPDATE PASSWORD" />
        </form>
      </div>
    </section>
  );
}

/* ── OAuth note ── */
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

/* ── Delete modal (no real action) ── */
function DeleteModal({ onClose }: { onClose: () => void }) {
  const [phrase, setPhrase] = useState('');
  const [done, setDone] = useState(false);
  const ready = phrase.trim().toUpperCase() === 'DELETE MY ACCOUNT';

  if (done) {
    return (
      <div className="modal-back" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <h2 style={{ color: 'var(--fg)' }}>Mock delete complete</h2>
          <p>
            In production this would log you out and remove your account. No real action was taken.
          </p>
          <div className="modal-btn-row">
            <Button type="button" onClick={onClose}>
              CLOSE
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              if (ready) setDone(true);
            }}
          >
            DELETE PERMANENTLY
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Dev control bar ── */
function DevBar({
  scenario,
  onScenario,
  response,
  onResponse,
}: {
  scenario: 'local' | 'oauth';
  onScenario: (s: 'local' | 'oauth') => void;
  response: SimResponse;
  onResponse: (r: SimResponse) => void;
}) {
  const btn = (active: boolean) =>
    `px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] border transition-colors cursor-pointer ${
      active
        ? 'border-foreground bg-foreground text-background'
        : 'border-hairline-strong bg-transparent text-fg-dim hover:text-foreground hover:border-foreground'
    }`;

  return (
    <div className="sticky top-0 z-50 flex items-center gap-6 border-b border-hairline bg-background/95 px-8 py-3 backdrop-blur">
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-dimmer">DEV</span>

      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-fg-dimmer">
          Scenario
        </span>
        <button className={btn(scenario === 'local')} onClick={() => onScenario('local')}>
          Local user
        </button>
        <button className={btn(scenario === 'oauth')} onClick={() => onScenario('oauth')}>
          OAuth user
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-fg-dimmer">
          Save response
        </span>
        <button className={btn(response === 'success')} onClick={() => onResponse('success')}>
          Success
        </button>
        <button className={btn(response === 'error')} onClick={() => onResponse('error')}>
          Error
        </button>
      </div>

      <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.14em] text-fg-dimmer">
        /dev/settings · no real API calls
      </span>
    </div>
  );
}

/* ── Page ── */
function DevSettingsPage() {
  const [scenario, setScenario] = useState<'local' | 'oauth'>('local');
  const [response, setResponse] = useState<SimResponse>('success');
  const [confirming, setConfirming] = useState(false);

  const user = scenario === 'local' ? MOCK_LOCAL : MOCK_OAUTH;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ScreenBackground />
      <DevBar
        scenario={scenario}
        onScenario={setScenario}
        response={response}
        onResponse={setResponse}
      />

      <main className="settings-stage" data-screen-label="dev / settings">
        <header className="settings-header">
          <h1>Settings.</h1>
          <div className="settings-sub">Account · Email · Password</div>
        </header>

        <ProfileSection key={scenario} user={user} response={response} />
        <EmailSection user={user} />
        {user.provider === 'local' ? (
          <PasswordSection key={`pw-${scenario}`} response={response} />
        ) : (
          <OAuthPasswordNote provider={user.provider} />
        )}
        <DangerSection onDelete={() => setConfirming(true)} />
      </main>

      {confirming && <DeleteModal onClose={() => setConfirming(false)} />}
    </div>
  );
}

export { DevSettingsPage };
