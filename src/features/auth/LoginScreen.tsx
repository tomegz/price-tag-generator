import { useState, type FormEvent } from "react";
import Button from "../../design-system/Button";
import Icon from "../../design-system/Icon";
import TextField from "../../design-system/TextField";

type LoginScreenProps = {
  error: string;
  loading: boolean;
  onLogin(email: string, password: string): Promise<void>;
};

const LoginScreen = ({ error, loading, onLogin }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    try {
      await onLogin(email, password);
    } catch {
      setSubmitError("Nieprawidłowy email lub hasło.");
    }
  };

  const visibleError = error || submitError;

  return (
    <main className="login-screen">
      <section aria-labelledby="login-title" className="login-card">
        <div className="login-card__brand">
          <Icon name="bike" size={27} />
          <strong>Profi Bike</strong>
          <span className="login-card__badge pb-mono">CENNIK</span>
        </div>

        <p className="login-card__kicker pb-mono">PROFI BIKE · INTERNAL</p>
        <h1 id="login-title">Zaloguj się</h1>

        <form className="login-card__form" onSubmit={handleSubmit}>
          <TextField
            autoComplete="email"
            id="email"
            label="Email"
            onChange={event => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <TextField
            autoComplete="current-password"
            id="password"
            label="Hasło"
            onChange={event => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          {visibleError ? (
            <p className="login-card__error" role="alert">
              {visibleError}
            </p>
          ) : null}

          <Button className="login-card__submit" disabled={loading} icon="arrow-r" type="submit">
            {loading ? "Logowanie..." : "Zaloguj"}
          </Button>
        </form>
      </section>
    </main>
  );
};

export default LoginScreen;
