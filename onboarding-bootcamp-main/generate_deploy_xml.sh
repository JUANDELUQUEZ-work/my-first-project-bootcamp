#!/bin/bash
# 1. Obtener lista de archivos modificados en el último commit
FILES=$(git diff --name-only HEAD~1 HEAD)

# 2. Empezar a construir el deploy.xml
echo '<?xml version="1.0" encoding="UTF-8"?>' > deploy.xml
echo '<deploy>' >> deploy.xml
echo '  <configuration>' >> deploy.xml
echo '    <path>~/AccountConfiguration/*</path>' >> deploy.xml
echo '  </configuration>' >> deploy.xml
echo '  <files>' >> deploy.xml

# 3. Agregar solo los archivos de SuiteScripts que cambiaron
for file in $FILES; do
  if [[ $file == src/FileCabinet/SuiteScripts/* ]]; then
    # Limpiar la ruta para que coincida con la estructura de NetSuite
    NS_PATH=${file#src/}
    echo "    <path>~/$NS_PATH</path>" >> deploy.xml
  fi
done

echo '  </files>' >> deploy.xml
echo '  <objects>' >> deploy.xml

# 4. Agregar solo los objetos XML que cambiaron
for file in $FILES; do
  if [[ $file == src/Objects/* ]]; then
    NS_PATH=${file#src/}
    echo "    <path>~/$NS_PATH</path>" >> deploy.xml
  fi
done

echo '  </objects>' >> deploy.xml
echo '</deploy>' >> deploy.xml