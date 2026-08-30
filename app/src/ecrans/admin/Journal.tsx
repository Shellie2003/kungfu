/* ============================================================
   Administration · Le journal d'accès

   La note de sécurité livrée au club annonce le « journal des
   accès » comme l'un des trois moyens de tenir la confidentialité de
   l'espace des maîtres, avec le rôle et le filtre en base. Il
   s'écrivait depuis peu, et personne ne pouvait le lire : un journal
   qu'on ne consulte pas ne répond à aucune question, et donne
   l'illusion du contraire.

   Ce qu'il contient, et ce qu'il ne contient PAS. Seule l'ouverture
   de l'espace des maîtres y figure. Consigner chaque conversation
   ferait un registre de la vie de tout le monde — une atteinte à la
   vie privée déguisée en mesure de sécurité, et c'est exactement ce
   qu'un journal ne doit pas devenir.

   Il ne dit pas non plus ce qui a été LU. Il dit qui est entré, et
   quand. C'est ce qui permet de répondre à « qui avait accès au
   moment où c'est arrivé » sans transformer l'outil en surveillance
   du contenu.
   ============================================================ */
import { useNavigate } from 'react-router-dom';
import { Carte, Entete, Etat, Surtitre } from '../../ui/base';
import { Icone } from '../../ui/Icone';
import { quandLire, useJournal } from '../../services/moderation';

export function AdminJournal() {
  const aller = useNavigate();
  const { data: passages, isPending, error } = useJournal();

  return (
    <>
      <Entete titre="Journal d’accès" retour={() => aller('/admin')} />

      <div
        style={{
          flexGrow: 1,
          padding: '18px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <Carte style={{ background: 'var(--vert-clair)', borderColor: '#C4D9CC' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Icone nom="eyeOff" taille={20} couleur="#0F5132" />
            <p style={{ fontSize: 12.5, lineHeight: '18px', color: '#12613C' }}>
              Seules les ouvertures de l’espace des maîtres sont consignées. Consigner chaque
              conversation ferait un registre de la vie de tout le monde. Le journal dit qui
              est entré et quand — jamais ce qui a été lu.
            </p>
          </div>
        </Carte>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Les cent derniers passages</Surtitre>
          <Etat
            chargement={isPending}
            erreur={error}
            vide={(passages ?? []).length === 0}
            messageVide="Aucun passage enregistré."
          >
            <div className="list">
              {(passages ?? []).map((p) => (
                <div key={p.id} className="listrow">
                  <span style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                    <b style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>
                      {p.membre ? `${p.membre.nom} ${p.membre.prenom}` : 'Membre supprimé'}
                    </b>
                    <span style={{ display: 'block', fontSize: 12.5, color: '#59685F' }}>
                      {p.membre?.numero}
                      {p.salon?.titre ? ` · ${p.salon.titre}` : ''}
                    </span>
                    <span style={{ display: 'block', fontSize: 12, color: '#7C8B82', marginTop: 2 }}>
                      {p.quoi}
                    </span>
                  </span>
                  <span style={{ fontSize: 12, color: '#7C8B82', flex: 'none' }}>
                    {quandLire(p.quand)}
                  </span>
                </div>
              ))}
            </div>
          </Etat>
        </div>

        <div className="warn">
          <i />
          <p>
            Le journal est écrit par le serveur et ne se modifie pas depuis l’application :
            un registre qu’on peut corriger ne prouve rien.
          </p>
        </div>
      </div>
    </>
  );
}
