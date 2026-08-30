/* ============================================================
   11 · Notifications
   ============================================================ */
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Entete, Etat, Surtitre, Tuile } from '../ui/base';
import { depuis, toutMarquerLu, useNotifications } from '../services/casier';

/* Aujourd'hui d'un côté, plus tôt de l'autre : c'est le découpage
   de la maquette, et il rend l'écran lisible sans lire les heures. */
const aujourdhui = (iso: string) =>
  new Date(iso).toDateString() === new Date().toDateString();

export function Notifications() {
  const aller = useNavigate();
  const client = useQueryClient();
  const { data: notifs, isPending, error } = useNotifications();

  const toutLire = useMutation({
    mutationFn: toutMarquerLu,
    onSuccess: () => client.invalidateQueries({ queryKey: ['notifications'] })
  });

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
                      onClick={() => n.vers && aller(n.vers)}
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
