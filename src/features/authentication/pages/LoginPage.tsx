import { useAuthContext } from '@/context/AuthContext';
import { loginFormSchema, type LoginFormValues } from '@/features/authentication/schemas/loginFormSchema';
import { Button } from '@/components/ui/buttons';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { ROUTES } from '@/constants/routes';
import { isLocalTestLoginEnabled } from '@/config/localTestAuth';
import { isFirebaseWebConfigured } from '@/services/firebase/firebaseConfig';
import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import styles from '@/features/authentication/pages/LoginPage.module.css';

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
    } catch (cause: unknown) {
      setFormError(
        cause instanceof Error
          ? cause.message
          : UI_MESSAGES_PT_BR.signInFailed
      );
    }
  }

  const canSubmitWithPassword =
    isFirebaseWebConfigured() || isLocalTestLoginEnabled();

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
      {!canSubmitWithPassword ? (
        <div
          className="auth-banner"
          role="region"
          aria-labelledby="deploy-auth-title"
        >
          <p id="deploy-auth-title" className={styles.deployTitle}>
            {UI_MESSAGES_PT_BR.loginDeployNoFirebaseTitle}
          </p>
          <p className={styles.deployLead}>
            {UI_MESSAGES_PT_BR.loginDeployNoFirebaseBody}
          </p>
          <ul className={`auth-test-users ${styles.deployList}`}>
            <li>{UI_MESSAGES_PT_BR.loginDeployOptionDemo}</li>
            <li>{UI_MESSAGES_PT_BR.loginDeployOptionFirebase}</li>
          </ul>
          <p className={styles.deployFootnote}>
            {UI_MESSAGES_PT_BR.loginFormDisabledNoAuth}
          </p>
        </div>
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
        <Button type="submit" disabled={!canSubmitWithPassword}>
          {UI_MESSAGES_PT_BR.continue}
        </Button>
      </form>
    </Card>
  );
}
