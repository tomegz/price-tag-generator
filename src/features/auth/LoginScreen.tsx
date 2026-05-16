import { useState, type FormEvent } from "react";
import BrandMark from "@/design-system/BrandMark";
import Button from "@/design-system/Button";
import TextField from "@/design-system/TextField";
import LoginWheelBackdrop from "./LoginWheelBackdrop";

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
      setSubmitError("Nieprawidłowy e-mail lub hasło.");
    }
  };

  const visibleError = error || submitError;

  return (
    <main className="login-screen">
      <LoginWheelBackdrop />
      <section aria-labelledby="login-title" className="login-card">
        <div className="login-card__brand">
          <BrandMark size={26} />
          <strong>Profi Bike</strong>
          <span className="login-card__badge pb-mono">CENNIK</span>
        </div>

        <p className="login-card__kicker pb-mono">Witaj ponownie</p>
        <h1 id="login-title">Zaloguj się</h1>

        <form className="login-card__form" onSubmit={handleSubmit}>
          <TextField
            autoComplete="email"
            id="email"
            label="E-mail"
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

        <p className="login-card__footer">
          Wewnętrzne narzędzie sklepu · v2.0
        </p>
      </section>
    </main>
  );
};

export default LoginScreen;
