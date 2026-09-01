/* ============================================================
   Ce que l'application redemande au serveur, et ce qu'elle laisse
   tranquille.

   « La performance n'est pas encore de notre côté. »

   Le plus gros coupable n'était pas une requête lente, c'était leur
   NOMBRE. Après chaque écriture, l'application appelait
   « invalidateQueries() » sans clé : tout ce qui était ouvert était
   refait. Corriger la légende d'une photo redemandait les
   soixante-quatre membres avec leurs grades, les salons, les
   messages, les notifications, les présences et le journal d'accès.
   Sur la ligne d'Antananarivo, cela se compte en secondes, et chaque
   liste repassait par son écran de chargement — l'application
   « clignotait » après chaque geste.

   Chaque écriture nomme maintenant ce qu'elle périme. Ce fichier
   tient cette promesse, parce qu'elle est invisible : rien à l'écran
   ne distingue « on a rechargé l'annuaire pour rien » de « on ne l'a
   pas rechargé ». Sans ces tests, le blanc-seing reviendrait à la
   première correction, et personne ne s'en apercevrait avant le
   club.
   ============================================================ */
import { beforeEach, describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Club } from '../src/ecrans/Club';
import { brancherServeur, poser, recues, reinitialiser } from './serveur';
import { PROFIL_ADMIN, rendre } from './rendu';

beforeEach(() => {
  reinitialiser();
  brancherServeur();
});

/* Combien de fois une table a été LUE. Ce qu'on compte ici, ce sont
   les rechargements — pas les écritures. */
const lectures = (table: string) =>
  recues.filter((r) => r.table === table && r.methode === 'GET').length;

describe('une écriture ne redemande que ce qu’elle a changé', () => {
  test('changer la présentation ne recharge pas les horaires', async () => {
    /* L'ÉCRAN DU CLUB SERT DE TÉMOIN, et il le fait bien : il lit
       DEUX choses sans rapport l'une avec l'autre — les réglages et
       les horaires — et n'en écrit qu'une.

       Ce détail décide de la valeur du test. Mon premier essai
       écrivait un album sur un écran qui ne lisait QUE les albums :
       avec ou sans la correction, une seule requête repartait, et le
       test passait dans les deux cas. Il ne prouvait rien. Un test
       qui ne peut pas échouer est pire qu'absent — il rassure.

       Ici la correction se voit : les réglages repartent, les
       horaires restent. */
    poser({
      reglages: [{ cle: 'presentation', valeur: 'Ancien texte.' }],
      horaires: []
    });
    rendre(<Club />, { profil: PROFIL_ADMIN });
    await screen.findByLabelText('Modifier la présentation');

    const avantReglages = lectures('reglages');
    const avantHoraires = lectures('horaires');

    await userEvent.click(screen.getByLabelText('Modifier la présentation'));
    await userEvent.type(await screen.findByLabelText('Présentation du club'), ' Ajout.');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    /* Les réglages, oui : c'est ce qui vient de changer. */
    await waitFor(() => expect(lectures('reglages')).toBeGreaterThan(avantReglages));
    /* Les horaires, non — et c'est tout l'objet de la correction. */
    expect(lectures('horaires')).toBe(avantHoraires);
  });
});

describe('aucune écriture ne garde le blanc-seing', () => {
  test('« invalidateQueries() » sans clé ne revient nulle part', async () => {
    /* Un test qui lit le code plutôt que de l'exécuter, et c'est
       voulu : le défaut est une seule ligne, elle peut réapparaître
       dans n'importe lequel des trente points d'écriture, et
       éprouver les trente un par un coûterait plus cher que ce que
       cela rapporte.

       « invalidateQueries() » nu — sans argument — refait TOUT.
       Avec une clé, il ne refait que ce qui la porte. On interdit
       donc la forme nue, partout. */
    const sources = import.meta.glob('../src/**/*.{ts,tsx}', {
      eager: true,
      query: '?raw',
      import: 'default'
    }) as Record<string, string>;

    /* Les COMMENTAIRES sont retirés d'abord. Sans cela, le contrôle
       s'attrapait lui-même : le commentaire qui explique le défaut
       cite « invalidateQueries() » en toutes lettres, et le fichier
       corrigé était désigné comme fautif. Un contrôle qui accuse
       l'explication de la correction ne sert à rien — il apprend
       seulement à ne plus écrire de commentaires. */
    const sansCommentaires = (code: string) =>
      code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

    const fautifs = Object.entries(sources)
      .filter(([, code]) => /invalidateQueries\(\s*\)/.test(sansCommentaires(code)))
      .map(([chemin]) => chemin);

    expect(fautifs).toEqual([]);
  });
});
