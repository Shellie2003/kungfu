/* Squelette provisoire, le temps de vérifier que la chaîne tient :
   Vite lit bien la feuille de la maquette, Tailwind ajoute ses
   jetons par-dessus, et Capacitor empaquette le tout. */
export default function App() {
  return (
    <div className="phone">
      <div className="apphead">
        <span style={{ width: 12 }} />
        <h1 className="apphead__title">Kung-fu Waishi</h1>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card">
          <p style={{ fontSize: 15, lineHeight: '22px' }}>
            La feuille de la maquette est lue directement : cette carte emploie
            <code> .card</code>, sans qu’une seule ligne ait été recopiée.
          </p>
        </div>
        <button className="btn btn--primary">Un bouton de la maquette</button>
        <p className="text-vert-texte font-texte text-sm">
          Et cette ligne emploie Tailwind, dont le thème vient des mêmes jetons.
        </p>
      </div>
    </div>
  );
}
