# La clé de signature de développement

`debug.keystore` est versionné **à dessein**. Ce n'est pas un oubli.

## Pourquoi il est dans le dépôt

Gradle signe les versions de débogage avec `~/.android/debug.keystore`, qu'il
**fabrique tout seul** au premier lancement s'il n'existe pas. Sur un coureur GitHub,
la machine est neuve à chaque construction : la clé serait donc différente à chaque
fois, et Android refuserait d'installer la nouvelle version par-dessus l'ancienne —
« application non installée », sans autre explication. Le club devrait désinstaller à
chaque mise à jour, et **perdrait sa session à chaque fois**.

Cette clé-ci est fixe, valide jusqu'en 2056. Le workflow la copie à la place de celle
que Gradle aurait engendrée, et la signature reste donc la même d'une construction à
l'autre.

## Ce qu'elle ne protège pas, et il faut le savoir

Son mot de passe est `android`, qui est la convention Android et figure en clair dans
le workflow. **N'importe qui peut donc signer un APK avec cette clé.** Concrètement :
quelqu'un pourrait fabriquer une application qui s'installe par-dessus celle du club
comme si c'était une mise à jour.

C'était déjà vrai de la clé de débogage d'Expo qu'employait la version précédente, et
qui est la même pour tous les projets Expo du monde. Celle-ci est au moins propre au
club.

Ce que cela veut dire en pratique : **l'APK ne doit circuler que par un canal de
confiance** — le WhatsApp du club, envoyé par le responsable. Pas un lien public, pas
un site de téléchargement d'APK.

## Le jour de la publication

Le Play Store refuse une clé de débogage. Il faudra alors une vraie clé :

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore waishi-club.keystore -alias waishi \
  -keyalg RSA -keysize 2048 -validity 10000
```

Celle-là ne se versionne **jamais**, ne circule **jamais**, et ne se perd surtout
jamais : **la perdre, c'est perdre définitivement la possibilité de mettre
l'application à jour sur le Play Store.** Elle se range dans les secrets du dépôt, en
base64.

Ce jour-là, la signature changera : l'application devra être **désinstallée une fois**
sur chaque téléphone. C'est une gêne unique, à prévoir dans le passage en production.

## L'empreinte, pour contrôle

```
SHA256: A6:02:3C:36:4A:06:D2:D9:BF:AB:5F:3A:CC:87:D8:28:61:92:9A:6F:63:E7:BA:0C:FA:71:44:4E:28:B3:FD:3A
```

Le workflow la vérifie avant de construire. Si elle change, c'est que le fichier a été
remplacé — et les mises à jour cesseraient de s'installer par-dessus sans prévenir.
