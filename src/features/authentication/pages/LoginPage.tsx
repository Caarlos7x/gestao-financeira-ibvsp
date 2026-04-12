import { useAuthContext } from '@/context/AuthContext';
import { loginFormSchema, type LoginFormValues } from '@/features/authentication/schemas/loginFormSchema';
import { Button } from '@/components/ui/buttons';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { ROUTES } from '@/constants/routes';
import { isLocalTestLoginEnabled } from '@/config/localTestAuth';
import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';

export function LoginPage() {
  const { state, signInWithEmailPassword } = useAuthContext();
  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  if (state.status === 'signed_in') {
    return <Navigate to={ROUTES.root} replace />;
  }

  const configMessage =
    state.status === 'config_error' ? state.message : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = loginFormSchema.safeParse(values);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message =
        first.email?.[0] ?? first.password?.[0] ?? UI_MESSAGES_PT_BR.invalidForm;
      setFormError(message);
      return;
    }

    try {
      await signInWithEmailPassword(parsed.data.email, parsed.data.password);
    } catch {
      setFormError(UI_MESSAGES_PT_BR.signInFailed);
    }
  }

  return (
    <Card className="auth-card-max" padded>
      <Text variant="h1">Entrar</Text>
      <Text variant="lead" className="card-integrated-lead">
        {isLocalTestLoginEnabled()
          ? 'Login de desenvolvimento sem Firebase — perfis vêm do mock do repositório.'
          : 'Autenticação com Firebase. Crie no console do Firebase dois usuários de teste com os mesmos e-mails abaixo e defina a senha (sugestão: '}
        {!isLocalTestLoginEnabled() ? (
          <>
            <Text variant="mono" as="span">
              Teste@123
            </Text>
            ).
          </>
        ) : null}
      </Text>
      <ul className="auth-test-users">
        <li>
          <strong>Administrador:</strong>{' '}
          <Text variant="mono" as="span">
            admin@sistema.test
          </Text>{' '}
          — acesso total à organização Igreja Batista - Vila São Pedro.
        </li>
        <li>
          <strong>Operador:</strong>{' '}
          <Text variant="mono" as="span">
            operador@sistema.test
          </Text>{' '}
          — gestão financeira na Igreja Batista - Vila São Pedro (sem permissões de administrador
          da plataforma).
        </li>
      </ul>
      {isLocalTestLoginEnabled() ? (
        <p className="auth-banner" role="status">
          {UI_MESSAGES_PT_BR.loginLocalTestBanner}
        </p>
      ) : null}
      {configMessage ? (
        <p className="auth-banner" role="alert">
          {configMessage}
        </p>
      ) : null}
      {formError ? (
        <p className="auth-error" role="alert">
          {formError}
        </p>
      ) : null}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="field-label" htmlFor="login-email">
          E-mail
          <input
            id="login-email"
            className="field-input"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                email: event.target.value,
              }))
            }
          />
        </label>
        <label className="field-label" htmlFor="login-password">
          Senha
          <input
            id="login-password"
            className="field-input"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                password: event.target.value,
              }))
            }
          />
        </label>
        <Button type="submit">{UI_MESSAGES_PT_BR.continue}</Button>
      </form>
    </Card>
  );
}
