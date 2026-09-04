/* ============================================================
   Administration · La place occupée, et le rangement

   « Tôt ou tard la base de données sera saturée et pleine, alors on
   doit anticiper cela. »

   La proposition de départ était de créer quatre projets et de
   basculer sur le suivant quand le précédent serait plein. La mesure
   a montré que ce serait résoudre le mauvais problème : les vingt
   tables du club pèsent 1,26 Mo, la croissance est de l'ordre de
   quinze mégaoctets par an, et le palier gratuit en offre cinq
   cents. La base est la DERNIÈRE chose qui se remplira.

   Ce qui sature avant, dans l'ordre :

     1. la mise en veille au bout de sept jours sans requête ;
     2. le trafic sortant, cinq gigaoctets par mois ;
     3. les photos, un gigaoctet, six ans environ ;
     4. la base elle-même, une trentaine d'années.

   Cet écran ne fait donc pas basculer d'une base à l'autre. Il fait
   ce qui manquait vraiment : VOIR VENIR, et RANGER.
   ============================================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avis, Bouton, Carte, Champ, Entete, Etat, Surtitre } from '../../ui/base';
import { Icone } from '../../ui/Icone';
import {
  CONSERVATION_PAR_DEFAUT,
  NOM_DE_LA_LIGNE,
  NOM_DU_SEAU,
  PALIERS,
  SEUIL_ALERTE,
  poids,
  useARanger,
  useOccupation,
  useRanger
} from '../../services/occupation';
import type { Conservation } from '../../services/occupation';

function Jauge({
  libelle,
  occupe,
  palier,
  detail
}: {
  libelle: string;
  occupe: number;
  palier: number;
  detail?: string;
}) {
  const part = Math.min(1, occupe / palier);
  const chaud = part >= SEUIL_ALERTE;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <b style={{ flexGrow: 1, fontSize: 14, fontWeight: 600 }}>{libelle}</b>
        <span style={{ fontSize: 13, color: chaud ? '#B3341A' : '#59685F' }}>
          {poids(occupe)} sur {poids(palier)}
        </span>
      </div>
      {/* La barre porte son pourcentage en texte pour les lecteurs
          d'écran : une barre colorée ne dit rien à qui ne la voit
          pas, et ce serait le seul chiffre de l'écran qu'on ne
          pourrait pas entendre. */}
      <div
        className="jauge"
        role="meter"
        aria-label={libelle}
        aria-valuenow={Math.round(part * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${Math.round(part * 100)} %`}
      >
        <i
          style={{
            width: `${Math.max(1.5, part * 100)}%`,
            background: chaud ? '#B3341A' : '#12613C'
          }}
        />
      </div>
      {detail && <span style={{ fontSize: 12, color: '#7C8B82' }}>{detail}</span>}
    </div>
  );
}

export function AdminOccupation() {
  const aller = useNavigate();
  const { data: occ, isPending, error } = useOccupation();

  const [garde, setGarde] = useState<Conservation>(CONSERVATION_PAR_DEFAUT);
  const { data: aRanger } = useARanger(garde);
  const ranger = useRanger();
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);
  /* Ranger efface pour de bon : on confirme, comme pour la
     suppression définitive d'un membre. */
  const [confirme, setConfirme] = useState(false);

  const nombre = (v: number | null) => (v == null ? '' : String(v));
  const mois = (v: string): number | null => {
    const n = Number(v);
    return v.trim() === '' || !Number.isFinite(n) || n <= 0 ? null : Math.round(n);
  };

  const total = (aRanger ?? []).reduce((t, l) => t + l.lignes, 0);

  return (
    <>
      <Entete titre="Place et rangement" retour={() => aller('/admin')} />

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        <Etat
          chargement={isPending}
          erreur={error}
          vide={false}
          messageVide="Rien à mesurer."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Surtitre>Ce que le club occupe</Surtitre>
            <Carte pad={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Jauge
                  libelle="Base de données"
                  occupe={occ?.base ?? 0}
                  palier={PALIERS.base}
                  detail={`Dont ${poids(occ?.tables ?? 0)} de tables du club ; le reste est le service lui-même.`}
                />
                <Jauge
                  libelle="Fichiers"
                  occupe={occ?.fichiers ?? 0}
                  palier={PALIERS.fichiers}
                  detail={(occ?.seaux ?? [])
                    .map((s) => `${NOM_DU_SEAU[s.nom] ?? s.nom} : ${s.fichiers}`)
                    .join(' · ')}
                />
              </div>
            </Carte>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Surtitre>Ce qu’il y a dedans</Surtitre>
            <div className="list">
              {(occ?.lignes ?? []).map((l) => (
                <div key={l.quoi} className="listrow">
                  <span style={{ flexGrow: 1, fontSize: 14 }}>
                    {NOM_DE_LA_LIGNE[l.quoi] ?? l.quoi}
                  </span>
                  <b className="display" style={{ fontSize: 15, color: '#0F5132' }}>
                    {l.combien.toLocaleString('fr-FR')}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </Etat>

        {/* CE QUE CET ÉCRAN NE SAIT PAS DIRE, et le dire vaut mieux
            que d'inventer un chiffre. Le trafic sortant est une
            mesure du service, pas une donnée de la base. */}
        <div className="banner">
          <Icone nom="eyeOff" taille={16} couleur="#0F5132" />
          <span>
            Le trafic sortant — cinq gigaoctets par mois sur le palier gratuit — ne se lit
            pas ici : c’est une mesure du service. Il se consulte sur le tableau de bord
            Supabase, rubrique « Usage ».
          </span>
        </div>

        {/* ---------------------------------------------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Durée de conservation</Surtitre>
          <Carte pad={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Champ
                libelle="Journal d’accès (mois)"
                type="number"
                valeur={nombre(garde.journal)}
                poser={(v) => setGarde((g) => ({ ...g, journal: mois(v) }))}
                aide="Un registre de sécurité, pas une archive. Le garder indéfiniment est en soi un risque. Vide = on ne range pas."
              />
              <Champ
                libelle="Notifications déjà lues (mois)"
                type="number"
                valeur={nombre(garde.notifications)}
                poser={(v) => setGarde((g) => ({ ...g, notifications: mois(v) }))}
                aide="Du bruit, par définition : elles ont été vues."
              />
              <Champ
                libelle="Messages (mois)"
                type="number"
                valeur={nombre(garde.messages)}
                poser={(v) => setGarde((g) => ({ ...g, messages: mois(v) }))}
                aide="Vide par défaut, et c’est délibéré : une conversation appartient à ceux qui l’ont eue. Les pièces jointes des messages effacés partent avec eux."
              />
            </div>
          </Carte>
        </div>

        {/* CE QUI SERA EMPORTÉ, AVANT DE L'EMPORTER.

            Un rangement qui ne dit pas ce qu'il va prendre ne se
            lance qu'une fois — et l'on découvre après. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Ce que le rangement emporterait</Surtitre>
          <div className="list">
            {(aRanger ?? []).map((l) => (
              <div key={l.quoi} className="listrow">
                <span style={{ flexGrow: 1, fontSize: 14 }}>
                  {NOM_DE_LA_LIGNE[l.quoi] ?? l.quoi}
                </span>
                <b
                  className="display"
                  style={{ fontSize: 15, color: l.lignes > 0 ? '#B3341A' : '#7C8B82' }}
                >
                  {l.lignes.toLocaleString('fr-FR')}
                </b>
              </div>
            ))}
            {(aRanger ?? []).length === 0 && (
              <div className="listrow">
                <span style={{ fontSize: 13, color: '#59685F' }}>Rien à ranger.</span>
              </div>
            )}
          </div>
        </div>

        {avis && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        {confirme ? (
          <div className="warn">
            <i />
            <p>
              Effacer <b>{total.toLocaleString('fr-FR')}</b> ligne
              {total > 1 ? 's' : ''} ? C’est définitif : rien ne se restaure depuis
              l’application.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <Bouton
                desactive={ranger.isPending}
                onClick={() =>
                  ranger.mutate(garde, {
                    onSuccess: ({ fait, fichiers }) => {
                      setConfirme(false);
                      const n = fait.reduce((t, f) => t + f.lignes, 0);
                      setAvis({
                        bon: true,
                        texte:
                          `${n} ligne${n > 1 ? 's' : ''} rangée${n > 1 ? 's' : ''}` +
                          (fichiers ? `, et ${fichiers} fichier${fichiers > 1 ? 's' : ''}.` : '.')
                      });
                    },
                    onError: (e) => {
                      setConfirme(false);
                      setAvis({ bon: false, texte: (e as Error).message });
                    }
                  })
                }
              >
                {ranger.isPending ? 'Rangement…' : 'Oui, ranger'}
              </Bouton>
              <Bouton genre="ghost" onClick={() => setConfirme(false)}>
                Annuler
              </Bouton>
            </div>
          </div>
        ) : (
          <Bouton genre="ghost" desactive={total === 0} onClick={() => setConfirme(true)}>
            {total === 0 ? 'Rien à ranger' : `Ranger ${total.toLocaleString('fr-FR')} lignes`}
          </Bouton>
        )}

        <div className="warn">
          <i />
          <p>
            Ce qui ne s’efface <b>jamais</b> au temps qui passe : les fiches, les
            actualités, les albums, et les <b>présences</b> — c’est le registre
            d’assiduité sur lequel se décident les passages de grade, et l’effacer
            effacerait la raison d’une ceinture.
          </p>
        </div>
      </div>
    </>
  );
}
