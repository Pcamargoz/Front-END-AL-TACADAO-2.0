import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function HomePage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <main className="page page-center fade-in">
        <div className="glass-card shimmer-wrap">
          <p className="muted">Carregando sessão…</p>
          <div className="shimmer-bar" />
        </div>
      </main>
    );
  }

  if (user) {
    return (
      <main className="page page-wide fade-in">
        <header className="top-bar float-in">
          <div className="brand-row">
            <div className="logo-mark sm" />
            <div>
              <p className="eyebrow">Painel</p>
              <h1 className="title-xl">Olá, {user.nome}</h1>
            </div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
            Sair
          </button>
        </header>

        <div className="dashboard-grid">
          <section className="glass-card card-enter glow-border">
            <h2 className="title-md">Sessão ativa</h2>
            <dl className="kv">
              <div>
                <dt>Login</dt>
                <dd className="mono">{user.login}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Roles</dt>
                <dd>
                  <span className="chip-row flat">
                    {user.roles?.map((r) => (
                      <span key={r} className="chip chip-static">
                        {r}
                      </span>
                    ))}
                  </span>
                </dd>
              </div>
            </dl>
            <p className="muted small">
              Cookie de sessão <code className="inline-code">JSESSIONID</code> via proxy do Vite — mesma origem em{" "}
              <code className="inline-code">localhost:3000</code>.
            </p>
          </section>

          <section className="glass-card card-enter delay-1">
            <h2 className="title-md">Próximos passos</h2>
            <ul className="checklist">
              <li>Consumir <code className="inline-code">GET /cadastro</code> e demais rotas com a sessão atual.</li>
              <li>Backend em <strong>:8080</strong> · Swagger em <code className="inline-code">/swagger-ui.html</code></li>
            </ul>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="page page-hero fade-in">
      <div className="hero-grid">
        <div className="hero-copy float-in">
          <p className="eyebrow">Controle · Estoque · Fornecedores</p>
          <h1 className="title-hero">
            Uma entrada <span className="text-gradient">elegante</span> para a sua API.
          </h1>
          <p className="lead">
            Autenticação por sessão integrada ao Spring Security, cadastro via{" "}
            <code className="inline-code">UsuarioController</code> e interface com acabamento profissional.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary btn-glow" to="/login">
              Entrar
            </Link>
            <Link className="btn btn-secondary" to="/cadastro">
              Cadastrar
            </Link>
          </div>
        </div>

        <div className="glass-card card-enter hero-card delay-1 glow-border">
          <h2 className="title-md">Fluxo</h2>
          <ol className="steps">
            <li>
              <span className="step-num">1</span>
              <div>
                <strong>Cadastro</strong>
                <p className="muted small">POST JSON em <code className="inline-code">/cadastro</code></p>
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div>
                <strong>Login</strong>
                <p className="muted small">Form urlencoded em <code className="inline-code">/api/login</code></p>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div>
                <strong>Sessão</strong>
                <p className="muted small">GET <code className="inline-code">/api/auth/me</code> após F5</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
