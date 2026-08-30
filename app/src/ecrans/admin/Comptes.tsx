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
import { Avis, Carte, Entete, Etat, Surtitre, Tuile } from '../../ui/base';
import {
  useChangerRole, useComptes, useCreerCompte, useReinitialiser
} from '../../services/admin';
import { useSession } from '../../services/session';
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
  const moi = useSession((e) => e.profil);
  const [q, setQ] = useState('');
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  const liste = useMemo(
    () => (comptes ?? []).filter((c) => correspond(q, c.nom, c.prenom, c.numero)),
    [comptes, q]
  );

  const sansCompte = liste.filter((c) => !c.compte_id).length;

  function traiter(promesse: Promise<{ ok: boolean; message?: string; motDePasse?: string }>) {
    promesse.then((r) => {
      if (!r.ok) {
        setAvis({ bon: false, texte: r.message ?? 'Le serveur a refusé.' });
        return;
      }
      setAvis({
        bon: true,
        texte: r.motDePasse
          ? `Mot de passe : ${r.motDePasse} — notez-le maintenant, il ne sera plus affiché.`
          : 'C’est fait.'
      });
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
                <div key={c.id} className="listrow">
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
                          : creer.mutateAsync({ profilId: c.id })
                      )
                    }
                  >
                    {c.compte_id ? 'Réinitialiser' : 'Créer le compte'}
                  </button>
                </div>
              ))}
            </div>
          </Etat>
        </div>

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
