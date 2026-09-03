/* ============================================================
   Le matricule, et ce qu'on en fait.

   Le club écrit « F04x042 ». Les membres taperont « f04x 042 »,
   « F04X042 », ou colleront un espace de trop. Une connexion qui
   échoue sur une casse est une connexion perdue, et le membre
   appellera le responsable pour un problème qui n'existe pas.
   ============================================================ */
import { describe, expect, test } from 'vitest';
import { identifiantDepuisMatricule, normaliserMatricule } from '../src/services/supabase';
import { heureCourte, initiales } from '../src/services/messagerie';

describe('normaliserMatricule', () => {
  test('met en capitales', () => {
    expect(normaliserMatricule('f04x042')).toBe('F04X042');
  });

  test('retire les espaces, où qu’ils soient', () => {
    expect(normaliserMatricule(' F04x 042 ')).toBe('F04X042');
    expect(normaliserMatricule('F04x\t042\n')).toBe('F04X042');
  });

  test('une saisie vide reste vide, pour être refusée plus haut', () => {
    /* L'écran de connexion s'en sert pour dire « entrez votre
       numéro » plutôt que d'envoyer une requête vide au serveur. */
    expect(normaliserMatricule('   ')).toBe('');
  });
});

describe('identifiantDepuisMatricule', () => {
  test('compose une adresse en minuscules', () => {
    /* Cette adresse n'est jamais envoyée ni affichée : c'est un
       identifiant, pas un moyen de contact. Le service
       d'authentification travaille par courriel, le club par
       matricule. */
    expect(identifiantDepuisMatricule('F04x042')).toBe('f04x042@waishi.local');
  });

  test('tolère un espace résiduel', () => {
    expect(identifiantDepuisMatricule(' F04X042 ')).toBe('f04x042@waishi.local');
  });
});

describe('initiales', () => {
  test('deux mots donnent deux lettres', () => {
    expect(initiales('Ceintures vertes')).toBe('CV');
    expect(initiales('Tournoi régional')).toBe('TR');
  });

  test('les articles ne prennent pas la place d’un mot qui compte', () => {
    /* « Tout le club » donnait « TL » : l'article occupait la
       seconde lettre, et la pastille ne se rattachait plus à rien.
       Les deux lettres sont tout ce qu'on a pour reconnaître une
       conversation dans une liste — la maquette écrivait « TC ». */
    expect(initiales('Tout le club')).toBe('TC');
    expect(initiales('Les ceintures noires')).toBe('CN');
    expect(initiales('Sortie au lac')).toBe('SL');
  });

  test('un titre entièrement fait de mots-outils garde ses lettres', () => {
    /* Le repli compte : rendre une pastille vide serait pire que
       rendre deux lettres qui ne disent rien. */
    expect(initiales('Le des')).toBe('LD');
  });

  test('un seul mot donne ses deux premières lettres', () => {
    expect(initiales('Compétition')).toBe('CO');
  });

  test('un titre vide ne fait pas planter la vignette', () => {
    expect(initiales('')).toBe('');
    expect(initiales('   ')).toBe('');
  });
});

describe('heureCourte', () => {
  test('aujourd’hui : l’heure', () => {
    const maintenant = new Date();
    expect(heureCourte(maintenant.toISOString())).toMatch(/^\d{2}:\d{2}$/);
  });

  test('hier : le jour abrégé ou « Hier »', () => {
    const hier = new Date(Date.now() - 30 * 3_600_000);
    /* Entre 24 et 48 heures, la liste dit « Hier ». */
    expect(heureCourte(hier.toISOString())).toBe('Hier');
  });

  test('la semaine passée : le jour de la semaine', () => {
    const avant = new Date(Date.now() - 4 * 86_400_000);
    expect(heureCourte(avant.toISOString())).toMatch(/^(lun|mar|mer|jeu|ven|sam|dim)/);
  });

  test('au-delà : la date en chiffres', () => {
    const vieux = new Date(Date.now() - 40 * 86_400_000);
    expect(heureCourte(vieux.toISOString())).toMatch(/^\d{2}\/\d{2}$/);
  });
});
