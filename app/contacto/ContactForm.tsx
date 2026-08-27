'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { Send } from 'lucide-react';

export function ContactForm() {
  const [status, setStatus] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Tu mensaje quedó listo para enviarse. Pronto habilitaremos esta función.');
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Nombre
          <input name="name" type="text" autoComplete="name" placeholder="Tu nombre" required />
        </label>
        <label>
          Correo
          <input name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
        </label>
      </div>

      <label>
        Asunto
        <select name="subject" defaultValue="Agregar o actualizar refaccionaria" required>
          <option>Agregar o actualizar refaccionaria</option>
          <option>Corrección de datos</option>
          <option>Publicidad o colaboración</option>
          <option>Otro asunto</option>
        </select>
      </label>

      <label>
        Mensaje
        <textarea name="message" rows={7} placeholder="Cuéntanos qué necesitas revisar o agregar." required />
      </label>

      <button className="btn" type="submit">
        <Send size={18} aria-hidden="true" />
        Enviar mensaje
      </button>

      {status ? <p className="form-status" role="status">{status}</p> : null}
    </form>
  );
}
