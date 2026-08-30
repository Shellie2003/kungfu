/* ============================================================
   10 · Le Club

   Presque tout ce qu'on lit ici vient de la base : le responsable
   change, le téléphone change, l'adresse change, les jours
   d'entraînement changent. « Mety modifiena » — le club doit
   pouvoir le corriger lui-même, sans nouvelle version.

   Les valeurs, elles, sont écrites : elles ne changent pas, et les
   mettre en base aurait donné un écran d'administration de plus
   pour rien.
   ============================================================ */
import { useNavigate } from 'react-router-dom';
import { Icone } from '../ui/Icone';
import { Carte, Entete, Surtitre, Tuile, Filet } from '../ui/base';
import { heure, nomDuJour, useHoraires, useReglages } from '../services/club';

const VALEURS: [string, string][] = [
  ['Respect', 'Du maître, des partenaires, du lieu.'],
  ['Constance', 'La progression vient de la régularité.'],
  ['Entraide', 'Les anciens accompagnent les nouveaux.']
];

export function Club() {
  const aller = useNavigate();
  const { data: horaires } = useHoraires();
  const { data: reglages } = useReglages();

  const contacts: [string, string, string][] = [
    ['users', reglages?.responsable ?? '[NOM À FOURNIR]', 'Responsable du club'],
    ['phone', reglages?.telephone ?? '[NUMÉRO À FOURNIR]', 'Téléphone'],
    ['pin', reglages?.adresse ?? '[ADRESSE EXACTE À FOURNIR]', 'Analamahitsy, Antananarivo']
  ];

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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            textAlign: 'center'
          }}
        >
          <div className="emblem emblem--lg">
            <Icone nom="shield" taille={34} couleur="#0F5132" />
          </div>
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Présentation</Surtitre>
          <Carte>
            <p style={{ fontSize: 15, lineHeight: '25px', color: '#3C4A42' }}>
              {reglages?.presentation ??
                'Le club enseigne le Kung-fu Waishi à Analamahitsy. Il accueille enfants, adolescents et adultes, du débutant au gradé, autour d’une pratique régulière et d’un esprit d’entraide.'}
            </p>
          </Carte>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Surtitre>Valeurs</Surtitre>
          {VALEURS.map(([t, d]) => (
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
            <span className="modif">Modifiable par l’administration</span>
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
            <span className="modif">Modifiable par l’administration</span>
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
      </div>
    </>
  );
}
