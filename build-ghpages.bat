git branch -D ghpages
git checkout -b ghpages
del .gitignore
move .gitignore.ghpages .gitignore
cmd /C npm run build
git add -A
git commit -m "build GitHub Pages"
git push -f origin ghpages
git checkout main