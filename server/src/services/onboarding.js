/**
 * Persistência JSON do onboarding (REQ-046).
 * Extraído de app/server/onboardingPlugin.js (BP-001 E5).
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {string} rootDir — raiz do repo CEO (pai de executive/)
 */
export function criarOnboardingStore(rootDir) {
  const dir = path.join(rootDir, 'executive', 'onboarding');

  function garantir() {
    fs.mkdirSync(dir, { recursive: true });
  }

  function carregar() {
    garantir();
    const perfilPath = path.join(dir, 'perfil.json');
    const transPath = path.join(dir, 'transcricao.json');
    let perfil = null;
    let transcricao = [];
    if (fs.existsSync(perfilPath)) {
      perfil = JSON.parse(fs.readFileSync(perfilPath, 'utf8'));
    }
    if (fs.existsSync(transPath)) {
      transcricao = JSON.parse(fs.readFileSync(transPath, 'utf8'));
    }
    return { perfil, transcricao };
  }

  function salvar({ perfil, transcricao }) {
    garantir();
    if (perfil) {
      fs.writeFileSync(
        path.join(dir, 'perfil.json'),
        JSON.stringify(perfil, null, 2) + '\n',
        'utf8',
      );
    }
    if (transcricao) {
      fs.writeFileSync(
        path.join(dir, 'transcricao.json'),
        JSON.stringify(transcricao, null, 2) + '\n',
        'utf8',
      );
    }
  }

  return { dir, carregar, salvar };
}
