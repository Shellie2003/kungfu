/* ============================================================
   11 · Notifications
   ============================================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Entete, Etat, Surtitre, Tuile } from '../ui/base';
import {
  depuis,
  marquerLue,
  retirerNotification,
  toutMarquerLu,
  useNotifications,
  viderLesLues
} from '../services/casier';
import { Icone } from '../ui/Icone';

/* Aujourd'hui d'un côté, plus tôt de l'autre : c'est le découpage
   de la maquette, et il rend l'écran lisible sans lire les heures. */
const aujourdhui = (iso: string) =>
  new Date(iso).toDateString() === new Date().toDateString();

export function Notifications() {
  const aller = useNavigate();
  const client = useQueryClient();
  const { data: notifs, isPending, error } = useNotifications();

  const rafraichir = () => client.invalidateQueries({ queryKey: ['notifications'] });

  const toutLire = useMutation({ mutationFn: toutMarquerLu, onSuccess: rafraichir });

  /* ---- RANGER, une par une ----

     L'écran ne savait faire qu'une chose : « Tout lire ». On ne
     pouvait ni en marquer une seule, ni en retirer aucune. Cinquante
     s'accumulaient, la plus ancienne restait à côté de la plus
     récente, et la pastille du casier ne disait plus rien d'utile. */
  const lire = useMutation({ mutationFn: marquerLue, onSuccess: rafraichir });
  const retirer = useMutation({ mutationFn: retirerNotification, onSuccess: rafraichir });
  const vider = useMutation({ mutationFn: viderLesLues, onSuccess: rafraichir });

  const [souci, setSouci] = useState<string | null>(null);

  const liste = notifs ?? [];
  const dujour = liste.filter((n) => aujourdhui(n.cree_le));
  const avant = liste.filter((n) => !aujourdhui(n.cree_le));
  const restantes = liste.filter((n) => !n.lue_le).length;

  return (
    <>
      <Entete
        titre="Notifications"
        retour={() => aller(-1)}
        action={
          restantes > 0 ? (
            <button
              className="link"
              style={{ padding: '0 14px' }}
              onClick={() => toutLire.mutate()}
              disabled={toutLire.isPending}
            >
              Tout lire
            </button>
          ) : undefined
        }
      />

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        {souci && (
          <p role="alert" style={{ fontSize: 12.5, color: '#B3341A' }}>
            {souci}
          </p>
        )}

        {/* VIDER CE QUI EST DÉJÀ LU.

            Le geste de rangement le plus fréquent : on veut retrouver
            un écran qui ne montre que ce qui reste à voir. Ce qui
            n'est pas lu n'est jamais emporté — ce serait effacer une
            annonce qu'on n'a pas vue. Le bouton n'apparaît donc que
            s'il y a vraiment quelque chose à ranger. */}
        {liste.length > restantes && (
          <button
            className="link"
            style={{ alignSelf: 'flex-start' }}
            disabled={vider.isPending}
            onClick={() => {
              setSouci(null);
              vider.mutate(undefined, {
                onError: (err) => setSouci((err as Error).message)
              });
            }}
          >
            {vider.isPending
              ? 'Rangement…'
              : `Effacer les ${liste.length - restantes} notification${
                  liste.length - restantes > 1 ? 's' : ''
                } déjà lue${liste.length - restantes > 1 ? 's' : ''}`}
          </button>
        )}

        <Etat
          chargement={isPending}
          erreur={error}
          vide={liste.length === 0}
          messageVide="Aucune notification."
        >
          {[
            ['Aujourd’hui', dujour],
            ['Plus tôt', avant]
          ]
            .filter(([, groupe]) => (groupe as typeof liste).length > 0)
            .map(([titre, groupe]) => (
              <div
                key={titre as string}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <Surtitre>{titre as string}</Surtitre>
                {(groupe as typeof liste).map((n) => {
                  const neuve = !n.lue_le;
                  return (
                    <button
                      key={n.id}
                      className={neuve ? 'card notif notif--new' : 'card notif'}
                      onClick={() => {
                        /* LA LIRE EN L'OUVRANT.

                           C'est le geste naturel, et il ne se faisait
                           nulle part : la seule façon de faire tomber
                           la pastille était « Tout lire », qui emporte
                           aussi celles qu'on n'a pas regardées. On
                           marque celle-ci, puis on suit le lien s'il
                           y en a un.

                           On n'attend PAS le serveur pour naviguer :
                           l'écran de destination compte plus que la
                           coche, et une navigation qui attend le
                           réseau paraît cassée. */
                        if (neuve) lire.mutate(n.id);
                        if (n.vers) aller(n.vers);
                      }}
                    >
                      <Tuile
                        icone="news"
                        petite
                        fond={neuve ? undefined : '#F1F6F3'}
                        couleur={neuve ? '#0F5132' : '#7C8B82'}
                      />
                      <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <b
                            style={{
                              fontSize: 14,
                              fontWeight: neuve ? 700 : 600,
                              color: neuve ? 'var(--encre)' : '#3C4A42'
                            }}
                          >
                            {n.titre}
                          </b>
                          {/* La pastille rouge est doublée d'une graisse
                              plus forte : la couleur seule ne dit jamais
                              rien à qui ne la distingue pas. */}
                          {neuve && <i className="unread" />}
                        </span>
                        {n.texte && (
                          <span
                            style={{
                              display: 'block',
                              fontSize: 13,
                              lineHeight: '19px',
                              color: '#59685F',
                              marginTop: 3
                            }}
                          >
                            {n.texte}
                          </span>
                        )}
                        <span
                          style={{
                            display: 'block',
                            fontSize: 11,
                            color: '#8A978F',
                            marginTop: 6
                          }}
                        >
                          {depuis(n.cree_le)}
                        </span>
                      </span>

                      {/* RETIRER CELLE-CI.

                          « span » et non « button » : cette rangée EST
                          déjà un bouton, et un bouton dans un bouton
                          est un balisage invalide que les navigateurs
                          réparent chacun à leur façon. Le rôle et le
                          clavier sont posés à la main, et l'on arrête
                          la propagation — sans quoi retirer une
                          notification l'ouvrirait aussi. */}
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Retirer « ${n.titre} »`}
                        className="tapicon"
                        style={{ flex: 'none' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSouci(null);
                          retirer.mutate(n.id, {
                            onError: (err) => setSouci((err as Error).message)
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter' && e.key !== ' ') return;
                          e.preventDefault();
                          e.stopPropagation();
                          retirer.mutate(n.id);
                        }}
                      >
                        <Icone nom="x" taille={17} couleur="#A8B6AE" epaisseur={2} />
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
        </Etat>
      </div>
    </>
  );
}
