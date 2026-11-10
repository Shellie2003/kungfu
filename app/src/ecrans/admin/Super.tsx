/* ============================================================
   Administration · Super administration

   « Je veux une interface sous forme de panneau de super admin avec
   toutes les fonctionnalités que le super admin seul peut avoir. »

   ------------------------------------------------------------
   CE QUI MANQUAIT, ET CE QUI NE MANQUAIT PAS

   L'inventaire a montré que le super administrateur a exactement
   TROIS pouvoirs de plus qu'un administrateur ordinaire :

     · changer le rôle d'un membre ;
     · suspendre et réactiver un compte ;
     · supprimer définitivement un membre.

   Les trois existaient déjà. Ils étaient dispersés dans deux écrans
   d'administration ordinaires, mêlés à ce que font les cinq autres
   administrateurs du club, et rien ne disait à l'écran « ceci est à
   vous seul ».

   Un QUATRIÈME pouvoir, lui, manquait vraiment : NOMMER un second
   super administrateur. La base l'autorise depuis la migration 0016 ;
   aucun écran ne le proposait. Le club n'avait donc qu'un seul super
   administrateur, et aucun moyen d'en désigner un autre depuis
   l'application — ce qui s'est révélé coûteux le jour où celui-ci
   s'est retrouvé enfermé dehors.

   ------------------------------------------------------------
   ⚠ CE PANNEAU NE RETIRE RIEN À PERSONNE

   C'est le choix du club, et il mérite d'être écrit. Réinitialiser
   un mot de passe reste ouvert à TOUS les administrateurs.

   Le réserver au super administrateur aurait paru plus propre. Ce
   serait un piège : ce bandeau de secours est le seul recours du
   club quand quelqu'un perd son mot de passe. Le 6 septembre 2026,
   le super administrateur s'est retrouvé dehors et aucun des quatre
   autres administrateurs n'a pu l'aider — il a fallu écrire
   directement dans la base. Resserrer encore le droit aurait rendu
   cette situation définitive.

   ------------------------------------------------------------
   ⚠ POURQUOI CET ÉCRAN NE RECOPIE PAS LA LISTE DES COMPTES

   La tentation était de tout refaire ici : la liste, les rôles, la
   réinitialisation, la suspension, la suppression. Un panneau
   complet, d'un seul tenant.

   On ne l'a pas fait, et c'est délibéré. Recopier un écran EN
   SERVICE, c'est créer deux endroits qui doivent dire la même chose
   pour toujours — et ce projet a déjà payé deux fois le prix de la
   divergence : une permission déclarée dans un seul des deux
   workflows, et un commentaire de code qui contredisait le schéma.
   Le second exemplaire ne se corrige jamais en même temps que le
   premier, et personne ne s'en aperçoit.

   Ce panneau porte donc ce qui n'existe nulle part ailleurs — les
   super administrateurs — et conduit, nommément, vers les écrans qui
   portent le reste. Un lien ne peut pas diverger.
   ============================================================ */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avis, Carte, Entete, Etat, Surtitre, Tuile } from '../../ui/base';
import { Icone } from '../../ui/Icone';
import { useComptes, useNommerSuper } from '../../services/admin';
import { useSession } from '../../services/session';

export function AdminSuper() {
  const aller = useNavigate();
  const { data: comptes, isPending, error } = useComptes();
  const nommer = useNommerSuper();
  const moi = useSession((e) => e.profil);
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  /* Ce qu'on s'apprête à retirer, en attente de confirmation. Retirer
     la qualité de super administrateur se fait d'un doigt et se
     rattrape mal : si c'est le sien, on perd l'écran en le quittant. */
  const [aRetirer, setARetirer] = useState<{ id: string; qui: string } | null>(null);

  /* Seuls les administrateurs peuvent être super administrateurs —
     c'est un drapeau PAR-DESSUS le rôle, non un quatrième rôle. Un
     élève dans cette liste n'aurait aucun sens. */
  const administrateurs = useMemo(
    () => (comptes ?? []).filter((c) => c.role === 'admin'),
    [comptes]
  );
  const supers = administrateurs.filter((c) => c.super_admin);

  const agir = async (promesse: Promise<unknown>, texte: string) => {
    setAvis(null);
    try {
      await promesse;
      setAvis({ bon: true, texte });
    } catch (e) {
      /* Le refus se LIT. La base porte des messages écrits pour le
         club — « le club doit garder au moins un super administrateur »
         — et les cacher derrière un « échec » les gâcherait. */
      setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` });
    }
  };

  return (
    <>
      <Entete titre="Super administration" retour={() => aller('/admin')} />

      <div
        style={{
          flexGrow: 1,
          padding: '20px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        {/* ---------------------------------------------------------
            1. LES SUPER ADMINISTRATEURS — la seule chose qui n'existe
            nulle part ailleurs dans l'application.
            --------------------------------------------------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Les super administrateurs</Surtitre>

          <Etat
            chargement={isPending}
            erreur={error}
            vide={administrateurs.length === 0}
            messageVide="Aucun administrateur dans le club."
          >
            <Carte pad={0}>
              {administrateurs.map((c, i) => {
                const cestMoi = c.id === moi?.id;
                /* ⚠ LE DERNIER NE SE RETIRE PAS. La base le refuse
                   (migration 0016) ; l'écran ne le propose pas. Les
                   deux sont nécessaires : l'écran pour ne pas mener à
                   un refus, la base parce qu'un écran ne protège
                   rien. */
                const dernier = c.super_admin && supers.length <= 1;

                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      borderTop: i === 0 ? undefined : '1px solid var(--filet)'
                    }}
                  >
                    <Tuile
                      petite
                      icone={c.super_admin ? 'shield' : 'users'}
                      fond={c.super_admin ? '#0F5132' : undefined}
                      couleur={c.super_admin ? '#FFF' : '#0F5132'}
                    />

                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600 }}>
                        {c.nom} {c.prenom}
                        {cestMoi ? ' · vous' : ''}
                      </p>
                      <p style={{ fontSize: 12, color: '#59685F' }}>
                        {c.numero} ·{' '}
                        {c.super_admin ? 'Super administrateur' : 'Administration'}
                        {c.actif ? '' : ' · suspendu'}
                      </p>
                    </div>

                    {c.super_admin ? (
                      <button
                        className="link"
                        style={{ padding: '0 4px', color: dernier ? '#A8B6AE' : '#8A3B12' }}
                        disabled={dernier || nommer.isPending}
                        aria-label={`Retirer la qualité de super administrateur à ${c.nom} ${c.prenom}`}
                        onClick={() => setARetirer({ id: c.id, qui: `${c.nom} ${c.prenom}` })}
                      >
                        Retirer
                      </button>
                    ) : (
                      <button
                        className="link"
                        style={{ padding: '0 4px' }}
                        disabled={nommer.isPending}
                        aria-label={`Nommer ${c.nom} ${c.prenom} super administrateur`}
                        onClick={() =>
                          agir(
                            nommer.mutateAsync({ profilId: c.id, super_admin: true }),
                            `${c.nom} ${c.prenom} est super administrateur.`
                          )
                        }
                      >
                        Nommer
                      </button>
                    )}
                  </div>
                );
              })}
            </Carte>
          </Etat>

          {supers.length <= 1 && (
            <Avis bon={false}>
              Le club n’a qu’un seul super administrateur. S’il perd son mot de
              passe ou son téléphone, plus personne ne peut nommer de rôle,
              suspendre ni supprimer — et cela ne se rattrape que depuis le
              tableau de bord du serveur. Nommez-en un second.
            </Avis>
          )}
        </div>

        {/* ---------------------------------------------------------
            2. CE QUE VOUS SEUL POUVEZ FAIRE, ET OÙ CELA SE TROUVE.
            --------------------------------------------------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Ce que vous seul pouvez faire</Surtitre>

          <Carte pad={0}>
            {[
              {
                icone: 'users',
                titre: 'Changer le rôle d’un membre',
                texte: 'Élève, maître ou administration — depuis sa fiche, en modification.',
                ou: '/admin/fiches'
              },
              {
                icone: 'lock',
                titre: 'Suspendre et réactiver un compte',
                texte: 'Interdit la connexion sans rien effacer. Réversible.',
                ou: '/admin/comptes'
              },
              {
                icone: 'x',
                titre: 'Supprimer définitivement un membre',
                texte: 'Sans corbeille : la fiche, le grade et l’historique disparaissent.',
                ou: '/admin/comptes'
              }
            ].map((r, i) => (
              <button
                key={r.titre}
                onClick={() => aller(r.ou)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  borderTop: i === 0 ? undefined : '1px solid var(--filet)'
                }}
              >
                <Tuile petite icone={r.icone} />
                <span style={{ flexGrow: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 600 }}>{r.titre}</span>
                  <span style={{ display: 'block', fontSize: 12, color: '#59685F' }}>
                    {r.texte}
                  </span>
                </span>
                <Icone nom="chev" taille={18} couleur="#A8B6AE" />
              </button>
            ))}
          </Carte>
        </div>

        {/* ---------------------------------------------------------
            3. CE QUI EST OUVERT À TOUTE L'ADMINISTRATION, et qu'il
            faut dire ici pour qu'on ne le cherche pas.
            --------------------------------------------------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Ouvert à toute l’administration</Surtitre>

          <Carte pad={16}>
            <p style={{ fontSize: 13, color: '#59685F', lineHeight: '19px' }}>
              <b>Réinitialiser le mot de passe d’un membre</b> se fait depuis
              Comptes et accès, et reste ouvert aux cinq administrateurs du
              club — délibérément.
            </p>
            <p style={{ fontSize: 13, color: '#59685F', lineHeight: '19px', marginTop: 10 }}>
              C’est le seul recours quand quelqu’un perd son mot de passe. Le
              réserver au super administrateur rendrait son propre oubli
              irrattrapable depuis l’application.
            </p>
            <button
              className="link"
              style={{ marginTop: 12 }}
              onClick={() => aller('/admin/comptes')}
            >
              Ouvrir Comptes et accès
            </button>
          </Carte>
        </div>

        {/* ---------------------------------------------------------
            4. LE JOURNAL D'ACCÈS.
            --------------------------------------------------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Le journal d’accès</Surtitre>
          <Carte pad={16}>
            <p style={{ fontSize: 13, color: '#59685F', lineHeight: '19px' }}>
              Qui a ouvert l’espace des maîtres, et quand.
            </p>
            <button
              className="link"
              style={{ marginTop: 12 }}
              onClick={() => aller('/admin/journal')}
            >
              Ouvrir le journal
            </button>
          </Carte>
        </div>
      </div>

      {/* ⚠ LA CONFIRMATION. Retirer la qualité de super administrateur
          se fait d'un doigt, et se rattrape mal : retirée à soi-même,
          on perd cet écran en le quittant, et il faut un AUTRE super
          administrateur pour revenir en arrière. */}
      {aRetirer && (
        <div className="voile" role="dialog" aria-modal="true">
          <div className="feuille" style={{ padding: 20 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>
              Retirer la qualité de super administrateur ?
            </p>
            <p style={{ fontSize: 13, color: '#59685F', lineHeight: '19px' }}>
              <b>{aRetirer.qui}</b> restera administrateur du club, mais ne
              pourra plus changer de rôle, suspendre ni supprimer.
              {aRetirer.id === moi?.id
                ? ' C’est VOTRE compte : vous perdrez cet écran, et il faudra un autre super administrateur pour vous le rendre.'
                : ''}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="link" onClick={() => setARetirer(null)}>
                Annuler
              </button>
              <button
                className="link"
                style={{ color: '#B3341A', marginLeft: 'auto' }}
                disabled={nommer.isPending}
                onClick={() => {
                  const { id, qui } = aRetirer;
                  setARetirer(null);
                  void agir(
                    nommer.mutateAsync({ profilId: id, super_admin: false }),
                    `${qui} n’est plus super administrateur.`
                  );
                }}
              >
                Retirer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
