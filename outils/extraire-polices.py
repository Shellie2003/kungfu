#!/usr/bin/env python3
"""
css/fonts.css  →  mobile/assets/polices/*.ttf

Les polices de la maquette sont embarquées en base64, au format
woff2 et en version variable. React Native ne sait lire ni le woff2
ni les axes variables : il lui faut des TTF, un fichier par graisse.

On extrait donc les mêmes fichiers — pas d'autres, sinon
l'application ne s'afficherait plus comme ce qui a été validé — on
les convertit, et on fige deux graisses par famille : 400 pour le
texte, 700 pour les titres.

    python3 outils/extraire-polices.py
"""
import base64
import re
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SOURCE = Path("css/fonts.css")
CIBLE = Path("mobile/assets/polices")

# Les graisses relevées dans la maquette : 400, 500, 600 et 700.
# Une de plus serait un fichier de plus dans l'APK pour rien ; une de
# moins et Android remplacerait par une graisse approchante, ce qui
# se voit immédiatement sur les titres.
#
# Le suffixe devient un nom de famille à part entière. C'est
# obligatoire sur Android : fontWeight ne choisit pas parmi des
# fichiers embarqués, il faut nommer la famille voulue.
GRAISSES = {400: "", 500: "-Medium", 600: "-SemiBold", 700: "-Bold"}


def familles(css: str) -> dict[str, str]:
    """Rend {nom de famille: base64} pour chaque @font-face trouvée."""
    out = {}
    for bloc in re.findall(r"@font-face\s*\{(.*?)\}", css, re.S):
        nom = re.search(r"font-family:\s*['\"]([^'\"]+)", bloc)
        b64 = re.search(r"base64,([A-Za-z0-9+/=]+)", bloc)
        if nom and b64:
            out[nom.group(1)] = b64.group(1)
    return out


def main() -> int:
    if not SOURCE.exists():
        print(f"{SOURCE} introuvable", file=sys.stderr)
        return 1

    trouvees = familles(SOURCE.read_text(encoding="utf-8"))
    if not trouvees:
        print("Aucune @font-face avec du base64 dans css/fonts.css", file=sys.stderr)
        return 1

    CIBLE.mkdir(parents=True, exist_ok=True)
    ecrits = []

    for nom, b64 in trouvees.items():
        police = TTFont(io_bytes(base64.b64decode(b64)))

        variable = "fvar" in police
        for poids, suffixe in GRAISSES.items():
            fichier = CIBLE / f"{nom}{suffixe}.ttf"
            if variable:
                fige = instantiateVariableFont(
                    TTFont(io_bytes(base64.b64decode(b64))), {"wght": poids}
                )
            else:
                fige = TTFont(io_bytes(base64.b64decode(b64)))
            # flavor à None : on écrit du TTF nu, pas du woff2.
            fige.flavor = None
            # Le nom interne suit le fichier : sans cela les quatre
            # graisses se déclarent sous le même nom et le système
            # peut en choisir une au hasard.
            for enregistrement in fige["name"].names:
                if enregistrement.nameID in (1, 4, 6):
                    enregistrement.string = f"{nom}{suffixe}"
                elif enregistrement.nameID == 2:
                    enregistrement.string = suffixe.lstrip("-") or "Regular"
            fige.save(fichier)
            ecrits.append((fichier, poids, variable))

    # Vérification : on relit chaque fichier produit. Une police que
    # l'on n'a pas rouverte est un fichier, pas une police — et
    # l'erreur ne se verrait qu'au démarrage sur le téléphone.
    print(f"{len(ecrits)} fichiers dans {CIBLE}/")
    for fichier, poids, variable in ecrits:
        f = TTFont(fichier)
        nom_interne = f["name"].getDebugName(1)
        axes = "figée depuis une variable" if variable else "statique"
        assert "glyf" in f or "CFF " in f, f"{fichier} ne contient aucun contour"
        assert f["head"].unitsPerEm > 0
        ko = fichier.stat().st_size / 1024
        print(f"  {fichier.name:22} {nom_interne:16} poids {poids}  {axes}  {ko:.0f} Ko")

    return 0


def io_bytes(donnees: bytes):
    import io

    return io.BytesIO(donnees)


if __name__ == "__main__":
    raise SystemExit(main())
