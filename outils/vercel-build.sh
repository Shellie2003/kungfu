#!/usr/bin/env bash
# ============================================================
# Construit la version WEB de l'application — celle qui vit à
# l'adresse /essai, et qui permet d'essayer sans rien installer.
#
# Pourquoi un fichier plutôt qu'une ligne dans vercel.json
# --------------------------------------------------------
# Le champ « buildCommand » de vercel.json est plafonné à 256
# caractères. La commande y avait grossi jusqu'à 460, et Vercel
# refusait alors le déploiement AVANT de construire quoi que ce
# soit : « schema validation failed ». Aucun journal de
# construction, aucune ligne rouge dans les fichiers du projet —
# rien qu'un état « ERROR » sur le tableau de bord.
#
# Le site n'a donc plus été mis à jour à partir du 30 août, en
# silence, pendant que l'APK, lui, continuait de sortir. Un script
# n'a pas de limite de longueur, se lit, et se corrige.
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

cd app

# --- Le serveur auquel l'application parlera ---
#
# Les variables d'environnement du projet Vercel l'emportent : c'est
# ainsi que le club branchera SON serveur sans toucher au dépôt. À
# défaut, on retombe sur le projet d'essai, dont l'adresse et la clé
# publiable sont dans .env.essai — versionné, et sans danger tant
# qu'aucune donnée réelle du club n'y entre.
if [ -n "${VITE_SUPABASE_URL:-}" ] && [ -n "${VITE_SUPABASE_CLE:-}" ]; then
  printf 'VITE_SUPABASE_URL=%s\nVITE_SUPABASE_CLE=%s\n' \
    "$VITE_SUPABASE_URL" "$VITE_SUPABASE_CLE" > .env
  echo "Serveur : celui des variables du projet."
else
  cp .env.essai .env
  echo "Serveur : le projet d'essai (.env.essai)."
fi

# Le typage AVANT la construction : Vite construit sans se plaindre
# d'une erreur de type, et l'on publierait un écran cassé.
npx tsc --noEmit

# La sortie s'appelle « essai/ » à la racine du dépôt : c'est ce qui
# donne l'adresse /essai, à côté de la maquette.
npx vite build --outDir ../essai --emptyOutDir

# Une construction qui « réussit » sans produire de page est un piège
# connu : le site répondrait 404 sans que rien n'ait échoué.
test -f ../essai/index.html

# La version publiée, lisible depuis un téléphone : sans elle, on ne
# peut pas savoir si l'écran qu'on regarde porte la correction qu'on
# vient de pousser.
printf '%s\n' "${VERCEL_GIT_COMMIT_SHA:-inconnu}" > ../essai/version.txt

echo "essai/ prêt :"
ls ../essai
