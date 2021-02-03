git branch -D ghpages
git checkout -b ghpages
del .gitignore
move .gitignore.ghpages .gitignore
cmd /C npm run build
git describe --tags --match v* > build/build_version.txt
git add -A
git commit -m "build GitHub Pages"
git push -f origin ghpages
git checkout main