Modifier/tester de mon coter :
- ouvrir XAMPP
- démarer apache


faire des modifications du code sur github:

- créer une nouvelle branche:

1 - etre sur main (pas nécessairement)
2 - ajouter une branch est la nomer
3 - push la branch (met sur github la nouvelle branch sur laquelle on travaille, permet d'informer les collaborateurs)
4 - faire des commits réguliers après des chagements "définitifs"
5 - push possible après chaques commit, pas nécessaire
6 - accepter la pull-request apres avoir push le(s) dernier(s) commit
7 - merge automatique
8 - synchronisation du rpi automatique


--------------------------------------------------------------------------------------------------------------------------------------------------------

__**Algo de code :**__
```
PRE-CODE
1 - démarrer le pc 💀
2 - lancer vscode et ouvrir le dossier contenant le repo github
3 - si tu es en train de mofifier une branche, et que tu veux la modifier : passer à l'étape 8 
4 - si tu es sur la branche main : passer à l'étape 6 
5 - basculer sur la branche main (branch -> checkout to -> main)
6 - pull (ou sync)
7 - créer une nouvelle branche (branch -> create) si possible un nom en rapport avec sa fonction
CODE
8 - modifier le code (ne pas oublier de commit régulièrement, ne pas push trop souvent, voir note 1)
POST-CODE
9 - push / publier branche
```

BONUS : videos pour bien comprendre github :
Rapidement - https://www.youtube.com/watch?v=hwP7WQkmECE (/!\ voir note 2)
Plus en détails - https://www.youtube.com/watch?v=HkdAHXoRtos

***note 1 :** toutes les modifications que tu commit peuvent êtres annulées tant qu'elles n'ont pas été push car ce sont des modifs locales uniquement. Il faut donc éviter de push trop souvent, ça ne change rien de garder des commits uniquement locaux, le seul désavantage c'est que si ta machine se casse, les modifs seronts perdues (si on ne peut pas sauver le disque)*

***note 2 : **bien que dans la video il est indiqué que l'on merge depuis la console / vscode, nous on optera pour le faire depuis le site de github à l'aide d'une pull request pour que l'un puisse demander une review à l'autre par exemple, ou des conseils, voir si ça convient, etc...*