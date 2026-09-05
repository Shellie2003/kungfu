/* ============================================================
   10 · Le Club

   Presque tout ce qu'on lit ici vient de la base : le responsable
   change, le téléphone change, l'adresse change, les jours
   d'entraînement changent. « Mety modifiena » — le club doit
   pouvoir le corriger lui-même, sans nouvelle version.

   TOUT SE CHANGE DEPUIS CET ÉCRAN
   -------------------------------
   Tout cela se modifiait déjà, mais ailleurs : dans l'écran
   d'administration, derrière dix champs de texte. Le club a demandé
   de pouvoir le faire ICI — « dans l'écran club je veux qu'on puisse
   changer la photo du club, la présentation, valeur, entraînement,
   contact ». C'est la même remarque que pour la photo de l'accueil,
   et elle a la même réponse : le contrôle se pose là où l'on
   constate le manque, pas dans un écran qu'il faut connaître.

   Le crayon ne s'affiche qu'à qui peut réellement écrire, et cela
   diffère selon la ligne. Les règles du serveur en décident, et cet
   écran ne fait que les refléter :

     · la PHOTO du club     — maîtres et administration (migration 0013) ;
     · tout le RESTE        — administration seule.

   Montrer un crayon qui mène à un refus serait pire que de n'en
   montrer aucun : la personne essaie, échoue, et ne sait pas si le
   fautif est elle ou l'application.
   ============================================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Emblem } from '../ui/Emblem';
import { Icone } from '../ui/Icone';
import { VERSION, versionCourte } from '../services/version';
import { NUMERO } from '../services/miseAJourApk';
import {
  Avis, Bouton, Carte, ChoisirFichier, Entete, Feuille, Filet, Modifier, Surtitre, Tuile, Zone
} from '../ui/base';
import { Champ } from '../ui/base';
import {
  ecrireValeurs, heure, lireValeurs, nomDuJour, useHoraires, useReglages
} from '../services/club';
import { televerser, useEnregistrerReglages } from '../services/admin';
import { useUrl } from '../services/stockage';
import { estAdmin, estMaitre, useSession } from '../services/session';

/* Les libellés des réglages écrits d'ici. Ils partent avec la valeur
   — « upsert » écrit la ligne entière — et c'est ce que
   l'administration lit dans le tableau de bord Supabase. Ils doivent
   donc dire la même chose que l'écran d'administration, qui écrit
   les mêmes clés. */
const LIBELLE: Record<string, string> = {
  presentation: 'Présentation longue',
  valeurs: 'Valeurs du club',
  responsable: 'Responsable du club',
  telephone: 'Téléphone',
  adresse: 'Adresse',
  photo_club: 'Photo du club'
};

export function Club() {
  const aller = useNavigate();
  const { data: horaires } = useHoraires();
  const { data: reglages } = useReglages();
  const moi = useSession((e) => e.profil);
  const enregistrer = useEnregistrerReglages();

  /* Quelle feuille est ouverte, s'il y en a une. Fermée, aucune
     n'existe dans le document. */
  const [feuille, setFeuille] = useState<
    null | 'photo' | 'presentation' | 'valeurs' | 'contact'
  >(null);
  /* Le brouillon en cours de saisie. Il ne part en base qu'à
     « Enregistrer » : on doit pouvoir corriger une faute de frappe
     sans que chaque touche parte sur le réseau. */
  const [brouillon, setBrouillon] = useState<Record<string, string>>({});
  const [avis, setAvis] = useState<{ bon: boolean; texte: string } | null>(null);

  const peutTexte = estAdmin(moi);
  const peutPhoto = estMaitre(moi);

  const photoClub = useUrl('album', reglages?.photo_club);

  const valeurs = lireValeurs(reglages?.valeurs);
  const contacts: [string, string, string][] = [
    ['users', reglages?.responsable ?? '[NOM À FOURNIR]', 'Responsable du club'],
    ['phone', reglages?.telephone ?? '[NUMÉRO À FOURNIR]', 'Téléphone'],
    ['pin', reglages?.adresse ?? '[ADRESSE EXACTE À FOURNIR]', 'Analamahitsy, Antananarivo']
  ];

  /* Ouvrir une feuille, c'est recopier les valeurs actuelles dans le
     brouillon : sans cela le formulaire s'ouvrirait vide et
     « enregistrer » effacerait ce qui était écrit. */
  const ouvrir = (quoi: NonNullable<typeof feuille>, depart: Record<string, string>) => {
    setBrouillon(depart);
    setAvis(null);
    setFeuille(quoi);
  };

  const poser = (cles: string[]) =>
    enregistrer.mutate(
      cles.map((cle) => ({ cle, libelle: LIBELLE[cle] ?? cle, valeur: brouillon[cle] ?? '' })),
      {
        onSuccess: () => {
          setFeuille(null);
          setAvis({ bon: true, texte: 'Enregistré.' });
        },
        /* Le refus se LIT, et la feuille RESTE ouverte : la refermer
           emporterait le texte que la personne vient d'écrire. */
        onError: (e) => setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` })
      }
    );

  const [envoi, setEnvoi] = useState(false);
  const poserPhoto = async (fichier: File) => {
    setEnvoi(true);
    setAvis(null);
    try {
      const chemin = await televerser('album', fichier);
      await new Promise<void>((ok, non) =>
        enregistrer.mutate([{ cle: 'photo_club', libelle: 'Photo du club', valeur: chemin }], {
          onSuccess: () => ok(),
          onError: (e) => non(e as Error)
        })
      );
      setFeuille(null);
      setAvis({ bon: true, texte: 'Photo du club enregistrée.' });
    } catch (e) {
      setAvis({ bon: false, texte: `Refusé : ${(e as Error).message}` });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <>
      <Entete titre="Le Club" retour={() => aller('/accueil')} />

      <div
        style={{
          flexGrow: 1,
          padding: '20px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        <div
          style={{
            background: '#0F5132',
            borderRadius: 18,
            padding: '24px 20px',
            /* Le repère de la pastille « photo du club », qui se pose
               par-dessus ce bloc sans en changer la hauteur. */
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            textAlign: 'center'
          }}
        >
          <Emblem grand taille={34} icone="shield" />
          <div>
            <p className="display" style={{ fontSize: 20, color: '#FFF', lineHeight: '25px' }}>
              Kung-fu Waishi
              <br />
              Analamahitsy
            </p>
            <p style={{ fontSize: 13, color: 'var(--sur-vert)', marginTop: 8 }}>
              Fondé en {reglages?.fondation ?? '2014'} · Antananarivo
            </p>
          </div>
          {/* La photo du club, ou le manque à combler.

              Cette ligne disait « Logo du club à fournir » sans que
              rien, sur cet écran, ne permette de le fournir. Le
              même défaut que l'accueil avait, et la même correction :
              le bouton est là où le manque se constate. */}
          {photoClub ? (
            <img
              src={photoClub}
              alt="Le club"
              style={{
                width: '100%',
                height: 148,
                objectFit: 'cover',
                borderRadius: 12,
                marginTop: 2
              }}
            />
          ) : (
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '.1em',
                color: '#7FA893',
                textTransform: 'uppercase'
              }}
            >
              Logo du club à fournir
            </p>
          )}
          {/* Le bouton est une PASTILLE POSÉE PAR-DESSUS, pas une
              ligne de plus.

              Écrit en clair sous le bloc, il mesurait quarante-trois
              pixels de haut et poussait tout l'écran vers le bas :
              « Présentation » en (20, 385) au lieu de (20, 342), et
              ainsi de suite jusqu'aux valeurs sorties de l'écran. La
              comparaison à la maquette l'a vu, et elle avait raison —
              c'était une vraie régression, pas un faux positif.

              L'accueil avait résolu exactement cela de la même
              façon : hors du flux, le bouton s'ajoute sans rien
              déplacer. Le nom accessible porte les mots, pour qui
              n'en voit pas l'icône. */}
          {peutPhoto && (
            <button
              aria-label={
                reglages?.photo_club ? 'Changer la photo du club' : 'Ajouter une photo du club'
              }
              onClick={() => ouvrir('photo', {})}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 34,
                height: 34,
                borderRadius: 17,
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,.16)'
              }}
            >
              <Icone nom={reglages?.photo_club ? 'edit' : 'plus'} taille={17} couleur="#FFF" />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="rowhead">
            <Surtitre>Présentation</Surtitre>
            {peutTexte && (
              <Modifier
                quoi="la présentation"
                onClick={() => ouvrir('presentation', { presentation: reglages?.presentation ?? '' })}
              />
            )}
          </div>
          <Carte>
            <p style={{ fontSize: 15, lineHeight: '25px', color: '#3C4A42' }}>
              {reglages?.presentation ??
                'Le club enseigne le Kung-fu Waishi à Analamahitsy. Il accueille enfants, adolescents et adultes, du débutant au gradé, autour d’une pratique régulière et d’un esprit d’entraide.'}
            </p>
          </Carte>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="rowhead">
            <Surtitre>Valeurs</Surtitre>
            {peutTexte && (
              <Modifier
                quoi="les valeurs"
                onClick={() => ouvrir('valeurs', { valeurs: ecrireValeurs(valeurs) })}
              />
            )}
          </div>
          {valeurs.map(([t, d]) => (
            <div key={t} className="card valuerow">
              <Tuile icone="martial" petite />
              <span>
                <b style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{t}</b>
                <span
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#59685F',
                    marginTop: 2,
                    lineHeight: '19px'
                  }}
                >
                  {d}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="rowhead">
            <Surtitre>Entraînements</Surtitre>
            {/* Les séances ne se modifient pas dans une feuille : on
                en ajoute, on en retire, chacune a un jour, deux
                heures et un niveau. L'écran d'administration fait
                déjà cela, bien ; le crayon y mène au lieu d'en
                recopier une seconde version qui divergerait.

                Pour qui ne peut pas écrire, la mention d'origine
                reste : elle explique pourquoi l'horaire affiché ne
                se touche pas. */}
            {peutTexte ? (
              <Modifier quoi="les entraînements" onClick={() => aller('/admin/club')} />
            ) : (
              <span className="modif">Modifiable par l’administration</span>
            )}
          </div>
          <Carte pad={16}>
            <div className="deflist">
              {(horaires ?? []).map((h) => (
                <div key={h.id}>
                  <span style={{ width: 74, flex: 'none', color: '#0E2119', fontWeight: 600 }}>
                    {nomDuJour(h.jour)}
                  </span>
                  <span style={{ flexGrow: 1, color: '#3C4A42' }}>
                    {heure(h.debut)} – {heure(h.fin)}
                  </span>
                  <b style={{ fontSize: 12, color: '#7C8B82', fontWeight: 400 }}>{h.niveau}</b>
                </div>
              ))}
              {horaires && horaires.length === 0 && (
                <div>
                  <span>Les horaires ne sont pas encore renseignés.</span>
                </div>
              )}
            </div>
          </Carte>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="rowhead">
            <Surtitre>Contact</Surtitre>
            {peutTexte ? (
              <Modifier
                quoi="le contact"
                onClick={() =>
                  ouvrir('contact', {
                    responsable: reglages?.responsable ?? '',
                    telephone: reglages?.telephone ?? '',
                    adresse: reglages?.adresse ?? ''
                  })
                }
              />
            ) : (
              <span className="modif">Modifiable par l’administration</span>
            )}
          </div>
          <Carte pad={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {contacts.map(([ic, valeur, libelle], i) => (
                <div key={libelle}>
                  {i > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <Filet />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Tuile icone={ic} petite />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{valeur}</p>
                      <p style={{ fontSize: 13, color: '#59685F' }}>{libelle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Carte>
        </div>

        {/* Le résultat de la dernière écriture, sous les sections et
            non dans la feuille : quand elle réussit, la feuille se
            referme, et l'avis doit rester visible sur l'écran. */}
        {avis && !feuille && <Avis bon={avis.bon}>{avis.texte}</Avis>}

        {/* ---- Les feuilles. Fermées, elles n'existent pas ---- */}

        {feuille === 'photo' && (
          <Feuille sur="Le Club" titre="Photo du club" fermer={() => setFeuille(null)}>
            <p style={{ fontSize: 13, lineHeight: '19px', color: '#59685F' }}>
              Elle s’affiche en haut de cet écran, et sur l’accueil.
            </p>
            {/* Deux chemins et non un seul : « capture » ouvre
                l'appareil photo ET ferme la porte à la galerie. */}
            <ChoisirFichier
              appareil
              libelle="Prendre une photo"
              desactive={envoi}
              onFichier={([f]) => f && void poserPhoto(f)}
            />
            <ChoisirFichier
              libelle="Importer depuis la galerie"
              desactive={envoi}
              onFichier={([f]) => f && void poserPhoto(f)}
            />
            {envoi && <p style={{ fontSize: 12.5, color: '#59685F' }}>Envoi de la photo…</p>}
            {avis && !avis.bon && <Avis bon={false}>{avis.texte}</Avis>}
            <button className="link" onClick={() => setFeuille(null)}>
              Annuler
            </button>
          </Feuille>
        )}

        {feuille === 'presentation' && (
          <Feuille sur="Le Club" titre="Présentation" fermer={() => setFeuille(null)}>
            <Zone
              libelle="Présentation du club"
              lignes={7}
              aide="Elle s’affiche telle quelle aux membres, sur cet écran."
              valeur={brouillon.presentation ?? ''}
              poser={(v) => setBrouillon((p) => ({ ...p, presentation: v }))}
            />
            {avis && !avis.bon && <Avis bon={false}>{avis.texte}</Avis>}
            <Bouton desactive={enregistrer.isPending} onClick={() => poser(['presentation'])}>
              {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Bouton>
            <button className="link" onClick={() => setFeuille(null)}>
              Annuler
            </button>
          </Feuille>
        )}

        {feuille === 'valeurs' && (
          <Feuille sur="Le Club" titre="Valeurs" fermer={() => setFeuille(null)}>
            <Zone
              libelle="Une valeur par ligne"
              lignes={6}
              aide="Écrivez « Titre : description ». L’ordre est celui des lignes."
              valeur={brouillon.valeurs ?? ''}
              poser={(v) => setBrouillon((p) => ({ ...p, valeurs: v }))}
            />
            {avis && !avis.bon && <Avis bon={false}>{avis.texte}</Avis>}
            <Bouton desactive={enregistrer.isPending} onClick={() => poser(['valeurs'])}>
              {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Bouton>
            <button className="link" onClick={() => setFeuille(null)}>
              Annuler
            </button>
          </Feuille>
        )}

        {feuille === 'contact' && (
          <Feuille sur="Le Club" titre="Contact" fermer={() => setFeuille(null)}>
            <Champ
              libelle="Responsable du club"
              valeur={brouillon.responsable ?? ''}
              poser={(v) => setBrouillon((p) => ({ ...p, responsable: v }))}
            />
            <Champ
              libelle="Téléphone"
              type="tel"
              aide="Celui qu’on affiche aux membres."
              valeur={brouillon.telephone ?? ''}
              poser={(v) => setBrouillon((p) => ({ ...p, telephone: v }))}
            />
            <Champ
              libelle="Adresse"
              aide="Où se trouve la salle."
              valeur={brouillon.adresse ?? ''}
              poser={(v) => setBrouillon((p) => ({ ...p, adresse: v }))}
            />
            {avis && !avis.bon && <Avis bon={false}>{avis.texte}</Avis>}
            <Bouton
              desactive={enregistrer.isPending}
              onClick={() => poser(['responsable', 'telephone', 'adresse'])}
            >
              {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Bouton>
            <button className="link" onClick={() => setFeuille(null)}>
              Annuler
            </button>
          </Feuille>
        )}

        {/* La version que l'on regarde, en bas de l'écran du club.

            Elle sert à UNE question, et le club se l'est posée :
            « est-ce que ce que je vois est bien la dernière mise à
            jour ? » Sans repère, un écran inchangé ne distingue pas
            « la publication n'est pas encore arrivée » — elle prend
            une à deux minutes — de « la correction ne marche pas ».

            Discrète et en dernier : ce n'est pas une information
            pour les soixante-quatre membres, c'est un repère pour
            qui essaie. */}
        {/* ⚠ LES DEUX NUMÉROS, ET DANS CET ORDRE.

            Cette ligne ne montrait que l'empreinte du commit. À la
            question « quelle version as-tu ? », le membre répondait
            donc « 583262e » — un repère utile à qui développe, et
            illisible pour tout le monde d'autre.

            Or c'est le NUMÉRO qui décide de la mise à jour : c'est lui
            que le téléphone compare à celui publié. Il doit donc être
            celui qu'on lit en premier, sans quoi l'application et son
            porteur ne donnent pas la même réponse à la même question.

            L'empreinte reste, en second : elle seule permet de
            retrouver le code exact d'un APK d'essai. */}
        <p style={{ fontSize: 11, color: '#A8B6AE', textAlign: 'center', marginTop: 4 }}>
          Version {NUMERO} · {versionCourte(VERSION)}
        </p>
      </div>
    </>
  );
}
