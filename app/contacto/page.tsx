import type { Metadata } from 'next';
import { Building2, ClipboardCheck, MailQuestion, MapPin } from 'lucide-react';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contacto | Rankea Refaccionarias',
  description: 'Contacta a Rankea Refaccionarias para agregar, reclamar o actualizar la ficha de una refaccionaria en México.',
};

export default function ContactPage() {
  return (
    <main>
      <section className="page-hero contact-hero">
        <div className="wrap">
          <p className="breadcrumb"><a href="/">Inicio</a> / Contacto</p>
          <span className="eyebrow"><MailQuestion size={15} /> Contacto</span>
          <h1>Contacta a Rankea Refaccionarias</h1>
          <p className="lead">
            Usa este formulario para solicitar alta de negocios, correcciones de fichas, actualización de datos o propuestas relacionadas con el directorio.
          </p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="wrap contact-layout">
          <article className="contact-panel">
            <h2>Envíanos tu mensaje</h2>
            <p>
              La forma está preparada para recibir solicitudes. De momento el envío automático todavía no está activo; la integración de correo se conectará después.
            </p>
            <ContactForm />
          </article>

          <aside className="contact-aside" aria-label="Tipos de solicitud">
            <div>
              <Building2 size={24} aria-hidden="true" />
              <b>Agregar refaccionaria</b>
              <p>Solicita incluir una tienda de autopartes, refaccionaria o proveedor automotriz.</p>
            </div>
            <div>
              <ClipboardCheck size={24} aria-hidden="true" />
              <b>Actualizar ficha</b>
              <p>Envía correcciones de nombre, teléfono, dirección, horarios, sitio web o categoría.</p>
            </div>
            <div>
              <MapPin size={24} aria-hidden="true" />
              <b>Mejorar cobertura</b>
              <p>Comparte información de negocios en ciudades o estados que todavía no están completos.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
