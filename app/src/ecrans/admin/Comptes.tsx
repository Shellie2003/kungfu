/* ============================================================
   Administration · Comptes et accès

   Le seul écran où l'application ne peut pas faire le travail
   elle-même. Créer un compte ou réinitialiser un mot de passe
   demande la clé « service_role », qui passe outre toutes les
   règles d'accès — la mettre dans l'APK reviendrait à la publier.

   L'écran appelle donc une fonction déployée sur le serveur, qui
   détient la clé et vérifie elle-même que l'appelant est bien
   l'administration. Tant qu'elle n'est pas déployée, l'écran le dit
   franchement plutôt que de laisser croire que le compte existe.
   ============================================================ */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icone } from '../../ui/Icone';
import { Avis, Bouton, Carte, Copier, Entete, Etat, Surtitre, Tuile } from '../../ui/base';
import {
  useChangerRole, useComptes, useCreerCompte, useReinitialiser,
  useSupprimerMembre, useSuspendre
} from '../../services/admin';
import { estSuper, useSession } from '../../services/session';
import type { Role } from '../../services/session';
import { correspond } from '../../services/texte';

const ROLES: Record<Role, string> = {
  eleve: 'Élève',
  maitre: 'Maître',
  admin: 'Administration'
};

export function AdminComptes() {
  const aller = useNavigate();
  const { data: comptes, isPending, error } = useComptes();
  const creer = useCreerCompte();
  const reinitialiser = useReinitialiser();
  const role = useChangerRole();
  const suspendre = useSuspendre();
  const supprimer = useSupprimerMembre();
  const moi = useSession((e) => e.profil);
  /* « Seul lui peut suspendre, supprimer définitivement un membre. »

     Ce n'est PAS ce qui protège : la fonction déployée refuse ces
     deux actions à qui n'est pas super administrateur, et la règle de
     suppression de la table exige la même chose. Un écran qui cache
     un bouton n'empêche rien — la fonction reste appelable avec le
     jeton de n'importe quel administrateur, depuis n'importe quel
     outil.

     Ce que l'écran fait, c'est ne pas proposer ce qui sera refusé.
     Montrer un bouton qui mène à une erreur laisse la personne se
     demander si le fautif est elle. */
  const superAdmin = estSuper(moi);
  /* Ce qu'on s'apprête à supprimer, en attente de confirmation. La
     suppression est DÉFINITIVE et le projet n'a pas de corbeille :
     un appui de trop effacerait dix ans d'historique d'un membre. */
  const [aSupprimer, setASupprimer] = useState<{ id: string; qui: string } | null>(null);
  const [q, setQ] = useState('');
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  const liste = useMemo(
    () => (comptes ?? []).filter((c) => correspond(q, c.nom, c.prenom, c.numero)),
    [comptes, q]
  );

  const sansCompte = liste.filter((c) => !c.compte_id).length;

  /* ---- LES IDENTIFIANTS ENGENDRÉS, À PART DE L'AVIS ----

     Ils étaient noyés dans une phrase : « Mot de passe : Kf7mQ2pXwR4t
     — notez-le maintenant ». Il fallait donc les recopier à la main
     dans un message, douze caractères tirés au sort. C'est le seul
     geste de l'application où une faute de frappe ne se rattrape
     pas : le mot de passe ne repasse plus, il faut le réinitialiser
     et rappeler le membre.

     On garde donc le matricule AVEC, puisque c'est ce couple qu'on
     envoie, et l'on met un bouton dessus. */
  const [identifiants, setIdentifiants] = useState<{
    numero: string;
    motDePasse: string;
  } | null>(null);

  function traiter(
    promesse: Promise<{ ok: boolean; message?: string; motDePasse?: string }>,
    numero: string
  ) {
    setIdentifiants(null);
    promesse.then((r) => {
      if (!r.ok) {
        setAvis({ bon: false, texte: r.message ?? 'Le serveur a refusé.' });
        return;
      }
      if (r.motDePasse) {
        setAvis(null);
        setIdentifiants({ numero, motDePasse: r.motDePasse });
        return;
      }
      setAvis({ bon: true, texte: 'C’est fait.' });
    });
  }

  return (
    <>
      <Entete titre="Comptes et accès" retour={() => aller('/admin')} />

      <div style={{ padding: '16px 20px 0' }}>
        <div className="searchbar">
          <Icone nom="search" taille={19} couleur="#7C8B82" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un nom ou un matricule"
            aria-label="Rechercher un nom ou un matricule"
            style={{
              flexGrow: 1, minWidth: 0, border: 0, background: 'transparent',
              fontSize: 15, color: 'var(--encre)'
            }}
          />
        </div>
      </div>

      <div
        style={{
          flexGrow: 1, padding: '14px 20px 24px',
          display: 'flex', flexDirection: 'column', gap: 18
        }}
      >
        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        {/* Le mot de passe engendré, montré UNE FOIS et copiable.
            « role=status » parce qu'il apparaît en haut d'une liste
            alors qu'on vient d'appuyer plus bas : sans annonce, on ne
            sait pas qu'il est là. */}
        {identifiants && (
          <Carte
            pad={16}
            role="status"
            style={{ background: '#E8F1EC', borderColor: '#B9D3C4' }}
          >
            <p style={{ fontSize: 14, fontWeight: 700 }}>Identifiants de {identifiants.numero}</p>
            <p
              style={{
                marginTop: 10,
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: 700
              }}
            >
              {identifiants.motDePasse}
            </p>
            <div style={{ marginTop: 12 }}>
              <Copier
                nom={`Copier les identifiants de ${identifiants.numero}`}
                libelle="Copier les identifiants"
                texte={
                  `Kung-fu Waishi Analamahitsy\n` +
                  `Matricule : ${identifiants.numero}\n` +
                  `Mot de passe : ${identifiants.motDePasse}`
                }
              />
            </div>
            <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#3C4A42', marginTop: 12 }}>
              Notez-le et remettez-le au membre <b>maintenant</b> : il ne s’affichera plus.
              Personne ne peut le retrouver, pas même en base — il s’y trouve chiffré.
            </p>
          </Carte>
        )}

        {/* Le fait marquant, dit d'entrée : tous les élèves n'ont pas
            de téléphone. Une fiche sans compte est le cas ordinaire,
            pas une anomalie à corriger. */}
        <Carte style={{ background: 'var(--vert-clair)', borderColor: '#C4D9CC' }}>
          <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#12613C' }}>
            {sansCompte} fiche{sansCompte > 1 ? 's' : ''} sans compte. C’est normal :
            « tsy izy rehetra manana android » — tous les élèves n’ont pas de téléphone. Ils
            figurent quand même à l’annuaire, sur la liste de présence et sur une carte de
            membre.
          </p>
        </Carte>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Les membres</Surtitre>
          <Etat
            chargement={isPending}
            erreur={error}
            vide={liste.length === 0}
            messageVide="Aucun membre ne correspond."
          >
            <div className="list">
              {liste.map((c) => (
                /* ---- UNE LIGNE SUR DEUX ÉTAGES ----

                   Tout tenait sur une seule ligne : la tuile, le nom,
                   le matricule et son état, le choix du rôle, et
                   jusqu'à quatre actions. Sur trois cent quatre-vingt-
                   dix pixels, la colonne du nom se réduisait à cent
                   quarante : « RANDRIAMAMPIONONA » passait sur deux
                   lignes et « F04x061 · Élève · sans compte » sur
                   quatre. On lisait une colonne de mots empilés.

                   L'identité prend maintenant toute la largeur, et les
                   commandes vont dessous. C'est une rangée plus haute
                   et beaucoup plus courte à lire — et sur cet écran on
                   cherche un nom avant de faire quoi que ce soit. */
                <div
                  key={c.id}
                  className="listrow"
                  style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <Tuile
                    icone={c.compte_id ? 'shieldCheck' : 'lock'}
                    petite
                    fond={c.compte_id ? undefined : '#F1F6F3'}
                    couleur={c.compte_id ? '#0F5132' : '#7C8B82'}
                  />
                  <span style={{ flexGrow: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 14.5, fontWeight: 600 }}>
                      {c.nom} {c.prenom}
                    </b>
                    <span style={{ display: 'block', fontSize: 12.5, color: '#59685F', marginTop: 1 }}>
                      {c.numero} · {ROLES[c.role] ?? c.role}
                      {!c.actif && ' · désactivé'}
                      {c.compte_id ? '' : ' · sans compte'}
                    </span>
                  </span>
                  </div>

                  {/* Les commandes, sur leur propre étage. « wrap »
                      parce que le super administrateur en voit quatre :
                      rôle, compte, suspension, suppression. */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      flexWrap: 'wrap', paddingLeft: 57
                    }}
                  >
                  {/* Le rôle, ici et nulle part ailleurs. C'était une
                      fonctionnalité validée à la livraison —
                      « attribution du rôle de maître, par
                      l'administration seule » — et rien ne la tenait :
                      l'espace des maîtres, construit et protégé,
                      n'aurait servi qu'aux comptes posés à la main en
                      base.

                      Le refus de se retirer son propre rôle n'est pas
                      une sécurité, c'est un garde-fou : s'il ne reste
                      aucun administrateur, plus personne ne peut en
                      nommer un depuis l'application. */}
                  <select
                    className="input"
                    aria-label={`Rôle de ${c.nom} ${c.prenom}`}
                    style={{ width: 'auto', padding: '0 8px', fontSize: 12.5 }}
                    value={c.role}
                    disabled={c.id === moi?.id || role.isPending}
                    onChange={(e) =>
                      role.mutate(
                        { profilId: c.id, role: e.target.value as Role },
                        {
                          onSuccess: () =>
                            setAvis({
                              bon: true,
                              texte: `${c.nom} ${c.prenom} est maintenant ${
                                ROLES[e.target.value as Role]
                              }.`
                            }),
                          onError: (err) =>
                            setAvis({ bon: false, texte: (err as Error).message })
                        }
                      )
                    }
                  >
                    {(Object.keys(ROLES) as Role[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLES[r]}
                      </option>
                    ))}
                  </select>

                  <button
                    className="link"
                    style={{ padding: '0 4px' }}
                    disabled={creer.isPending || reinitialiser.isPending}
                    onClick={() =>
                      traiter(
                        c.compte_id
                          ? reinitialiser.mutateAsync({ profilId: c.id })
                          : creer.mutateAsync({ profilId: c.id }),
                        c.numero
                      )
                    }
                  >
                    {c.compte_id ? 'Réinitialiser' : 'Créer le compte'}
                  </button>

                  {/* ---- SUSPENDRE ET SUPPRIMER : au super
                      administrateur seul, et jamais soi-même ----

                      Se suspendre ou se supprimer déconnecte
                      définitivement ; si c'est le dernier super
                      administrateur, plus personne ne peut en nommer
                      un autre et le club est enfermé dehors. Le
                      serveur le refuse aussi — ici, on ne le propose
                      simplement pas. */}
                  {superAdmin && c.id !== moi?.id && (
                    <>
                      {c.compte_id && (
                        <button
                          className="link"
                          style={{ padding: '0 4px', color: '#8A3B12' }}
                          disabled={suspendre.isPending}
                          onClick={() =>
                            traiter(
                              suspendre.mutateAsync({ profilId: c.id, suspendu: c.actif }),
                              c.numero
                            )
                          }
                        >
                          {c.actif ? 'Suspendre' : 'Réactiver'}
                        </button>
                      )}
                      <button
                        className="link"
                        style={{ padding: '0 4px', color: '#B3341A' }}
                        aria-label={`Supprimer définitivement ${c.nom} ${c.prenom}`}
                        onClick={() =>
                          setASupprimer({ id: c.id, qui: `${c.nom} ${c.prenom}` })
                        }
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                  </div>
                </div>
              ))}
            </div>
          </Etat>
        </div>

        {/* ---- LA CONFIRMATION, PARCE QUE C'EST DÉFINITIF ----

            Le projet désactive au lieu de supprimer, partout ailleurs.
            Ici l'effacement est réel : la fiche, la vie privée, les
            tuteurs, l'appartenance aux salons et les présences
            partent avec. Il n'y a pas de corbeille, et rien ne se
            rattrape.

            Le nom est écrit dans la question. « Supprimer ce
            membre ? » se répond « oui » sans lire ; « Supprimer
            RAKOTONDRABE Nirina ? » fait relever les yeux. */}
        {aSupprimer && (
          <Carte pad={16} style={{ background: '#FFF7F2', borderColor: '#F2D8C6' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#8A3B12' }}>
              Supprimer définitivement {aSupprimer.qui} ?
            </p>
            <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#6B4218', marginTop: 8 }}>
              Sa fiche, ses informations privées, ses tuteurs, ses présences et son compte de
              connexion seront effacés. Il n’y a pas de corbeille : rien ne se rattrape. Pour
              écarter un membre sans rien perdre, suspendez-le plutôt.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <Bouton
                genre="ghost"
                desactive={supprimer.isPending}
                onClick={() => {
                  const qui = aSupprimer.qui;
                  supprimer.mutate(
                    { profilId: aSupprimer.id },
                    {
                      onSuccess: (r) => {
                        setASupprimer(null);
                        setAvis(
                          r.ok
                            ? { bon: true, texte: `${qui} a été supprimé définitivement.` }
                            : { bon: false, texte: r.message ?? 'Le serveur a refusé.' }
                        );
                      },
                      onError: (e) =>
                        setAvis({ bon: false, texte: (e as Error).message })
                    }
                  );
                }}
              >
                {supprimer.isPending ? 'Suppression…' : 'Supprimer définitivement'}
              </Bouton>
              <Bouton onClick={() => setASupprimer(null)}>Annuler</Bouton>
            </div>
          </Carte>
        )}

        <div className="warn">
          <i />
          <p>
            Votre propre rôle ne se change pas depuis cet écran. S’il ne restait aucun
            administrateur, plus personne ne pourrait en nommer un depuis l’application, et
            le club serait enfermé dehors.
          </p>
        </div>

        <div className="warn">
          <i />
          <p>
            Le mot de passe engendré n’est affiché qu’une fois : il n’est pas stocké en clair,
            et personne — pas même l’administration — ne peut le relire ensuite. Notez-le et
            transmettez-le à l’intéressé de la main à la main.
          </p>
        </div>
      </div>
    </>
  );
}
