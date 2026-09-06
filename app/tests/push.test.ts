/* ============================================================
   LES NOTIFICATIONS DU TÉLÉPHONE — CE QUI SE VÉRIFIE ICI.

   « not-push — Notification sur le téléphone » : la dernière ligne
   du cahier des charges restée sans preuve.

   ------------------------------------------------------------
   CE QUI NE PEUT PAS SE VÉRIFIER SUR UN BANC, ET IL FAUT LE DIRE

   Qu'un téléphone SONNE demande un téléphone, un projet Firebase et
   un réseau. Rien de tout cela n'est ici, et prétendre le contraire
   serait pire que de ne rien essayer.

   Ce qui se vérifie ici, en revanche, ce sont les endroits où une
   erreur ne se verrait PAS — et ce sont eux qui ont déjà coûté cher
   à ce projet :

     · le jeton retiré APRÈS la déconnexion échouerait en silence,
       et le téléphone continuerait de sonner pour quelqu'un d'autre ;
     · un envoi qui ferait échouer la publication ferait republier
       l'annonce en double ;
     · une étape posée dans un seul des deux workflows produirait
       deux APK de même numéro dont l'un sait ce que l'autre ignore —
       l'écart exact que publier.yml documente après l'avoir subi ;
     · un « vers » venu du réseau et suivi sans contrôle ferait
       sortir l'application vers l'adresse de qui a envoyé.
   ============================================================ */
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* « process.cwd() » et non « import.meta.url » : Vite transforme le
   second, qui ne porte alors pas le vrai chemin sous vitest. Le
   défaut a déjà été rencontré ici même. */
const RACINE = join(process.cwd(), '..');
const lire = (chemin: string) => readFileSync(join(RACINE, chemin), 'utf8');

/* Les commentaires de ce dépôt sont longs et parlent de ce qu'ils
   décrivent : chercher un fragment de code sans les retirer d'abord
   trouve l'explication et croit avoir trouvé le code. Ce faux vert
   s'est déjà produit ici.

   ⚠ ET LE NETTOYAGE DÉPEND DU LANGAGE. Écrit d'un seul tenant, il
   retirait les commentaires de bloc « slash-étoile » de TOUS les
   fichiers — y compris du YAML, qui n'en a pas. Un chemin ordinaire
   comme « apk/release/[étoile].apk » y ouvre alors un faux
   commentaire, que la fermeture correspondante referme plus loin :
   28 000 caractères d'apk.yml tombaient à 3 700, et l'essai
   cherchait dans les ruines.

   Il aurait pu passer au vert tout aussi bien : le fragment cherché
   se trouvait par hasard hors des ruines. C'est le genre d'essai qui
   affirme sans rien vérifier. */
function sansCommentaires(source: string, langage: 'ts' | 'yaml' | 'sql'): string {
  if (langage === 'yaml') return source.replace(/^\s*#.*$/gm, '');
  if (langage === 'sql') return source.replace(/^\s*--.*$/gm, '');
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

describe('la préparation Android', () => {
  test('⚠ les DEUX workflows appellent le même préparatif', () => {
    /* LE POINT. publier.yml porte cet avertissement, écrit après un
       incident réel : « TOUTE ÉTAPE AJOUTÉE À apk.yml … DOIT ÊTRE
       AJOUTÉE ICI AUSSI ». Une permission avait été déclarée dans
       l'APK d'essai et pas dans celui du club : même numéro, même
       apparence, une fonctionnalité en moins d'un côté. On aurait
       cherché le défaut dans le code, où il n'était pas.

       Un commentaire ne fait pas respecter une règle. Cet essai, si. */
    for (const fichier of ['.github/workflows/apk.yml', '.github/workflows/publier.yml']) {
      expect(
        sansCommentaires(lire(fichier), 'yaml'),
        `${fichier} n’appelle pas outils/preparer-push.mjs. Les deux APK ` +
          'divergeraient sans que rien n’échoue.'
      ).toContain('node outils/preparer-push.mjs');
    }
  });

  test('le secret Firebase leur est passé à tous les deux', () => {
    for (const fichier of ['.github/workflows/apk.yml', '.github/workflows/publier.yml']) {
      expect(sansCommentaires(lire(fichier), 'yaml')).toContain(
        'FIREBASE_GOOGLE_SERVICES: ${{ secrets.FIREBASE_GOOGLE_SERVICES }}'
      );
    }
  });

  test('⚠ le préparatif déclare POST_NOTIFICATIONS', () => {
    /* Sans elle, Android 13 et suivants n'affichent RIEN, et
       « requestPermissions » répond « refusé » sans qu'on sache
       pourquoi : la permission n'est pas demandable si elle n'est pas
       déclarée. */
    expect(sansCommentaires(lire('outils/preparer-push.mjs'), 'ts')).toContain(
      'android.permission.POST_NOTIFICATIONS'
    );
  });

  test('sans Firebase, le préparatif RÉUSSIT', () => {
    /* Le club n'a peut-être pas encore de projet Firebase. La
       construction ne doit pas échouer pour autant — sans quoi cette
       fonctionnalité, en arrivant, casserait la seule chaîne de
       distribution que le club possède. */
    const source = sansCommentaires(lire('outils/preparer-push.mjs'), 'ts');
    /* On sort du chemin « pas de secret » sans jamais appeler
       « echouer » : la seule sortie prévue est le message. */
    const sansSecret = source.slice(source.indexOf('if (!secret)'));
    const jusquAuSinon = sansSecret.slice(0, sansSecret.indexOf('} else {'));
    expect(jusquAuSinon).not.toContain('echouer(');
  });
});

describe('le jeton du téléphone', () => {
  test('⚠ il est retiré AVANT la déconnexion, pas après', () => {
    /* La règle d'accès exige que le jeton soit le sien : après le
       « signOut » il n'y a plus de « sien », et la suppression serait
       refusée EN SILENCE. Le téléphone continuerait de sonner pour
       les annonces destinées à quelqu'un qui s'est déconnecté dessus
       — le cas du téléphone partagé au club, celui où cela se voit. */
    const source = sansCommentaires(lire('app/src/services/supabase.ts'), 'ts');
    const retrait = source.indexOf('retirerLeJeton');
    const deconnexion = source.indexOf('auth.signOut()');
    expect(retrait, 'le retrait du jeton a disparu de la déconnexion').toBeGreaterThan(-1);
    expect(
      retrait,
      'le jeton est retiré APRÈS « signOut » : la suppression sera refusée sans rien dire.'
    ).toBeLessThan(deconnexion);
  });

  test('la table des jetons existe, et chacun ne voit que les siens', () => {
    const migration = lire('supabase/migrations/0029_les_jetons_du_telephone.sql');
    expect(migration).toContain('create table if not exists public.jetons_push');
    expect(migration).toContain('enable row level security');
    /* Quatre règles : lire, poser, rafraîchir, retirer — toutes
       limitées à son propre profil. Un jeton désigne un appareil,
       donc une personne. */
    expect(migration.match(/prive\.mon_profil\(\)/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });
});

describe('l’envoi', () => {
  test('⚠ il ne peut pas faire échouer la publication', () => {
    /* L'ordre décide de ce qu'on perd en cas de panne. Les
       notifications sont écrites AVANT : si Firebase est en panne,
       l'annonce est déjà dans le casier de chacun. Faire remonter
       l'erreur amènerait à republier — et une annonce en double vaut
       moins qu'une annonce simple. */
    const source = sansCommentaires(lire('app/src/services/admin.ts'), 'ts');
    const bloc = source.slice(source.indexOf('useNotifierTous'));
    const insertion = bloc.indexOf("from('notifications').insert");
    const envoi = bloc.indexOf("invoke('pousser'");
    expect(envoi, 'l’envoi vers « pousser » a disparu').toBeGreaterThan(-1);
    expect(
      insertion,
      'l’envoi part AVANT l’écriture : une panne de Firebase ferait perdre l’annonce.'
    ).toBeLessThan(envoi);
    /* Et il est bien enveloppé. */
    expect(bloc.slice(envoi - 200, envoi)).toContain('try');
  });

  test('⚠ l’envoi est réservé aux maîtres et à l’administration', () => {
    /* Sans ce contrôle, n'importe quel membre pourrait faire sonner
       soixante-quatre téléphones à trois heures du matin. */
    const source = sansCommentaires(lire('supabase/functions/pousser/index.ts'), 'ts');
    expect(source).toContain("rpc('mon_role')");
    expect(source).toContain("role !== 'admin' && role !== 'maitre'");
  });

  test('sans clé Firebase, la fonction se tait au lieu de se plaindre', () => {
    const source = sansCommentaires(lire('supabase/functions/pousser/index.ts'), 'ts');
    expect(source).toContain('if (!COMPTE_FIREBASE)');
    /* 200 avec un compte honnête, et non une erreur : l'annonce est
       passée par le casier, il n'y a rien à corriger pour qui publie. */
    expect(source).toContain('firebase: false, envoyees: 0');
  });

  test('⚠ les jetons morts sont effacés', () => {
    /* Un jeton meurt sans prévenir. Sans ce ménage, la table se
       remplirait de jetons morts qu'on paierait à chaque annonce, et
       personne ne s'en apercevrait jamais. */
    const source = sansCommentaires(lire('supabase/functions/pousser/index.ts'), 'ts');
    expect(source).toContain('UNREGISTERED');
    expect(source).toContain("from('jetons_push').delete()");
  });

  test('⚠ elle emploie l’API v1, et non celle que Google a fermée', () => {
    /* « fcm.googleapis.com/fcm/send » et sa « clé serveur » ont été
       fermées en juin 2024. Tout exemple trouvé en ligne qui les
       emploie ne marche plus — c'est le piège de cette
       fonctionnalité. */
    const source = lire('supabase/functions/pousser/index.ts');
    expect(source).toContain('/v1/projects/');
    expect(sansCommentaires(source, 'ts')).not.toContain('fcm/send');
  });
});

describe('taper la notification', () => {
  test('⚠ un « vers » venu du réseau ne fait pas sortir l’application', () => {
    /* Le champ voyage avec la notification, donc il vient de qui l'a
       envoyée. Une adresse « https://… » ou « //… » suivie sans
       contrôle emmènerait le membre où l'expéditeur veut. On n'accepte
       qu'un chemin interne. */
    const source = sansCommentaires(lire('app/src/services/notificationsPush.ts'), 'ts');
    expect(source).toContain("vers.startsWith('/')");
    expect(source).toContain("vers.startsWith('//')");
  });
});
