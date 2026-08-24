import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rankea Refaccionarias | Directorio nacional de refaccionarias',
  description: 'Encuentra refaccionarias, autopartes y proveedores automotrices en México. Busca por ciudad, ubicación o tipo de refacción.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>
        <header className="nav">
          <div className="wrap navin">
            <a className="brand logo-only" href="/" aria-label="Rankea Refaccionarias">
              <span className="logo-mark logo-horizontal"><img src="/logo_horizontal.png" alt="" /></span>
            </a>
            <nav className="navlinks">
              <a href="/">Inicio</a>
              <a href="/#refaccionarias">Refaccionarias</a>
              <a href="/#estados">Estados</a>
              <a href="/#ciudades">Ciudades</a>
            </nav>
            <a className="nav-cta" href="/#agregar">Agregar mi refaccionaria</a>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="wrap footer-grid">
            <div>
              <b>Rankea Refaccionarias</b>
              <a href="/">Inicio</a>
              <a href="/#refaccionarias">Buscar refaccionarias</a>
              <a href="/#estados">Estados</a>
              <a href="/#ciudades">Ciudades</a>
            </div>
            <div>
              <b>Para negocios</b>
              <a href="/#agregar">Agregar refaccionaria</a>
              <a href="/#agregar">Reclamar negocio</a>
              <a href="/#agregar">Publicidad</a>
            </div>
            <div>
              <b>Información</b>
              <a href="/">Acerca de</a>
              <a href="mailto:ventas@rankearefaccionarias.info">Contacto</a>
              <a href="/">Privacidad</a>
              <a href="/">Términos</a>
            </div>
            <p>Rankea Refaccionarias © 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
