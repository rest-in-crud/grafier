import { Button } from '@/shared/ui/button.tsx';
import { PasswordInput } from '@/shared/ui/password-input.tsx';
import { Field } from '@/shared/ui/field.tsx';

function App() {
  return (
    <div className="mx-auto max-w-md p-8">
      <Field
        label="PASSWORD"
        hintAction={
          <a href="#" className="hover:text-foreground">
            Forgot?
          </a>
        }
      >
        <PasswordInput placeholder="••••••••••••" />
      </Field>
      <Button>Test</Button>
    </div>
  );
}

export default App;
